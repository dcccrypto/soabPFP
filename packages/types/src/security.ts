import { z } from 'zod';

// Security Constants
export const SECURITY_CONSTANTS = {
  // Rate Limiting
  RATE_LIMITS: {
    GLOBAL: { windowMs: 15 * 60 * 1000, max: 100 },
    WALLET_CONNECT: { windowMs: 60 * 1000, max: 5 },
    AI_GENERATION: { windowMs: 60 * 1000, max: 10 },
    NFT_MINTING: { windowMs: 60 * 1000, max: 3 },
    TOKEN_TRANSACTION: { windowMs: 60 * 1000, max: 5 },
  },

  // Authentication
  AUTH: {
    JWT_EXPIRY: '24h',
    SIGNATURE_EXPIRY: 5 * 60, // 5 minutes
    MIN_WALLET_BALANCE: 0.001, // Minimum SOL balance
    REQUIRED_CONFIRMATIONS: 1,
  },

  // Encryption
  ENCRYPTION: {
    HASH_ROUNDS: 10,
    KEY_LENGTH: 32,
    CIPHER_ALGORITHM: 'aes-256-gcm',
  },

  // Data Protection
  DATA_RETENTION: {
    USER_SESSION: 30 * 24 * 60 * 60, // 30 days
    GENERATION_HISTORY: 90 * 24 * 60 * 60, // 90 days
    TRANSACTION_LOGS: 365 * 24 * 60 * 60, // 1 year
  },

  // Blockchain Security
  BLOCKCHAIN: {
    MAX_RETRIES: 3,
    TIMEOUT: 30000, // 30 seconds
    MIN_PRIORITY_FEE: 5000,
  },

  MAX_TRANSACTION_AMOUNT: 1000,
  MAX_TOKENS: 1000,
  SAFETY_LEVELS: ['LOW', 'MEDIUM', 'HIGH'] as const,
} as const;

// Validation Schemas
export const SecuritySchemas = {
  // Wallet Connection Request
  WalletConnectionRequest: {
    safeParse: (data: unknown) => ({
      success: true, // Implement proper validation if needed
      data
    })
  },

  // Token Transaction
  TokenTransaction: z.object({
    amount: z.number().positive(),
    recipientAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
    transactionType: z.enum(['MINT', 'TRANSFER', 'BURN']),
    metadata: z.object({
      reason: z.string(),
      referenceId: z.string().optional(),
    }).optional(),
  }),

  // AI Generation Request
  GenerationRequest: z.object({
    prompt: z.string().min(1).max(1000),
    settings: z.object({
      model: z.string(),
      safetyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      maxTokens: z.number().int().min(1).max(2048),
    }),
    metadata: z.object({
      clientId: z.string(),
      sessionId: z.string(),
    }),
  }),

  // User Data
  UserData: z.object({
    personalData: z.object({
      email: z.string().email().optional(),
      displayName: z.string().min(3).max(50).optional(),
    }).optional(),
    preferences: z.object({
      marketingConsent: z.boolean(),
      dataRetention: z.enum(['MINIMAL', 'STANDARD', 'EXTENDED']),
    }),
  }),
};

// Security Types
export interface SecurityContext {
  userId: string;
  walletAddress: string;
  permissions: string[];
  sessionId: string;
  clientMetadata: {
    userAgent: string;
    ipAddress: string;
    geoLocation?: string;
  };
}

export interface AuditLog {
  timestamp: Date;
  action: string;
  userId: string;
  walletAddress: string;
  status: 'SUCCESS' | 'FAILURE';
  details: Record<string, any>;
  metadata: {
    ipAddress: string;
    userAgent: string;
    sessionId: string;
  };
}

export interface SecurityViolation {
  type: 'RATE_LIMIT' | 'INVALID_SIGNATURE' | 'UNAUTHORIZED' | 'SUSPICIOUS_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: Record<string, any>;
  timestamp: Date;
  userId?: string;
  walletAddress?: string;
}

// GDPR Compliance
export interface DataRetentionPolicy {
  type: 'PERSONAL' | 'GENERATION' | 'TRANSACTION' | 'ANALYTICS';
  retentionPeriod: number; // in seconds
  dataCategories: string[];
  legalBasis: 'CONSENT' | 'CONTRACT' | 'LEGAL_OBLIGATION' | 'LEGITIMATE_INTEREST';
}

export interface DataSubjectRequest {
  type: 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'PORTABILITY';
  userId: string;
  walletAddress: string;
  requestDate: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  details: Record<string, any>;
}

// Attack Prevention
export interface SecurityRule {
  type: string;
  pattern: RegExp | string;
  action: 'BLOCK' | 'MONITOR' | 'RATE_LIMIT';
  threshold?: number;
  duration?: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const SecurityRules: SecurityRule[] = [
  {
    type: 'SQL_INJECTION',
    pattern: /'.*--|\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b/i,
    action: 'BLOCK',
    severity: 'CRITICAL',
  },
  {
    type: 'XSS',
    pattern: /<script\b[^>]*>[\s\S]*?<\/script>|javascript:|data:|vbscript:|on\w+\s*=|style\s*=\s*".*expression\s*\(|<\w+\s+[^>]*\s+on\w+\s*=|document\.|window\.|eval\(|setTimeout\(|setInterval\(|new\s+Function\(|alert\(|confirm\(|prompt\(|fetch\(|XMLHttpRequest\(/i,
    action: 'BLOCK',
    severity: 'HIGH',
  },
  {
    type: 'SUSPICIOUS_WALLET',
    pattern: /^(0x0000|0x1234|1111)/i,
    action: 'BLOCK',
    severity: 'HIGH',
  },
  {
    type: 'RAPID_REQUESTS',
    pattern: '.*',
    action: 'RATE_LIMIT',
    threshold: 100,
    duration: 60,
    severity: 'MEDIUM',
  },
]; 