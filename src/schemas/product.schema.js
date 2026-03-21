import { z } from 'zod';

export const createProductSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().min(1, 'SKU is required'),
    categoryId: z.string().uuid('Select a category'),
    unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
    initialStock: z.coerce.number().min(0).optional(),
    initialLocationId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.initialStock && data.initialStock > 0) return !!data.initialLocationId;
      return true;
    },
    {
      message: 'Location is required when initial stock is set',
      path: ['initialLocationId'],
    }
  );

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().uuid('Select a category'),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

export const reorderRuleSchema = z.object({
  productId: z.string().uuid('Select a product'),
  locationId: z.string().uuid('Select a location'),
  minQty: z.coerce.number().min(0, 'Min qty must be >= 0'),
  maxQty: z.coerce.number().min(0, 'Max qty must be >= 0'),
});
