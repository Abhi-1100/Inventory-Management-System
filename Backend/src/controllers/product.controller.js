const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/products?search=&categoryId=&page=1&limit=20
exports.listProducts = async (req, res) => {
  const { search, categoryId, page = 1, limit = 20 } = req.query;
  const where = {};
  if (search)
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  if (categoryId) where.categoryId = categoryId;
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      include: { category: true, stockEntries: true, reorderRules: true },
    }),
    prisma.product.count({ where }),
  ]);
  const data = products.map((p) => {
    const totalStock = p.stockEntries.reduce((s, e) => s + Number(e.quantityOnHand), 0);
    const reorderMin = p.reorderRules[0]?.minQty ?? null;
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: { id: p.category.id, name: p.category.name },
      unitOfMeasure: p.unitOfMeasure,
      totalStock,
      isLowStock: reorderMin !== null && totalStock <= Number(reorderMin) && totalStock > 0,
      isOutOfStock: totalStock === 0,
    };
  });
  res.json({ data, total, page: Number(page), limit: Number(limit) });
};

// POST /api/products
exports.createProduct = async (req, res) => {
  const { name, sku, categoryId, unitOfMeasure, initialStock, initialLocationId } = req.body;
  const { increaseStock } = require('../services/stock.service');
  const product = await prisma.$transaction(async (tx) => {
    const prod = await tx.product.create({ data: { name, sku, categoryId, unitOfMeasure } });
    if (initialStock && initialStock > 0 && initialLocationId) {
      await increaseStock(tx, {
        productId: prod.id,
        locationId: initialLocationId,
        qty: initialStock,
        referenceType: 'ADJUSTMENT',
        referenceId: prod.id,
        note: 'Initial stock',
      });
    }
    return prod;
  });
  res.status(201).json(product);
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: req.params.id },
    include: {
      category: true,
      stockEntries: { include: { location: { include: { warehouse: true } } } },
      reorderRules: true,
    },
  });
  const stockByLocation = product.stockEntries.map((s) => {
    const rule = product.reorderRules.find((r) => r.locationId === s.locationId);
    return {
      location: { id: s.location.id, name: s.location.name },
      warehouse: { id: s.location.warehouse.id, name: s.location.warehouse.name },
      quantityOnHand: Number(s.quantityOnHand),
      reorderMin: rule ? Number(rule.minQty) : null,
    };
  });
  res.json({
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: { id: product.category.id, name: product.category.name },
    unitOfMeasure: product.unitOfMeasure,
    stockByLocation,
  });
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  const { name, sku, categoryId, unitOfMeasure } = req.body;
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { name, sku, categoryId, unitOfMeasure },
    include: { category: true },
  });
  res.json(product);
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: 'Product deleted' });
};

// GET /api/products/categories
exports.listCategories = async (req, res) => {
  const cats = await prisma.productCategory.findMany({
    include: { _count: { select: { products: true } } },
  });
  res.json({
    data: cats.map((c) => ({ id: c.id, name: c.name, productCount: c._count.products })),
  });
};

// POST /api/products/categories
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const cat = await prisma.productCategory.create({ data: { name } });
  res.status(201).json(cat);
};

// DELETE /api/products/categories/:id
exports.deleteCategory = async (req, res) => {
  const count = await prisma.product.count({ where: { categoryId: req.params.id } });
  if (count > 0)
    return res.status(409).json({ error: 'Category has associated products', code: 'CONFLICT' });
  await prisma.productCategory.delete({ where: { id: req.params.id } });
  res.json({ message: 'Category deleted' });
};

// GET /api/products/reorder-rules
exports.listReorderRules = async (req, res) => {
  const rules = await prisma.reorderRule.findMany({
    include: {
      product: { select: { id: true, name: true, sku: true } },
      location: { select: { id: true, name: true, warehouse: { select: { id: true, name: true } } } },
    },
  });
  res.json({
    data: rules.map((r) => ({
      id: r.id,
      product: r.product,
      location: r.location,
      minQty: Number(r.minQty),
      maxQty: Number(r.maxQty),
    })),
  });
};

// POST /api/products/reorder-rules
exports.upsertReorderRule = async (req, res) => {
  const { productId, locationId, minQty, maxQty } = req.body;
  const rule = await prisma.reorderRule.upsert({
    where: { productId_locationId: { productId, locationId } },
    create: { productId, locationId, minQty, maxQty },
    update: { minQty, maxQty },
  });
  res.json(rule);
};
