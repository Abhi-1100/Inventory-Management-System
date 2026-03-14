const { PrismaClient } = require('@prisma/client');
const { generateReferenceNo } = require('../utils/referenceNo');
const { decreaseStock } = require('../services/stock.service');
const prisma = new PrismaClient();

exports.list = async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const where = { type: 'DELIVERY' };
  if (status) where.status = status.toUpperCase();
  if (search)
    where.OR = [
      { referenceNo: { contains: search, mode: 'insensitive' } },
      { supplierOrCustomer: { contains: search, mode: 'insensitive' } },
    ];
  const [ops, total] = await prisma.$transaction([
    prisma.operation.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { sourceLocation: true },
    }),
    prisma.operation.count({ where }),
  ]);
  const data = ops.map((o) => ({
    id: o.id,
    referenceNo: o.referenceNo,
    status: o.status.toLowerCase(),
    customerName: o.supplierOrCustomer,
    sourceLocation: o.sourceLocation
      ? { id: o.sourceLocation.id, name: o.sourceLocation.name }
      : null,
    scheduledDate: o.scheduledDate?.toISOString().split('T')[0] ?? null,
    createdAt: o.createdAt,
  }));
  res.json({ data, total, page: Number(page), limit: Number(limit) });
};

exports.create = async (req, res) => {
  const { customerName, sourceLocationId, scheduledDate, lines } = req.body;
  const referenceNo = await generateReferenceNo('DELIVERY');
  const op = await prisma.operation.create({
    data: {
      type: 'DELIVERY',
      referenceNo,
      supplierOrCustomer: customerName,
      sourceLocationId,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      createdById: req.user.id,
      lines: {
        create: lines.map((l) => ({
          productId: l.productId,
          demandQty: l.demandQty,
          doneQty: l.doneQty,
        })),
      },
    },
    include: { lines: { include: { product: true } }, sourceLocation: true },
  });
  res.status(201).json(formatDelivery(op));
};

exports.getOne = async (req, res) => {
  const op = await prisma.operation.findUniqueOrThrow({
    where: { id: req.params.id },
    include: { lines: { include: { product: true } }, sourceLocation: true },
  });
  res.json(formatDelivery(op));
};

exports.update = async (req, res) => {
  const op = await prisma.operation.findUniqueOrThrow({ where: { id: req.params.id } });
  if (['DONE', 'CANCELLED'].includes(op.status)) {
    return res.status(403).json({ error: 'Cannot edit a done or cancelled operation', code: 'FORBIDDEN' });
  }
  const { customerName, sourceLocationId, scheduledDate, lines } = req.body;
  const updated = await prisma.$transaction([
    prisma.operationLine.deleteMany({ where: { operationId: req.params.id } }),
    prisma.operation.update({
      where: { id: req.params.id },
      data: {
        supplierOrCustomer: customerName,
        sourceLocationId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            demandQty: l.demandQty,
            doneQty: l.doneQty,
          })),
        },
      },
      include: { lines: { include: { product: true } }, sourceLocation: true },
    }),
  ]);
  res.json(formatDelivery(updated[1]));
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
  const totalDone = op.lines.reduce((s, l) => s + Number(l.doneQty), 0);
  if (totalDone === 0)
    return res.status(400).json({ error: 'All done quantities are zero', code: 'BAD_REQUEST' });
  await prisma.$transaction(async (tx) => {
    for (const line of op.lines) {
      if (Number(line.doneQty) <= 0) continue;
      await decreaseStock(tx, {
        productId: line.productId,
        locationId: op.sourceLocationId,
        qty: Number(line.doneQty),
        referenceType: 'DELIVERY',
        referenceId: op.id,
      });
    }
    await tx.operation.update({ where: { id: op.id }, data: { status: 'DONE' } });
  });
  res.json({ message: 'Delivery validated', status: 'done' });
};

exports.cancel = async (req, res) => {
  const op = await prisma.operation.findUniqueOrThrow({ where: { id: req.params.id } });
  if (op.status === 'DONE')
    return res.status(400).json({ error: 'Cannot cancel a done operation', code: 'BAD_REQUEST' });
  await prisma.operation.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
  res.json({ message: 'Delivery cancelled', status: 'cancelled' });
};

function formatDelivery(op) {
  return {
    id: op.id,
    referenceNo: op.referenceNo,
    status: op.status.toLowerCase(),
    customerName: op.supplierOrCustomer,
    sourceLocation: op.sourceLocation
      ? { id: op.sourceLocation.id, name: op.sourceLocation.name }
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
        demandQty: Number(l.demandQty),
        doneQty: Number(l.doneQty),
      })) ?? [],
    createdAt: op.createdAt,
    updatedAt: op.updatedAt,
  };
}
