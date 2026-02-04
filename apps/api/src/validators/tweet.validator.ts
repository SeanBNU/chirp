import { z } from 'zod';
import { VIBE_TYPES, REACTION_TYPES } from '@chirp/shared';

export const createTweetSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(500, 'Content must be at most 500 characters'),
  vibe: z.enum(VIBE_TYPES).optional(),
  hasCode: z.boolean().optional().default(false),
  parentId: z.string().cuid().optional(),
  poll: z
    .object({
      question: z.string().min(1).max(200),
      options: z.array(z.string().min(1).max(100)).min(2).max(4),
      endsAt: z.string().datetime().optional(),
    })
    .optional(),
});

export const reactionSchema = z.object({
  type: z.enum(REACTION_TYPES),
});

export const voteSchema = z.object({
  optionId: z.string().cuid(),
});

export const tweetIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const feedQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const vibeQuerySchema = z.object({
  vibe: z.enum(VIBE_TYPES),
});

export type CreateTweetInput = z.infer<typeof createTweetSchema>;
export type ReactionInput = z.infer<typeof reactionSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
