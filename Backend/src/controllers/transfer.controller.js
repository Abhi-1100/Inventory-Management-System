const { PrismaClient } = require('@prisma/client');
const { generateReferenceNo } = require('../utils/referenceNo');
const { increaseStock, decreaseStock } = require('../services/stock.service');
const prisma = new PrismaClient();

exports.list = async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const where = { type: 'TRANSFER' };
  if (status) where.status = status.toUpperCase();
  if (search)
    where.OR = [{ referenceNo: { contains: search, mode: 'insensitive' } }];
  const [ops, total] = await prisma.$transaction([
    prisma.operation.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { sourceLocation: true, destLocation: true },
    }),
    prisma.operation.count({ where }),
  ]);
  const data = ops.map((o) => ({
    id: o.id,
    referenceNo: o.referenceNo,
    status: o.status.toLowerCase(),
    sourceLocation: o.sourceLocation
      ? { id: o.sourceLocation.id, name: o.sourceLocation.name }
      : null,
    destLocation: o.destLocation
      ? { id: o.destLocation.id, name: o.destLocation.name }
      : null,
    scheduledDate: o.scheduledDate?.toISOString().split('T')[0] ?? null,
    createdAt: o.createdAt,
  }));
  res.json({ data, total, page: Number(page), limit: Number(limit) });
};

exports.create = async (req, res) => {
  const { sourceLocationId, destLocationId, scheduledDate, lines } = req.body;
  const referenceNo = await generateReferenceNo('TRANSFER');
  const op = await prisma.operation.create({
    data: {
      type: 'TRANSFER',
      referenceNo,
      sourceLocationId,
      destLocationId,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      createdById: req.user.id,
      lines: {
        create: lines.map((l) => ({
          productId: l.productId,
          demandQty: l.qty,
          doneQty: l.qty,
        })),
      },
    },
    include: {
      lines: { include: { product: true } },
      sourceLocation: true,
      destLocation: true,
    },
  });
  res.status(201).json(formatTransfer(op));
};

exports.getOne = async (req, res) => {
  const op = await prisma.operation.findUniqueOrThrow({
    where: { id: req.params.id },
    include: {
      lines: { include: { product: true } },
      sourceLocation: true,
      destLocation: true,
    },
  });
  res.json(formatTransfer(op));
};

exports.update = async (req, res) => {
  const op = await prisma.operation.findUniqueOrThrow({ where: { id: req.params.id } });
  if (['DONE', 'CANCELLED'].includes(op.status)) {
    return res.status(403).json({ error: 'Cannot edit a done or cancelled operation', code: 'FORBIDDEN' });
  }
  const { sourceLocationId, destLocationId, scheduledDate, lines } = req.body;
  const updated = await prisma.$transaction([
    prisma.operationLine.deleteMany({ where: { operationId: req.params.id } }),
    prisma.operation.update({
      where: { id: req.params.id },
      data: {
        sourceLocationId,
        destLocationId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            demandQty: l.qty,
            doneQty: l.qty,
          })),
        },
      },
      include: {
        lines: { include: { product: true } },
        sourceLocation: true,
        destLocation: true,
      },
    }),
  ]);
  res.json(formatTransfer(updated[1]));
};

exports.validate = async (req, res) => {
  const op = await prisma.operation.findUniqueOrThrow({
    where: { id: req.params.id },
    include: { lines: true },
  });
  if (op.status === 'DONE')
    return res.status(400).json({ error: 'Already validated', code: 'BAD_REQUEST' });
  if (op.status === 'CANCELLED')
    return res.status(400).json({ error: 'Cannot validate a cancelled operation', code: 'BAD_REQUEST' });
  const totalQty = op.lines.reduce((s, l) => s + Number(l.doneQty), 0);
  if (totalQty === 0)
    return res.status(400).json({ error: 'All done quantities are zero', code: 'BAD_REQUEST' });
  await prisma.$transaction(async (tx) => {
    for (const line of op.lines) {
      const qty = Number(line.doneQty);
      if (qty <= 0) continue;
      await decreaseStock(tx, {
        productId: line.productId,
        locationId: op.sourceLocationId,
        qty,
        referenceType: 'TRANSFER',
        referenceId: op.id,
        note: `Transfer to ${op.destLocationId}`,
      });
      await increaseStock(tx, {
        productId: line.productId,
        locationId: op.destLocationId,
        qty,
        referenceType: 'TRANSFER',
        referenceId: op.id,
        note: `Transfer from ${op.sourceLocationId}`,
      });
    }
    await tx.operation.update({ where: { id: op.id }, data: { status: 'DONE' } });
  });
  res.json({ message: 'Transfer validated', status: 'done' });
};

exports.cancel = async (req, res) => {
  const op = await prisma.operation.findUniqueOrThrow({ where: { id: req.params.id } });
  if (op.status === 'DONE')
    return res.status(400).json({ error: 'Cannot cancel a done operation', code: 'BAD_REQUEST' });
  await prisma.operation.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
  res.json({ message: 'Transfer cancelled', status: 'cancelled' });
};

function formatTransfer(op) {
  return {
    id: op.id,
    referenceNo: op.referenceNo,
    status: op.status.toLowerCase(),
    sourceLocation: op.sourceLocation
      ? { id: op.sourceLocation.id, name: op.sourceLocation.name }
      : null,
    destLocation: op.destLocation
      ? { id: op.destLocation.id, name: op.destLocation.name }
      : null,
    scheduledDate: op.scheduledDate?.toISOString().split('T')[0] ?? null,
    lines:
      op.lines?.map((l) => ({
        id: l.id,
        product: {
          id: l.product.id,
          name: l.product.name,
          sku: l.product.sku,
          unitOfMeasure: l.product.unitOfMeasure,
        },
        qty: Number(l.doneQty),
      })) ?? [],
    createdAt: op.createdAt,
    updatedAt: op.updatedAt,
  };
}
