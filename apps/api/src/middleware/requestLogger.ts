import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../utils/logger';

const logger = createLogger('request-logger');

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Generate request ID
  req.id = uuidv4();

  // Log request
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
    },
  });

  // Log response
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path} completed`, {
      requestId: req.id,
      statusCode: res.statusCode,
      duration,
    });
  });

  // Log errors
  res.on('error', (error: Error) => {
    logger.error('Request error', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      error: error.message,
      stack: error.stack,
    });
  });

  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

// Performance monitoring middleware
export function performanceMonitor() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1e6; // Convert to milliseconds

      if (duration > 1000) { // Log slow requests (>1s)
        logger.warn('Slow request detected', {
          requestId: req.id,
          method: req.method,
          path: req.path,
          duration,
        });
      }

      // Record metrics (if using a metrics system)
      // metrics.recordRequestDuration(req.path, duration);
    });

    next();
  };
}

// Memory usage monitoring
export function memoryMonitor() {
  return (req: Request, res: Response, next: NextFunction) => {
    const memoryBefore = process.memoryUsage();

    res.on('finish', () => {
      const memoryAfter = process.memoryUsage();
      const memoryDiff = {
        rss: memoryAfter.rss - memoryBefore.rss,
        heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      };

      // Log significant memory increases
      if (memoryDiff.heapUsed > 50 * 1024 * 1024) { // 50MB
        logger.warn('High memory usage detected', {
          requestId: req.id,
          method: req.method,
          path: req.path,
          memoryDiff,
        });
      }
    });

    next();
  };
} 