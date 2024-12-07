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
import type {
  PaginationParams,
  DateRangeParams,
  UserActivityParams,
  UserStats,
  GenerationStats,
} from './db';

// User Service Interface
export interface IUserService {
  createUser(walletAddress: string): Promise<UserProfile>;
  getUserByWallet(walletAddress: string): Promise<UserProfile | null>;
  updateUser(userId: ObjectId, updates: Partial<UserProfile>): Promise<UserProfile>;
  getUserStats(userId: ObjectId): Promise<UserStats>;
  checkGenerationLimit(userId: ObjectId): Promise<boolean>;
  resetDailyLimits(): Promise<void>;
}

// Generation Service Interface
export interface IGenerationService {
  createGeneration(data: Partial<GenerationActivity>): Promise<GenerationActivity>;
  getGenerationById(id: ObjectId): Promise<GenerationActivity | null>;
  getUserGenerations(params: UserActivityParams): Promise<GenerationActivity[]>;
  updateGeneration(id: ObjectId, updates: Partial<GenerationActivity>): Promise<GenerationActivity>;
  getGenerationStats(userId: ObjectId, dateRange?: DateRangeParams): Promise<GenerationStats>;
}

// NFT Service Interface
export interface INFTService {
  createNFT(data: Partial<NFTCollection>): Promise<NFTCollection>;
  getNFTByMintAddress(mintAddress: string): Promise<NFTCollection | null>;
  getUserNFTs(userId: ObjectId, params?: PaginationParams): Promise<NFTCollection[]>;
  updateNFTStatus(id: ObjectId, status: NFTCollection['status']): Promise<NFTCollection>;
}

// Token Service Interface
export interface ITokenService {
  createTransaction(data: Partial<TokenTransaction>): Promise<TokenTransaction>;
  getUserTransactions(userId: ObjectId, params?: UserActivityParams): Promise<TokenTransaction[]>;
  updateTransactionStatus(id: ObjectId, status: TokenTransaction['status']): Promise<TokenTransaction>;
  getTokenBalance(userId: ObjectId): Promise<number>;
}

// Session Service Interface
export interface ISessionService {
  createSession(data: Partial<UserSession>): Promise<UserSession>;
  updateSessionActivity(id: ObjectId): Promise<void>;
  getUserSessions(userId: ObjectId): Promise<UserSession[]>;
  cleanupInactiveSessions(threshold: Date): Promise<void>;
}

// Rate Limiting Service Interface
export interface IRateLimitService {
  checkLimit(key: string, type: RateLimit['type']): Promise<boolean>;
  incrementLimit(key: string, type: RateLimit['type']): Promise<void>;
  resetLimit(key: string, type: RateLimit['type']): Promise<void>;
}

// Analytics Service Interface
export interface IAnalyticsService {
  trackEvent(event: Partial<AnalyticsEvent>): Promise<void>;
  getUserEvents(userId: ObjectId, params?: UserActivityParams): Promise<AnalyticsEvent[]>;
  getEventStats(category: AnalyticsEvent['category'], dateRange?: DateRangeParams): Promise<any>;
}

// Cache Service Interface
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
} 