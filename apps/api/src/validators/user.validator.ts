import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  bio: z.string().max(160).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  soundEnabled: z.boolean().optional(),
  focusMode: z.boolean().optional(),
  theme: z.enum(['dark', 'light']).optional(),
});

export const usernameParamSchema = z.object({
  username: z.string().min(1),
});

export const userIdParamSchema = z.object({
  id: z.string().cuid(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
