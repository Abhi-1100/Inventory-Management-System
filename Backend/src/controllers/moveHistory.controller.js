const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.list = async (req, res) => {
  const { type, productId, locationId, from, to, page = 1, limit = 50 } = req.query;
  const where = {};
  if (type) where.referenceType = type.toUpperCase();
  if (productId) where.productId = productId;
  if (locationId) where.locationId = locationId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + 'T23:59:59');
  }

  const [entries, total] = await prisma.$transaction([
    prisma.stockLedger.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        location: { include: { warehouse: true } },
      },
    }),
    prisma.stockLedger.count({ where }),
  ]);

  const opIds = [...new Set(entries.map((e) => e.referenceId))];
  const ops = await prisma.operation.findMany({
    where: { id: { in: opIds } },
    select: {
      id: true,
      referenceNo: true,
      status: true,
      sourceLocation: { select: { id: true, name: true } },
      destLocation: { select: { id: true, name: true } },
    },
  });
  const opMap = Object.fromEntries(ops.map((o) => [o.id, o]));

  const data = entries.map((e) => {
    const op = opMap[e.referenceId];
    const qc = Number(e.quantityChange);
    return {
      id: e.id,
      createdAt: e.createdAt,
      referenceNo: op?.referenceNo ?? e.referenceId,
      type: e.referenceType.toLowerCase(),
      product: { id: e.product.id, name: e.product.name, sku: e.product.sku },
      fromLocation:
        qc < 0
          ? { id: e.location.id, name: e.location.name }
          : op?.sourceLocation ?? null,
      toLocation:
        qc > 0
          ? { id: e.location.id, name: e.location.name }
          : op?.destLocation ?? null,
      quantityChange: qc,
      status: op?.status.toLowerCase() ?? 'done',
    };
  });

  res.json({ data, total, page: Number(page), limit: Number(limit) });
};
