import {
  IAnalyticsService,
  AnalyticsEvent,
  DateRangeParams,
} from '@soba/types';
import { getMongoDB } from '../lib/mongodb';

const COLLECTIONS = {
  ANALYTICS: 'analytics',
  USERS: 'users'
} as const;

export class AnalyticsService implements IAnalyticsService {
  private get collection() {
    return getMongoDB().getCollection(COLLECTIONS.ANALYTICS);
  }

  async trackEvent(event: Partial<AnalyticsEvent>): Promise<void> {
    await this.collection.insertOne({
      ...event,
      timestamp: new Date()
    });
  }

  async aggregateByDateRange(params: DateRangeParams) {
    const { startDate, endDate } = params;
    
    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ];

    return this.collection.aggregate(pipeline).toArray();
  }
} 