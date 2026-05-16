import { z } from 'zod';

export const createApplicationSchema = z.object({
  bountyId: z.string().uuid(),
  proposal: z.string().min(50).max(5000),
});

export const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']).optional(),
  proposal: z.string().min(50).max(5000).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
