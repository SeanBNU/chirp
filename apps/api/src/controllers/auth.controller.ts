import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as RegisterInput;
      const result = await authService.register(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = req.body as LoginInput;
      const result = await authService.login(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.userId!);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
