import { ObjectId } from 'mongodb';
import type {
  GenerationActivity,
  IGenerationService,
  UserActivityParams,
  GenerationStats,
  DateRangeParams,
  Collections,
  CacheKeys,
} from '@soba/types';
import { getMongoDB } from '../lib/mongodb';
import { getRedisCache } from '../lib/redis';

const CACHE_TTL = 1800; // 30 minutes

export class GenerationService implements IGenerationService {
  private get collection() {
    return getMongoDB().getCollection(Collections.GENERATIONS);
  }

  private get cache() {
    return getRedisCache();
  }

  async createGeneration(data: Partial<GenerationActivity>): Promise<GenerationActivity> {
    const now = new Date();
    const generation: Omit<GenerationActivity, '_id'> = {
      userId: data.userId!,
      walletAddress: data.walletAddress!,
      prompt: data.prompt!,
      style: data.style,
      settings: data.settings || {},
      status: 'pending',
      tokensUsed: 1,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(generation);
    const created = { ...generation, _id: result.insertedId };

    // Cache the generation
    await this.cache.set(
      CacheKeys.generationActivity(result.insertedId.toString()),
      created,
      CACHE_TTL
    );

    return created;
  }

  async getGenerationById(id: ObjectId): Promise<GenerationActivity | null> {
    // Try cache first
    const cacheKey = CacheKeys.generationActivity(id.toString());
    const cached = await this.cache.get<GenerationActivity>(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const generation = await this.collection.findOne<GenerationActivity>({ _id: id });
    if (generation) {
      await this.cache.set(cacheKey, generation, CACHE_TTL);
    }

    return generation;
  }

  async getUserGenerations(params: UserActivityParams): Promise<GenerationActivity[]> {
    const { userId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const query: any = { userId };
    if (params.startDate || params.endDate) {
      query.createdAt = {};
      if (params.startDate) query.createdAt.$gte = params.startDate;
      if (params.endDate) query.createdAt.$lte = params.endDate;
    }

    const generations = await this.collection
      .find<GenerationActivity>(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return generations;
  }

  async updateGeneration(
    id: ObjectId,
    updates: Partial<GenerationActivity>
  ): Promise<GenerationActivity> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Generation not found');
    }

    // Update cache
    await this.cache.set(
      CacheKeys.generationActivity(id.toString()),
      result,
      CACHE_TTL
    );

    return result;
  }

  async getGenerationStats(
    userId: ObjectId,
    dateRange?: DateRangeParams
  ): Promise<GenerationStats> {
    const match: any = { userId };
    if (dateRange?.startDate || dateRange?.endDate) {
      match.createdAt = {};
      if (dateRange?.startDate) match.createdAt.$gte = dateRange.startDate;
      if (dateRange?.endDate) match.createdAt.$lte = dateRange.endDate;
    }

    const [stats] = await this.collection
      .aggregate<GenerationStats>([
        { $match: match },
        {
          $facet: {
            totalCount: [{ $count: 'count' }],
            successCount: [
              { $match: { status: 'completed' } },
              { $count: 'count' },
            ],
            processingTimes: [
              { $match: { 'metadata.processingTime': { $exists: true } } },
              { $group: { _id: null, avg: { $avg: '$metadata.processingTime' } } },
            ],
            styles: [
              { $match: { style: { $exists: true } } },
              { $group: { _id: '$style', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
          },
        },
        {
          $project: {
            totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
            successRate: {
              $multiply: [
                {
                  $divide: [
                    { $arrayElemAt: ['$successCount.count', 0] },
                    { $arrayElemAt: ['$totalCount.count', 0] },
                  ],
                },
                100,
              ],
            },
            averageProcessingTime: {
              $arrayElemAt: ['$processingTimes.avg', 0],
            },
            popularStyles: {
              $map: {
                input: '$styles',
                as: 'style',
                in: {
                  style: '$$style._id',
                  count: '$$style.count',
                },
              },
            },
          },
        },
      ])
      .toArray();

    return {
      totalCount: stats?.totalCount || 0,
      successRate: stats?.successRate || 0,
      averageProcessingTime: stats?.averageProcessingTime || 0,
      popularStyles: stats?.popularStyles || [],
    };
  }
} 