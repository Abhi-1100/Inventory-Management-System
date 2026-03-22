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

exports.getStockMovement = async (req, res) => {
  // Simplistic approach: Group stock ledger entries by day over the last 30 days.
  // We'll return the daily net change, and frontend can calculate the curve.
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ledgers = await prisma.stockLedger.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, quantityChange: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date string (YYYY-MM-DD)
  const dailyChanges = {};
  for (const l of ledgers) {
    const dateStr = l.createdAt.toISOString().split('T')[0];
    dailyChanges[dateStr] = (dailyChanges[dateStr] || 0) + Number(l.quantityChange);
  }

  // To draw a proper chart of total stock over time, we ideally need the current total stock,
  // and subtract backwards. Let's send the current total stock and the daily changes.
  const allStock = await prisma.stock.findMany();
  let currentTotalQuantity = allStock.reduce((acc, s) => acc + Number(s.quantityOnHand), 0);

  res.json({
    currentTotalQuantity,
    dailyChanges,
  });
};

exports.getInventoryAlerts = async (req, res) => {
  const [allStock, reorderRules] = await prisma.$transaction([
    prisma.stock.findMany({ include: { product: true, location: true } }),
    prisma.reorderRule.findMany(),
  ]);

  const alerts = [];
  for (const s of allStock) {
    const rule = reorderRules.find(
      (r) => r.productId === s.productId && r.locationId === s.locationId
    );
    if (rule && Number(s.quantityOnHand) <= Number(rule.minQty)) {
       alerts.push({
         title: `Low Stock: ${s.product.name}`,
         desc: `${s.location.name}, ${Number(s.quantityOnHand)} items left`,
         badge: Number(s.quantityOnHand) === 0 ? 'OUT OF STOCK' : 'CRITICAL',
         iconBg: '#fef2f2',
         iconColor: '#dc2626',
         badgeBg: '#fee2e2',
         badgeColor: '#dc2626'
       });
    }
  }

  res.json(alerts);
};

exports.getRecentActivity = async (req, res) => {
  const recentOps = await prisma.operation.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      lines: { include: { product: true } }
    }
  });

  const activity = recentOps.map(op => {
    const totalQty = op.lines.reduce((acc, line) => acc + Number(line.doneQty > 0 ? line.doneQty : line.demandQty), 0);
    const productNames = op.lines.map(l => l.product.name).join(', ');
    
    let actionColor = '#3b82f6';
    if (op.type === 'RECEIPT') actionColor = '#f07c28';
    if (op.type === 'TRANSFER') actionColor = '#a855f7';
    if (op.type === 'ADJUSTMENT') actionColor = '#10b981';

    let statusBg = '#f1f5f9', statusColor = '#64748b';
    if (op.status === 'DONE') { statusBg = '#dcfce7'; statusColor = '#16a34a'; }
    if (op.status === 'WAITING' || op.status === 'READY') { statusBg = '#fef3c7'; statusColor = '#d97706'; }
    if (op.status === 'CANCELLED') { statusBg = '#fee2e2'; statusColor = '#dc2626'; }

    return {
      id: op.referenceNo,
      product: productNames || 'Misc Items',
      action: op.type.charAt(0) + op.type.slice(1).toLowerCase(),
      actionColor,
      date: op.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: op.status.charAt(0) + op.status.slice(1).toLowerCase(),
      statusBg,
      statusColor,
      amount: totalQty.toString() + ' Units'
    };
  });

  res.json(activity);
};

