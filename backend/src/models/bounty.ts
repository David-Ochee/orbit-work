import { z } from 'zod';

export const createBountySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  reward: z.number().positive(),
  currency: z.enum(['XLM', 'USDC']).default('XLM'),
  category: z.enum(['code', 'design', 'writing', 'research', 'marketing', 'community']),
  claimType: z.enum(['first-come', 'competitive', 'curated']).default('competitive'),
  expiresAt: z.string().datetime().optional(),
});

export const updateBountySchema = createBountySchema.partial().extend({
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).optional(),
});

export type CreateBountyInput = z.infer<typeof createBountySchema>;
export type UpdateBountyInput = z.infer<typeof updateBountySchema>;
