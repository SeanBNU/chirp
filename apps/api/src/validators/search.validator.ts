import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['all', 'users', 'tweets', 'hashtags']).optional().default('all'),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
