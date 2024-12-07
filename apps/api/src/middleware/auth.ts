import { Request, Response, NextFunction } from 'express';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { ApiError } from '../utils/errors';
import { createLogger } from '../utils/logger';
import type { LogMetadata } from '../utils/logger';
import { getUserService, getSecurityService } from '@soba/db';
import { SECURITY_CONSTANTS, SecuritySchemas } from '@soba/types/src/security';

const logger = createLogger('auth');
const securityService = getSecurityService();

declare global {
  namespace Express {
    interface Request {
      user?: {
        walletAddress: string;
        userId: string;
        securityContext?: {
          sessionId: string;
          permissions: string[];
        };
      };
    }
  }
}

export async function validateAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Rate limiting check
    const clientIp = req.ip;
    const isWithinLimit = await securityService.checkRateLimit(
      clientIp,
      'WALLET_CONNECT'
    );

    if (!isWithinLimit) {
      throw new ApiError('Too many connection attempts', 429, 'RATE_LIMIT_EXCEEDED');
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError('Authorization header missing', 401, 'AUTH_MISSING');
    }

    const [authType, token] = authHeader.split(' ');
    if (authType !== 'Bearer') {
      throw new ApiError('Invalid authorization type', 401, 'AUTH_INVALID_TYPE');
    }

    // Parse and validate the token
    const [walletAddress, signedMessage, originalMessage] = token.split('.');
    if (!walletAddress || !signedMessage || !originalMessage) {
      throw new ApiError('Invalid token format', 401, 'AUTH_INVALID_FORMAT');
    }

    // Verify the signature using tweetnacl
    try {
      const publicKey = new PublicKey(walletAddress);
      const messageBytes = Buffer.from(originalMessage);
      const signatureBytes = Buffer.from(signedMessage, 'base64');
      
      const signatureValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      );

      if (!signatureValid) {
        throw new Error('Invalid signature');
      }
    } catch (error) {
      await securityService.reportViolation({
        type: 'INVALID_SIGNATURE',
        severity: 'HIGH',
        details: {
          walletAddress,
          message: originalMessage,
        },
      });
      throw new ApiError('Invalid signature', 401, 'AUTH_INVALID_SIGNATURE');
    }

    // Check for banned wallets
    const isBanned = await securityService.getSecurityContext(`banned:${walletAddress}`);
    if (isBanned) {
      throw new ApiError('Account temporarily suspended', 403, 'ACCOUNT_SUSPENDED');
    }

    // Get or create user
    const userService = getUserService();
    const user = await userService.getUserByWallet(walletAddress);
    if (!user) {
      throw new ApiError('User not found', 401, 'AUTH_USER_NOT_FOUND');
    }

    // Create security context
    const securityContext = await securityService.createSecurityContext({
      userId: user._id.toString(),
      walletAddress,
      permissions: user.roles || ['user'],
      clientMetadata: {
        userAgent: req.headers['user-agent'] || '',
        ipAddress: clientIp,
      },
    });

    // Audit log successful authentication
    await securityService.logAudit({
      action: 'WALLET_CONNECT',
      userId: user._id.toString(),
      walletAddress,
      status: 'SUCCESS',
      details: {
        timestamp: new Date(),
        userAgent: req.headers['user-agent'],
      },
      metadata: {
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || '',
        sessionId: securityContext.sessionId,
      },
    });

    // Attach user and security context to request
    req.user = {
      walletAddress,
      userId: user._id.toString(),
      securityContext: {
        sessionId: securityContext.sessionId,
        permissions: securityContext.permissions,
      },
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      // Log security-related errors
      if (error.statusCode === 401 || error.statusCode === 403) {
        await securityService.logAudit({
          action: 'WALLET_CONNECT',
          userId: req.user?.userId || 'unknown',
          walletAddress: req.user?.walletAddress || 'unknown',
          status: 'FAILURE',
          details: {
            error: error.message,
            code: error.code,
          },
          metadata: {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || '',
            sessionId: req.user?.securityContext?.sessionId || 'unknown',
          },
        });
      }
      next(error);
    } else {
      const logData: LogMetadata = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      };
      logger.error('Authentication error:', logData);
      next(new ApiError('Authentication failed', 401, 'AUTH_FAILED'));
    }
  }
}

export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.securityContext) {
        throw new ApiError('Authentication required', 401, 'AUTH_REQUIRED');
      }

      const context = await securityService.getSecurityContext(
        req.user.securityContext.sessionId
      );

      if (!context || !context.permissions.includes(permission)) {
        throw new ApiError('Insufficient permissions', 403, 'AUTH_FORBIDDEN');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateRequest(schema: keyof typeof SecuritySchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request against security rules
      const input = JSON.stringify(req.body);
      if (!securityService.validateRequest(input)) {
        throw new ApiError('Invalid request content', 400, 'INVALID_CONTENT');
      }

      // Validate against schema
      const validationResult = SecuritySchemas[schema].safeParse(req.body);
      if (!validationResult.success) {
        throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', validationResult.error);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}