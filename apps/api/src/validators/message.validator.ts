import { z } from 'zod';

export const sendMessageSchema = z.object({
  receiverId: z.string().cuid(),
  content: z.string().min(1).max(1000),
});

export const conversationParamSchema = z.object({
  username: z.string().min(1),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
