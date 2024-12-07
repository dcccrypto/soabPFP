import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';
import { ApiError } from '../utils/errors';

const logger = createLogger('error-handler');

export function errorHandler(
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  logger.error('Error processing request:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
  });

  // Handle ApiError instances
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle unknown errors
  return res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
    },
  });
} 