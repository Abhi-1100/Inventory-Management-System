const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getKPIs = async (req, res) => {
  const [allStock, reorderRules, pendingReceipts, pendingDeliveries, scheduledTransfers] =
    await prisma.$transaction([
      prisma.stock.findMany({ include: { product: true } }),
      prisma.reorderRule.findMany(),
      prisma.operation.count({
        where: { type: 'RECEIPT', status: { in: ['DRAFT', 'WAITING', 'READY'] } },
      }),
      prisma.operation.count({
        where: { type: 'DELIVERY', status: { in: ['DRAFT', 'WAITING', 'READY'] } },
      }),
      prisma.operation.count({
        where: { type: 'TRANSFER', status: { in: ['DRAFT', 'WAITING', 'READY'] } },
      }),
    ]);

  const productStockMap = {};
  for (const s of allStock) {
    productStockMap[s.productId] = (productStockMap[s.productId] || 0) + Number(s.quantityOnHand);
  }
  const totalProductsInStock = Object.values(productStockMap).filter((v) => v > 0).length;
  const outOfStockItems = Object.values(productStockMap).filter((v) => v === 0).length;

  const lowStockSet = new Set();
  for (const s of allStock) {
    const rule = reorderRules.find(
      (r) => r.productId === s.productId && r.locationId === s.locationId
    );
    if (rule && Number(s.quantityOnHand) <= Number(rule.minQty) && Number(s.quantityOnHand) > 0) {
      lowStockSet.add(s.productId);
    }
  }

  res.json({
    totalProductsInStock,
    lowStockItems: lowStockSet.size,
    outOfStockItems,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers,
  });
};
