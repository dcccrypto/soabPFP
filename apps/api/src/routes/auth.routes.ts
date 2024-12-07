import { Router, Request, Response, NextFunction } from 'express';
import { validateRequest } from '../middleware/auth';
import { SecuritySchemas } from '@soba/types/src/security';
import { ApiError } from '../utils/errors';
import { createLogger } from '../utils/logger';
import { SecurityService } from '@soba/db/src/services/security.service';

const router = Router();
const logger = createLogger('auth-routes');
const securityService = new SecurityService();

interface AuthenticatedRequest extends Request {
  user?: {
    walletAddress: string;
  };
}

router.post('/connect', validateRequest('WalletConnectionRequest'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Validate wallet connection request
    const isWithinLimit = await securityService.checkRateLimit(
      walletAddress,
      'WALLET_CONNECT'
    );

    if (!isWithinLimit) {
      throw new ApiError('Too many connection attempts', 429, 'RATE_LIMIT_EXCEEDED');
    }

    // Create security context
    const securityContext = await securityService.createSecurityContext({
      walletAddress,
      clientMetadata: {
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip,
      },
    });

    // Log successful connection
    await securityService.logAudit({
      action: 'WALLET_CONNECT',
      walletAddress,
      status: 'SUCCESS',
      details: {
        timestamp: new Date(),
        userAgent: req.headers['user-agent'],
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        sessionId: securityContext.sessionId,
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: securityContext.sessionId,
        permissions: securityContext.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/disconnect', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      throw new ApiError('Session ID required', 400, 'INVALID_REQUEST');
    }

    // Clear security context
    await securityService.logAudit({
      action: 'WALLET_DISCONNECT',
      walletAddress: req.user?.walletAddress || 'unknown',
      status: 'SUCCESS',
      details: {
        timestamp: new Date(),
        sessionId,
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        sessionId: sessionId as string,
      },
    });

    res.json({
      success: true,
      message: 'Successfully disconnected',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      throw new ApiError('Session ID required', 400, 'INVALID_REQUEST');
    }

    const context = await securityService.getSecurityContext(sessionId as string);
    if (!context) {
      throw new ApiError('Session not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        walletAddress: context.walletAddress,
        permissions: context.permissions,
        sessionId: context.sessionId,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const authRoutes = router; 