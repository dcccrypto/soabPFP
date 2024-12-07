import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { SECURITY_CONSTANTS } from '@soba/types/src/security';
import { SecurityService } from '@soba/db/src/services/security.service';
import { ApiError } from '../utils/errors';
import { createLogger } from '../utils/logger';

const logger = createLogger('security');
const securityService = new SecurityService();

// Security headers
export const securityHeaders = helmet();

// Rate limiting
export function createRateLimiter(type: keyof typeof SECURITY_CONSTANTS.RATE_LIMITS): RateLimitRequestHandler {
  const { windowMs, max } = SECURITY_CONSTANTS.RATE_LIMITS[type];
  
  return rateLimit({
    windowMs,
    max,
    handler: (_req, _res) => {
      throw new ApiError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    }
  });
}

// Transaction validation
export async function validateTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const { amount, recipientAddress } = req.body;

    // Check for suspicious transaction patterns
    if (amount > SECURITY_CONSTANTS.MAX_TRANSACTION_AMOUNT) {
      throw new ApiError('Transaction amount exceeds limit', 400, 'INVALID_PARAMETER');
    }

    // Validate recipient address
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(recipientAddress)) {
      throw new ApiError('Invalid recipient address', 400, 'INVALID_PARAMETER');
    }

    next();
  } catch (error) {
    next(error);
  }
}

// Generation validation
export async function validateGeneration(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt, settings } = req.body;

    // Check prompt for prohibited content
    if (prompt && !await securityService.validatePrompt(prompt)) {
      throw new ApiError('Invalid prompt content', 400, 'INVALID_PARAMETER');
    }

    // Validate generation settings
    if (settings) {
      if (settings.maxTokens > SECURITY_CONSTANTS.MAX_TOKENS) {
        throw new ApiError('Token limit exceeded', 400, 'INVALID_PARAMETER');
      }

      if (!['LOW', 'MEDIUM', 'HIGH'].includes(settings.safetyLevel)) {
        throw new ApiError('Invalid safety level', 400, 'INVALID_PARAMETER');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

// Security error handler
export function handleSecurityError(error: Error, req: Request, res: Response, next: NextFunction) {
  if (error.name === 'SecurityError') {
    logger.warn('Security violation:', {
      error: error.message,
      path: req.path,
      ip: req.ip,
    });

    return res.status(403).json({
      error: {
        message: 'Security violation',
        code: 'AUTH_FORBIDDEN',
      },
    });
  }

  next(error);
} 