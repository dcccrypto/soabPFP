import { ObjectId } from 'mongodb';
import type {
  UserProfile,
  IUserService,
  UserStats,
  Collections,
  CacheKeys,
} from '@soba/types';
import { getMongoDB } from '../lib/mongodb';
import { getRedisCache } from '../lib/redis';

const CACHE_TTL = 3600; // 1 hour
const DAILY_GENERATION_LIMIT = 10;

export class UserService implements IUserService {
  private get collection() {
    return getMongoDB().getCollection(Collections.USERS);
  }

  private get cache() {
    return getRedisCache();
  }

  async createUser(walletAddress: string): Promise<UserProfile> {
    const now = new Date();
    const user: Omit<UserProfile, '_id'> = {
      walletAddress,
      tokenBalance: 0,
      generationsToday: 0,
      totalGenerations: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(user);
    const created = { ...user, _id: result.insertedId };

    // Cache the user profile
    await this.cache.set(
      CacheKeys.userProfile(result.insertedId.toString()),
      created,
      CACHE_TTL
    );

    return created;
  }

  async getUserByWallet(walletAddress: string): Promise<UserProfile | null> {
    // Try cache first
    const cacheKey = CacheKeys.userProfile(walletAddress);
    const cached = await this.cache.get<UserProfile>(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const user = await this.collection.findOne<UserProfile>({ walletAddress });
    if (user) {
      await this.cache.set(cacheKey, user, CACHE_TTL);
    }

    return user;
  }

  async updateUser(userId: ObjectId, updates: Partial<UserProfile>): Promise<UserProfile> {
    const result = await this.collection.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('User not found');
    }

    // Update cache
    await this.cache.set(
      CacheKeys.userProfile(userId.toString()),
      result,
      CACHE_TTL
    );

    return result;
  }

  async getUserStats(userId: ObjectId): Promise<UserStats> {
    // Try cache first
    const cacheKey = CacheKeys.userStats(userId.toString());
    const cached = await this.cache.get<UserStats>(cacheKey);
    if (cached) return cached;

    // Aggregate from database
    const [stats] = await this.collection
      .aggregate<UserStats>([
        { $match: { _id: userId } },
        {
          $lookup: {
            from: Collections.GENERATIONS,
            localField: '_id',
            foreignField: 'userId',
            as: 'generations',
          },
        },
        {
          $lookup: {
            from: Collections.NFTS,
            localField: '_id',
            foreignField: 'userId',
            as: 'nfts',
          },
        },
        {
          $lookup: {
            from: Collections.TRANSACTIONS,
            localField: '_id',
            foreignField: 'userId',
            as: 'transactions',
          },
        },
        {
          $project: {
            totalGenerations: { $size: '$generations' },
            totalNFTs: { $size: '$nfts' },
            tokensSpent: {
              $sum: {
                $filter: {
                  input: '$transactions',
                  as: 'tx',
                  cond: { $eq: ['$$tx.type', 'usage'] },
                },
              },
            },
            lastActivity: { $max: '$updatedAt' },
          },
        },
      ])
      .toArray();

    if (stats) {
      await this.cache.set(cacheKey, stats, CACHE_TTL);
    }

    return stats || {
      totalGenerations: 0,
      totalNFTs: 0,
      tokensSpent: 0,
      lastActivity: new Date(),
    };
  }

  async checkGenerationLimit(userId: ObjectId): Promise<boolean> {
    const user = await this.collection.findOne<UserProfile>(
      { _id: userId },
      { projection: { generationsToday: 1, lastGenerationTime: 1 } }
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Reset daily limit if last generation was yesterday
    const lastGen = user.lastGenerationTime;
    if (lastGen && this.isYesterday(lastGen)) {
      await this.updateUser(userId, { generationsToday: 0 });
      return true;
    }

    return user.generationsToday < DAILY_GENERATION_LIMIT;
  }

  async resetDailyLimits(): Promise<void> {
    await this.collection.updateMany(
      {},
      {
        $set: {
          generationsToday: 0,
          updatedAt: new Date(),
        },
      }
    );

    // Clear relevant caches
    await this.cache.flush();
  }

  private isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }
} 