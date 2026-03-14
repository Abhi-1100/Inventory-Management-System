import { z } from 'zod';

const lineSchema = z.object({
  productId: z.string().uuid('Select a product'),
  countedQty: z.coerce.number().min(0),
  note: z.string().optional(),
});

export const createAdjustmentSchema = z.object({
  locationId: z.string().uuid('Select a location'),
  lines: z.array(lineSchema).min(1, 'Add at least one product line'),
});
