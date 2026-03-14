import { z } from 'zod';

const lineSchema = z.object({
  productId: z.string().uuid('Select a product'),
  demandQty: z.coerce.number().min(0),
  doneQty: z.coerce.number().min(0),
});

export const createDeliverySchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  sourceLocationId: z.string().uuid('Select a source location'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  lines: z.array(lineSchema).min(1, 'Add at least one product line'),
});
