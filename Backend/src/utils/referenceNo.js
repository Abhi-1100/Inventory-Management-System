const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const prefixMap = {
  RECEIPT: 'WH/IN',
  DELIVERY: 'WH/OUT',
  TRANSFER: 'WH/TRF',
  ADJUSTMENT: 'WH/ADJ',
};

async function generateReferenceNo(type) {
  const year = new Date().getFullYear();
  const prefix = prefixMap[type];
  const count = await prisma.operation.count({
    where: {
      type,
      referenceNo: { startsWith: `${prefix}/${year}/` },
    },
  });
  return `${prefix}/${year}/${String(count + 1).padStart(4, '0')}`;
}

module.exports = { generateReferenceNo };
