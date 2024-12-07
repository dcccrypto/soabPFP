export * from './lib/mongodb';
export * from './lib/redis';
export * from './services/user.service';
export * from './services/generation.service';
export * from './services/analytics.service';
export * from './services/security.service';

import Redis from 'ioredis';
import { MongoClient } from 'mongodb';
import { UserService } from './services/user.service';
import { GenerationService } from './services/generation.service';
import { AnalyticsService } from './services/analytics.service';
import { SecurityService } from './services/security.service';

let redis: Redis | null = null;
let mongoClient: MongoClient | null = null;
let userService: UserService | null = null;
let generationService: GenerationService | null = null;
let analyticsService: AnalyticsService | null = null;
let securityService: SecurityService | null = null;

export function getUserService(): UserService {
  if (!userService) {
    userService = new UserService();
  }
  return userService;
}

export function getGenerationService(): GenerationService {
  if (!generationService) {
    generationService = new GenerationService();
  }
  return generationService;
}

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsService) {
    analyticsService = new AnalyticsService();
  }
  return analyticsService;
}

export function getSecurityService(): SecurityService {
  if (!securityService && redis) {
    securityService = new SecurityService(redis);
  }
  if (!securityService) {
    throw new Error('Redis not initialized');
  }
  return securityService;
}

export async function initializeDatabase(config: {
  mongoUri: string;
  mongoDbName: string;
  redisUri: string;
}) {
  // Initialize Redis
  redis = new Redis(config.redisUri);

  // Initialize MongoDB
  mongoClient = new MongoClient(config.mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db(config.mongoDbName);

  // Initialize services
  userService = new UserService();
  generationService = new GenerationService();
  analyticsService = new AnalyticsService();
  securityService = new SecurityService(redis);

  return {
    redis,
    mongoClient,
    db,
  };
}

export async function cleanupDatabase() {
  if (redis) {
    await redis.quit();
    redis = null;
  }

  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }

  userService = null;
  generationService = null;
  analyticsService = null;
  securityService = null;
} 