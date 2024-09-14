import { MongoClient, ObjectId, Collection } from 'mongodb';
import { logger } from '../middleware/logger';

interface Config {
  _id: string;
  useCloudBackend: boolean;
  useCloudDatabase: boolean;
  // Add other configuration properties as needed
}

const DEFAULT_CONFIG: Omit<Config, '_id'> = {
  useCloudBackend: false,
  useCloudDatabase: true,
  // Set default values for other configuration properties
};

class ConfigService {
  private static instance: ConfigService;
  private client: MongoClient;
  private cache: Config | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 60000; // 1 minute

  private constructor() {
    this.client = new MongoClient(
      process.env.MONGODB_URI || 'mongodb://localhost:27017'
    );
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async connect() {
    await this.client.connect();
    logger.info('Connected to MongoDB for configuration management');
    await this.ensureConfigExists();
  }

  private getCollection(): Collection<Config> {
    return this.client.db('config').collection<Config>('settings');
  }

  private async ensureConfigExists() {
    const collection = this.getCollection();
    const config = await collection.findOne({ _id: 'main' });
    if (!config) {
      await collection.insertOne({ _id: 'main', ...DEFAULT_CONFIG });
      logger.info('Default configuration created');
    }
  }

  async getConfig(): Promise<Config> {
    if (this.cache && Date.now() - this.lastFetchTime < this.CACHE_TTL) {
      return this.cache;
    }

    const collection = this.getCollection();
    const config = await collection.findOne({ _id: 'main' });

    if (!config) {
      await this.ensureConfigExists();
      return this.getConfig();
    }

    this.cache = config;
    this.lastFetchTime = Date.now();
    return config;
  }

  async updateConfig(newConfig: Partial<Omit<Config, '_id'>>): Promise<void> {
    const collection = this.getCollection();
    await collection.updateOne(
      { _id: 'main' },
      { $set: newConfig },
      { upsert: true }
    );
    this.cache = null; // Invalidate cache
    logger.info('Configuration updated', newConfig);
  }
}

export const configService = ConfigService.getInstance();
