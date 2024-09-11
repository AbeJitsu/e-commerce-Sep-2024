import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../middleware/logger';

dotenv.config(); // Load environment variables from .env file

// Determine the MongoDB URI based on environment
const localMongoURI = process.env.SERVER_LOCAL_DATABASE_URL;
const cloudMongoURI = process.env.SERVER_CLOUD_DATABASE_URL;
const useCloudDB = process.env.SERVER_USE_CLOUD_DB === 'true';
const mongoURI = useCloudDB ? cloudMongoURI : localMongoURI;

let cachedDb: any = null;
let cachedClient: typeof mongoose | null = null;

interface DBConnection {
  client: typeof mongoose;
  db: any;
}

const connectDB = async (retries = 5): Promise<DBConnection> => {
  if (cachedClient && cachedDb) {
    logger.info('Using cached database instance');
    return { client: cachedClient, db: cachedDb };
  }

  try {
    logger.info(`Connecting to MongoDB with URI: ${mongoURI}`);
    // Connect to the MongoDB database
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined');
    }
    const client = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Increase timeout to 5 seconds
      maxPoolSize: 10, // Adjust based on your needs
    });
    const db = client.connection.db;

    cachedClient = client;
    cachedDb = db;

    logger.info('MongoDB connected...');
    return { client, db };
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    if (retries > 0) {
      logger.info(`Retrying connection... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    } else {
      throw err; // If no retries left, throw the error
    }
  }
};

export default connectDB;
