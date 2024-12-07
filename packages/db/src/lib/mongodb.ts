import { MongoClient, Db, Collection } from 'mongodb';
import { Collections } from '@soba/types';

export class MongoDB {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;

  async connect(uri: string, dbName: string): Promise<void> {
    if (this.client) return;
    
    if (this.isConnecting && this.connectionPromise) {
      await this.connectionPromise;
      return;
    }

    this.isConnecting = true;
    
    try {
      this.connectionPromise = new Promise(async (resolve, reject) => {
        try {
          this.client = await MongoClient.connect(uri);
          this.db = this.client.db(dbName);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  getCollection<T = any>(name: keyof typeof Collections): Collection<T> {
    return this.getDb().collection<T>(name);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
} 