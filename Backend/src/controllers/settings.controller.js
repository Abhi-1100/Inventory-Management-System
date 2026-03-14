const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listWarehouses = async (req, res) => {
  const warehouses = await prisma.warehouse.findMany({
    include: { _count: { select: { locations: true } } },
  });
  res.json({
    data: warehouses.map((w) => ({
      id: w.id,
      name: w.name,
      shortCode: w.shortCode,
      address: w.address,
      locationCount: w._count.locations,
    })),
  });
};

exports.createWarehouse = async (req, res) => {
  const { name, shortCode, address } = req.body;
  const wh = await prisma.warehouse.create({ data: { name, shortCode, address } });
  res.status(201).json(wh);
};

exports.updateWarehouse = async (req, res) => {
  const { name, shortCode, address } = req.body;
  const wh = await prisma.warehouse.update({
    where: { id: req.params.id },
    data: { name, shortCode, address },
  });
  res.json(wh);
};

exports.listLocations = async (req, res) => {
  const where = req.query.warehouseId ? { warehouseId: req.query.warehouseId } : {};
  const locs = await prisma.location.findMany({
    where,
    include: { warehouse: { select: { id: true, name: true } } },
  });
  res.json({
    data: locs.map((l) => ({
      id: l.id,
      name: l.name,
      shortCode: l.shortCode,
      warehouseType: l.warehouseType.toLowerCase(),
      warehouse: l.warehouse,
    })),
  });
};

exports.createLocation = async (req, res) => {
  const { name, shortCode, warehouseId, warehouseType } = req.body;
  const loc = await prisma.location.create({
    data: { name, shortCode, warehouseId, warehouseType: warehouseType.toUpperCase() },
    include: { warehouse: { select: { id: true, name: true } } },
  });
  res.status(201).json({ ...loc, warehouseType: loc.warehouseType.toLowerCase() });
};

exports.updateLocation = async (req, res) => {
  const { name, shortCode, warehouseType } = req.body;
  const loc = await prisma.location.update({
    where: { id: req.params.id },
    data: { name, shortCode, warehouseType: warehouseType?.toUpperCase() },
    include: { warehouse: { select: { id: true, name: true } } },
  });
  res.json({ ...loc, warehouseType: loc.warehouseType.toLowerCase() });
};
