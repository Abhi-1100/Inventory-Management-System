const { PrismaClient } = require('@prisma/client');
const { generateReferenceNo } = require('../utils/referenceNo');
const { adjustStock } = require('../services/stock.service');
const prisma = new PrismaClient();

// GET /api/operations/adjustments/prefill?productId=&locationId=
exports.prefill = async (req, res) => {
  const { productId, locationId } = req.query;
  const stock = await prisma.stock.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });
  res.json({ productId, locationId, systemQty: stock ? Number(stock.quantityOnHand) : 0 });
};

exports.list = async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const where = { type: 'ADJUSTMENT' };
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
    location: o.sourceLocation
      ? { id: o.sourceLocation.id, name: o.sourceLocation.name }
      : o.destLocation
        ? { id: o.destLocation.id, name: o.destLocation.name }
        : null,
    scheduledDate: o.scheduledDate?.toISOString().split('T')[0] ?? null,
    createdAt: o.createdAt,
  }));
  res.json({ data, total, page: Number(page), limit: Number(limit) });
};

exports.create = async (req, res) => {
  const { locationId, scheduledDate, lines } = req.body;
  const referenceNo = await generateReferenceNo('ADJUSTMENT');
  const op = await prisma.operation.create({
    data: {
      type: 'ADJUSTMENT',
      referenceNo,
      sourceLocationId: locationId,
      destLocationId: locationId,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      createdById: req.user.id,
      lines: {
        create: lines.map((l) => ({
          productId: l.productId,
          doneQty: l.countedQty,
          note: l.note,
        })),
      },
    },
    include: {
      lines: { include: { product: true } },
      sourceLocation: true,
    },
  });
  // Build response with systemQty info
  const responseLines = await Promise.all(
    op.lines.map(async (l) => {
      const stock = await prisma.stock.findUnique({
        where: { productId_locationId: { productId: l.productId, locationId } },
      });
      const systemQty = stock ? Number(stock.quantityOnHand) : 0;
      const countedQty = Number(l.doneQty);
      return {
        id: l.id,
        product: {
          id: l.product.id,
          name: l.product.name,
          sku: l.product.sku,
          unitOfMeasure: l.product.unitOfMeasure,
        },
        systemQty,
        countedQty,
        difference: countedQty - systemQty,
        note: l.note,
      };
    })
  );
  res.status(201).json({
    id: op.id,
    referenceNo: op.referenceNo,
    status: op.status.toLowerCase(),
    location: op.sourceLocation
      ? { id: op.sourceLocation.id, name: op.sourceLocation.name }
      : null,
    scheduledDate: op.scheduledDate?.toISOString().split('T')[0] ?? null,
    lines: responseLines,
    createdAt: op.createdAt,
    updatedAt: op.updatedAt,
  });
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
  const locationId = op.sourceLocationId ?? op.destLocationId;
  const lines = await Promise.all(
    op.lines.map(async (l) => {
      const stock = await prisma.stock.findUnique({
        where: { productId_locationId: { productId: l.productId, locationId } },
      });
      const systemQty = stock ? Number(stock.quantityOnHand) : 0;
      const countedQty = Number(l.doneQty);
      return {
        id: l.id,
        product: {
          id: l.product.id,
          name: l.product.name,
          sku: l.product.sku,
          unitOfMeasure: l.product.unitOfMeasure,
        },
        systemQty,
        countedQty,
        difference: countedQty - systemQty,
        note: l.note,
      };
    })
  );
  const location = op.sourceLocation ?? op.destLocation;
  res.json({
    id: op.id,
    referenceNo: op.referenceNo,
    status: op.status.toLowerCase(),
    location: location ? { id: location.id, name: location.name } : null,
    scheduledDate: op.scheduledDate?.toISOString().split('T')[0] ?? null,
    lines,
    createdAt: op.createdAt,
    updatedAt: op.updatedAt,
  });
};

exports.update = async (req, res) => {
  const op = await prisma.operation.findUniqueOrThrow({ where: { id: req.params.id } });
  if (['DONE', 'CANCELLED'].includes(op.status)) {
    return res.status(403).json({ error: 'Cannot edit a done or cancelled operation', code: 'FORBIDDEN' });
  }
  const { locationId, scheduledDate, lines } = req.body;
  const updated = await prisma.$transaction([
    prisma.operationLine.deleteMany({ where: { operationId: req.params.id } }),
    prisma.operation.update({
      where: { id: req.params.id },
      data: {
        sourceLocationId: locationId,
        destLocationId: locationId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            doneQty: l.countedQty,
            note: l.note,
          })),
        },
      },
      include: {
        lines: { include: { product: true } },
        sourceLocation: true,
      },
    }),
  ]);
  const updatedOp = updated[1];
  const lid = updatedOp.sourceLocationId;
  const responseLines = await Promise.all(
    updatedOp.lines.map(async (l) => {
      const stock = await prisma.stock.findUnique({
        where: { productId_locationId: { productId: l.productId, locationId: lid } },
      });
      const systemQty = stock ? Number(stock.quantityOnHand) : 0;
      const countedQty = Number(l.doneQty);
      return {
        id: l.id,
        product: {
          id: l.product.id,
          name: l.product.name,
          sku: l.product.sku,
          unitOfMeasure: l.product.unitOfMeasure,
        },
        systemQty,
        countedQty,
        difference: countedQty - systemQty,
        note: l.note,
      };
    })
  );
  res.json({
    id: updatedOp.id,
    referenceNo: updatedOp.referenceNo,
    status: updatedOp.status.toLowerCase(),
    location: updatedOp.sourceLocation
      ? { id: updatedOp.sourceLocation.id, name: updatedOp.sourceLocation.name }
      : null,
    scheduledDate: updatedOp.scheduledDate?.toISOString().split('T')[0] ?? null,
    lines: responseLines,
    createdAt: updatedOp.createdAt,
    updatedAt: updatedOp.updatedAt,
  });
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
  const locationId = op.sourceLocationId ?? op.destLocationId;
  await prisma.$transaction(async (tx) => {
    for (const line of op.lines) {
      const countedQty = Number(line.doneQty);
      await adjustStock(tx, {
        productId: line.productId,
        locationId,
        countedQty,
        referenceId: op.id,
      });
    }
    await tx.operation.update({ where: { id: op.id }, data: { status: 'DONE' } });
  });
  res.json({ message: 'Adjustment validated', status: 'done' });
};

exports.cancel = async (req, res) => {
  const op = await prisma.operation.findUniqueOrThrow({ where: { id: req.params.id } });
  if (op.status === 'DONE')
    return res.status(400).json({ error: 'Cannot cancel a done operation', code: 'BAD_REQUEST' });
  await prisma.operation.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
  res.json({ message: 'Adjustment cancelled', status: 'cancelled' });
};
