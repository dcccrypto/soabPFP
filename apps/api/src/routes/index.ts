import { Express, Router } from 'express';
import { validateAuth, requirePermission } from '../middleware/auth';
import { validateTransaction, validateGeneration } from '../middleware/security';
import { createRateLimiter } from '../middleware/security';
import { SECURITY_CONSTANTS } from '@soba/types/src/security';

// Import route handlers
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { generationRoutes } from './generation.routes';
import { nftRoutes } from './nft.routes';
import { tokenRoutes } from './token.routes';

export function configureRoutes(app: Express) {
  // API version prefix
  const apiPrefix = '/api/v1';

  // Auth routes (public)
  app.use(`${apiPrefix}/auth`, createRateLimiter('WALLET_CONNECT'), authRoutes);

  // Protected routes
  const protectedRouter = Router();
  protectedRouter.use(validateAuth);

  // User routes
  protectedRouter.use('/users', userRoutes);

  // Generation routes
  protectedRouter.use(
    '/generations',
    createRateLimiter('AI_GENERATION'),
    validateGeneration,
    generationRoutes
  );

  // NFT routes
  protectedRouter.use(
    '/nfts',
    createRateLimiter('NFT_MINTING'),
    requirePermission('mint_nft'),
    nftRoutes
  );

  // Token routes
  protectedRouter.use(
    '/tokens',
    createRateLimiter('TOKEN_TRANSACTION'),
    validateTransaction,
    tokenRoutes
  );

  // Mount protected routes
  app.use(apiPrefix, protectedRouter);

  // API documentation route
  app.get(`${apiPrefix}/docs`, (req, res) => {
    res.json({
      version: '1.0.0',
      endpoints: {
        auth: {
          base: `${apiPrefix}/auth`,
          methods: ['POST'],
          endpoints: {
            '/connect': 'Connect wallet',
            '/disconnect': 'Disconnect wallet',
          },
        },
        users: {
          base: `${apiPrefix}/users`,
          methods: ['GET', 'PUT'],
          endpoints: {
            '/me': 'Get current user',
            '/me/preferences': 'Update user preferences',
          },
        },
        generations: {
          base: `${apiPrefix}/generations`,
          methods: ['GET', 'POST'],
          endpoints: {
            '/': 'Create generation',
            '/:id': 'Get generation',
            '/history': 'Get generation history',
          },
        },
        nfts: {
          base: `${apiPrefix}/nfts`,
          methods: ['GET', 'POST'],
          endpoints: {
            '/': 'Mint NFT',
            '/:id': 'Get NFT details',
            '/collection': 'Get user collection',
          },
        },
        tokens: {
          base: `${apiPrefix}/tokens`,
          methods: ['GET', 'POST'],
          endpoints: {
            '/balance': 'Get token balance',
            '/purchase': 'Purchase tokens',
            '/transfer': 'Transfer tokens',
          },
        },
      },
    });
  });

  // Health check route
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: {
        message: 'Not Found',
        code: 'NOT_FOUND',
        details: `Cannot ${req.method} ${req.path}`,
      },
    });
  });
} 