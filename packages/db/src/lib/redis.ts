import Redis from 'ioredis';
import { CacheKeys } from '@soba/types';

export class RedisCache {
  private client: Redis | null = null;

  async connect(url: string): Promise<void> {
    if (this.client) return;
    this.client = new Redis(url);
  }

  private getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis not connected');
    }
    return this.client;
  }

  async get<T>(key: keyof typeof CacheKeys): Promise<T | null> {
    const value = await this.getClient().get(String(key));
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set<T>(key: keyof typeof CacheKeys, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.getClient().setex(String(key), ttl, serialized);
    } else {
      await this.getClient().set(String(key), serialized);
    }
  }

  async del(key: keyof typeof CacheKeys): Promise<void> {
    await this.getClient().del(String(key));
  }

  async incr(key: string): Promise<number> {
    return this.getClient().incr(key);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    return this.getClient().expire(key, seconds) === 1;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
} 