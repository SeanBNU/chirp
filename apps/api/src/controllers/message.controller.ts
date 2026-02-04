import { Response, NextFunction } from 'express';
import { messageService } from '../services/message.service.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { SendMessageInput } from '../validators/message.validator.js';

export class MessageController {
  async getConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversations = await messageService.getConversations(req.userId!);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await messageService.getConversation(req.userId!, username, cursor, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = req.body as SendMessageInput;
      const message = await messageService.sendMessage(req.userId!, input);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await messageService.getUnreadCount(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
