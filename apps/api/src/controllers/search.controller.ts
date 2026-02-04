import { Response, NextFunction } from 'express';
import { searchService } from '../services/search.service.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export class SearchController {
  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const type = (req.query.type as string) || 'all';
      const limit = parseInt(req.query.limit as string) || 20;
      const results = await searchService.search(query, req.userId, type, limit);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  async getTrending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const trending = await searchService.getTrending(limit);
      res.json(trending);
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const leaderboard = await searchService.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  }

  async getDailyChallenge(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const challenge = await searchService.getDailyChallenge();
      res.json(challenge);
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
