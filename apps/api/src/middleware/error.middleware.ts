import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({ err }, 'Error occurred');

  // Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(e.message);
    });

    return res.status(422).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      errors,
    });
  }

  // Custom app errors
  if (err instanceof AppError) {
    const response: {
      error: string;
      message: string;
      code?: string;
      errors?: Record<string, string[]>;
    } = {
      error: err.name,
      message: err.message,
      code: err.code,
    };

    if (err instanceof ValidationError && err.errors) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as unknown as { code: string; meta?: { target?: string[] } };
    
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'field';
      return res.status(409).json({
        error: 'Conflict',
        message: `A record with this ${field} already exists`,
      });
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Record not found',
      });
    }
  }

  // Default error
  const isDev = env.NODE_ENV === 'development';
  return res.status(500).json({
    error: 'Internal Server Error',
    message: isDev ? err.message : 'Something went wrong',
    ...(isDev && { stack: err.stack }),
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
};
