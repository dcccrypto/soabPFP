import { Redis } from 'ioredis';
import { SECURITY_CONSTANTS, SecurityContext, AuditLog } from '@soba/types/src/security';

export class SecurityService {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async checkRateLimit(key: string, type: keyof typeof SECURITY_CONSTANTS.RATE_LIMITS): Promise<boolean> {
    const limit = SECURITY_CONSTANTS.RATE_LIMITS[type];
    const redisKey = `rate_limit:${type}:${key}`;
    
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, Math.floor(limit.windowMs / 1000));
    }
    
    return count <= limit.max;
  }

  async createSecurityContext(params: {
    userId: string;
    walletAddress: string;
    permissions: string[];
    clientMetadata: {
      userAgent: string;
      ipAddress: string;
    };
  }): Promise<SecurityContext> {
    const context: SecurityContext = {
      sessionId: crypto.randomUUID(),
      walletAddress: params.walletAddress,
      permissions: params.permissions,
      metadata: params.clientMetadata,
      createdAt: new Date(),
    };

    await this.redis.setex(
      `security_context:${context.sessionId}`,
      24 * 60 * 60, // 24 hours
      JSON.stringify(context)
    );

    return context;
  }

  async getSecurityContext(sessionId: string): Promise<SecurityContext | null> {
    const data = await this.redis.get(`security_context:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async logAudit(log: Omit<AuditLog, 'timestamp'>): Promise<void> {
    const auditLog: AuditLog = {
      ...log,
      timestamp: new Date()
    };

    // Store in Redis for quick access to recent logs
    const redisKey = `audit_logs:${log.walletAddress}`;
    await this.redis.lpush(redisKey, JSON.stringify(auditLog));
    await this.redis.ltrim(redisKey, 0, 99); // Keep last 100 logs
  }

  async reportViolation(violation: {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    details: Record<string, any>;
  }): Promise<void> {
    const redisKey = `security_violations:${violation.type}`;
    await this.redis.lpush(redisKey, JSON.stringify({
      ...violation,
      timestamp: new Date()
    }));
  }

  validateRequest(input: string): boolean {
    // Implement request validation logic
    // This is a placeholder - implement actual validation as needed
    return true;
  }
} 