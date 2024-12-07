import { ObjectId } from 'mongodb';

// User Profile Schema
export interface UserProfile {
  _id: ObjectId;
  walletAddress: string;
  tokenBalance: number;
  generationsToday: number;
  totalGenerations: number;
  lastGenerationTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    preferredStyle?: string;
    defaultSettings?: Record<string, any>;
    notifications?: boolean;
  };
}

// Generation Activity Schema
export interface GenerationActivity {
  _id: ObjectId;
  userId: ObjectId;
  walletAddress: string;
  prompt: string;
  style?: string;
  settings: Record<string, any>;
  status: 'pending' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
  tokensUsed: number;
  metadata?: {
    model: string;
    processingTime?: number;
    quality?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// NFT Collection Schema
export interface NFTCollection {
  _id: ObjectId;
  userId: ObjectId;
  walletAddress: string;
  mintAddress: string;
  generationId: ObjectId;
  imageUrl: string;
  name: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  status: 'pending' | 'minted' | 'failed';
  transactionHash?: string;
  mintedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Token Transaction Schema
export interface TokenTransaction {
  _id: ObjectId;
  userId: ObjectId;
  walletAddress: string;
  type: 'purchase' | 'usage' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  relatedActivityId?: ObjectId;
  metadata?: {
    paymentMethod?: string;
    transactionHash?: string;
    reason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User Session Schema
export interface UserSession {
  _id: ObjectId;
  userId: ObjectId;
  walletAddress: string;
  lastActive: Date;
  deviceInfo: {
    userAgent: string;
    ip: string;
    platform: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Rate Limiting Schema
export interface RateLimit {
  _id: ObjectId;
  key: string; // walletAddress or IP
  type: 'generation' | 'mint' | 'api';
  count: number;
  window: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Event Schema
export interface AnalyticsEvent {
  _id: ObjectId;
  userId?: ObjectId;
  walletAddress?: string;
  eventType: string;
  category: 'generation' | 'nft' | 'token' | 'user';
  data: Record<string, any>;
  metadata: {
    userAgent?: string;
    ip?: string;
    referrer?: string;
  };
  timestamp: Date;
} 