const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@coreinventory.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@coreinventory.com',
      passwordHash: await bcrypt.hash('Admin@1234', 12),
      role: 'MANAGER',
    },
  });

  const wh = await prisma.warehouse.upsert({
    where: { shortCode: 'MAIN' },
    update: {},
    create: {
      name: 'Main Warehouse',
      shortCode: 'MAIN',
      address: 'Company HQ',
    },
  });

  await prisma.location.upsert({
    where: { id: 'default-location' },
    update: {},
    create: {
      id: 'default-location',
      name: 'Main Store',
      shortCode: 'MS01',
      warehouseId: wh.id,
      warehouseType: 'INTERNAL',
    },
  });

  await prisma.productCategory.upsert({
    where: { name: 'General' },
    update: {},
    create: { name: 'General' },
  });

  console.log('Seed complete. Login: admin@coreinventory.com / Admin@1234');
}

main().finally(() => prisma.$disconnect());
