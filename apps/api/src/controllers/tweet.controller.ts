import { Request, Response, NextFunction } from 'express';
import { tweetService } from '../services/tweet.service.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { CreateTweetInput, ReactionInput } from '../validators/tweet.validator.js';
import type { VibeType } from '@chirp/shared';

export class TweetController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = req.body as CreateTweetInput;
      
      // Handle media from multer
      const media: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file: Express.Multer.File) => {
          media.push(`/uploads/${file.filename}`);
        });
      }

      const result = await tweetService.create(req.userId!, { ...input, media } as any);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await tweetService.delete(id, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tweet = await tweetService.getById(id, req.userId);
      res.json(tweet);
    } catch (error) {
      next(error);
    }
  }

  async getReplies(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await tweetService.getReplies(id, req.userId, cursor, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = (req.query.type as 'for_you' | 'following') || 'for_you';
      const result = await tweetService.getFeed(req.userId!, cursor, limit, type);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserTweets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await tweetService.getUserTweets(username, req.userId, cursor, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getByVibe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const vibe = req.params.vibe as VibeType;
      const cursor = req.query.cursor as string | undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await tweetService.getByVibe(vibe, req.userId, cursor, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async react(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = req.body as ReactionInput;
      const result = await tweetService.react(id, req.userId!, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async retweet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await tweetService.retweet(id, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async vote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { optionId } = req.body;
      const result = await tweetService.vote(id, req.userId!, optionId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const tweetController = new TweetController();
