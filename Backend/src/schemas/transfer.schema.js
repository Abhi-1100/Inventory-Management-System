import { z } from 'zod';

const lineSchema = z.object({
  productId: z.string().uuid('Select a product'),
  qty: z.coerce.number().min(0),
});

export const createTransferSchema = z.object({
  sourceLocationId: z.string().uuid('Select a source location'),
  destLocationId: z.string().uuid('Select a destination location'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  lines: z.array(lineSchema).min(1, 'Add at least one product line'),
});
