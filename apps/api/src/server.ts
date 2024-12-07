import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import { createLogger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateAuth } from './middleware/auth';
import { configureRoutes } from './routes';
import { initializeServices } from './services';
import {
  securityHeaders,
  createRateLimiter,
  handleSecurityError,
} from './middleware/security';
import { SECURITY_CONSTANTS } from '@soba/types/src/security';

const logger = createLogger('server');

export async function startServer() {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(compression());
  app.use(securityHeaders);
  app.use(requestLogger);

  // Body parsing
  app.use(express.json({ 
    limit: '10mb',
    verify: (req: Request, res: Response, buf: Buffer) => {
      // Store raw body for signature verification
      (req as any).rawBody = buf;
    }
  }));

  // Rate limiting
  app.use(createRateLimiter('GLOBAL'));

  // Initialize services
  await initializeServices();

  // Configure routes
  configureRoutes(app);

  // Health check endpoint (excluded from rate limiting)
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  });

  // Error handling
  app.use(handleSecurityError);
  app.use(errorHandler);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: {
        message: 'Not Found',
        code: 'NOT_FOUND',
        details: `Cannot ${_req.method} ${_req.path}`,
      },
    });
  });

  // Start server
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
  });

  // Graceful shutdown
  const cleanup = async () => {
    try {
      logger.info('Shutting down server...');
      process.exit(0);
    } catch (error) {
      logger.error('Error during cleanup:', { error: error instanceof Error ? error.message : 'Unknown error' });
      process.exit(1);
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
} 