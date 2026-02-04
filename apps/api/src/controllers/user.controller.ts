import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { UpdateProfileInput } from '../validators/user.validator.js';

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const profile = await userService.getProfile(username, req.userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = req.body as UpdateProfileInput;
      const user = await userService.updateProfile(req.userId!, input);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const avatarUrl = `/uploads/${req.file.filename}`;
      const result = await userService.updateAvatar(req.userId!, avatarUrl);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateBanner(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const bannerUrl = `/uploads/${req.file.filename}`;
      const result = await userService.updateBanner(req.userId!, bannerUrl);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async follow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const result = await userService.follow(req.userId!, username);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async unfollow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const result = await userService.unfollow(req.userId!, username);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getFollowers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const followers = await userService.getFollowers(username, req.userId);
      res.json(followers);
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const following = await userService.getFollowing(username, req.userId);
      res.json(following);
    } catch (error) {
      next(error);
    }
  }

  async getSuggestedUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const users = await userService.getSuggestedUsers(req.userId!, limit);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
