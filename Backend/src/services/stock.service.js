const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function increaseStock(tx, { productId, locationId, qty, referenceType, referenceId, note }) {
  await tx.stockLedger.create({
    data: { productId, locationId, quantityChange: qty, referenceType, referenceId, note },
  });
  await tx.stock.upsert({
    where: { productId_locationId: { productId, locationId } },
    create: { productId, locationId, quantityOnHand: qty },
    update: { quantityOnHand: { increment: qty } },
  });
}

async function decreaseStock(tx, { productId, locationId, qty, referenceType, referenceId, note }) {
  const stock = await tx.stock.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });
  const current = stock ? Number(stock.quantityOnHand) : 0;
  if (current < qty) {
    const product = await tx.product.findUnique({ where: { id: productId }, select: { name: true } });
    const err = new Error(`Insufficient stock for ${product?.name || productId}`);
    err.statusCode = 422;
    err.code = 'INSUFFICIENT_STOCK';
    throw err;
  }
  await tx.stockLedger.create({
    data: { productId, locationId, quantityChange: -qty, referenceType, referenceId, note },
  });
  await tx.stock.update({
    where: { productId_locationId: { productId, locationId } },
    data: { quantityOnHand: { decrement: qty } },
  });
}

async function adjustStock(tx, { productId, locationId, countedQty, referenceId }) {
  const stock = await tx.stock.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });
  const systemQty = stock ? Number(stock.quantityOnHand) : 0;
  const difference = countedQty - systemQty;
  if (difference === 0) return { systemQty, countedQty, difference };
  await tx.stockLedger.create({
    data: {
      productId,
      locationId,
      quantityChange: difference,
      referenceType: 'ADJUSTMENT',
      referenceId,
    },
  });
  await tx.stock.upsert({
    where: { productId_locationId: { productId, locationId } },
    create: { productId, locationId, quantityOnHand: countedQty },
    update: { quantityOnHand: countedQty },
  });
  return { systemQty, countedQty, difference };
}

module.exports = { increaseStock, decreaseStock, adjustStock };
