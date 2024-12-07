import { ObjectId } from 'mongodb';
import type {
  UserProfile,
  GenerationActivity,
  NFTCollection,
  TokenTransaction,
  UserSession,
  RateLimit,
  AnalyticsEvent,
} from './models';

// Database Collection Names
export const Collections = {
  USERS: 'users',
  GENERATIONS: 'generations',
  NFTS: 'nfts',
  TRANSACTIONS: 'transactions',
  SESSIONS: 'sessions',
  RATE_LIMITS: 'rate_limits',
  ANALYTICS: 'analytics',
} as const;

// Query Helpers
export type WithId<T> = T & { _id: ObjectId };
export type WithoutId<T> = Omit<T, '_id'>;
export type UpdateFields<T> = Partial<WithoutId<T>>;

// Index Configurations
export const Indexes = {
  [Collections.USERS]: [
    { key: { walletAddress: 1 }, unique: true },
    { key: { generationsToday: 1, lastGenerationTime: 1 } },
    { key: { createdAt: 1 } },
  ],
  [Collections.GENERATIONS]: [
    { key: { userId: 1 } },
    { key: { walletAddress: 1 } },
    { key: { status: 1 } },
    { key: { createdAt: 1 } },
  ],
  [Collections.NFTS]: [
    { key: { userId: 1 } },
    { key: { walletAddress: 1 } },
    { key: { mintAddress: 1 }, unique: true },
    { key: { status: 1 } },
    { key: { createdAt: 1 } },
  ],
  [Collections.TRANSACTIONS]: [
    { key: { userId: 1 } },
    { key: { walletAddress: 1 } },
    { key: { type: 1 } },
    { key: { status: 1 } },
    { key: { createdAt: 1 } },
  ],
  [Collections.SESSIONS]: [
    { key: { userId: 1 } },
    { key: { walletAddress: 1 } },
    { key: { lastActive: 1 } },
  ],
  [Collections.RATE_LIMITS]: [
    { key: { key: 1, type: 1 }, unique: true },
    { key: { window: 1 }, expireAfterSeconds: 86400 }, // TTL index
  ],
  [Collections.ANALYTICS]: [
    { key: { userId: 1 } },
    { key: { walletAddress: 1 } },
    { key: { category: 1 } },
    { key: { timestamp: 1 } },
  ],
} as const;

// Common Query Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate?: Date;
  endDate?: Date;
}

export interface UserActivityParams extends PaginationParams, DateRangeParams {
  userId: ObjectId;
  type?: string;
  status?: string;
}

// Aggregation Pipeline Types
export interface UserStats {
  totalGenerations: number;
  totalNFTs: number;
  tokensSpent: number;
  lastActivity: Date;
}

export interface GenerationStats {
  totalCount: number;
  successRate: number;
  averageProcessingTime: number;
  popularStyles: Array<{ style: string; count: number }>;
}

// Cache Keys
export const CacheKeys = {
  userProfile: (userId: string) => `user:${userId}`,
  userStats: (userId: string) => `stats:${userId}`,
  generationActivity: (generationId: string) => `generation:${generationId}`,
  nftCollection: (walletAddress: string) => `nfts:${walletAddress}`,
  rateLimit: (key: string, type: string) => `rate:${type}:${key}`,
} as const; 