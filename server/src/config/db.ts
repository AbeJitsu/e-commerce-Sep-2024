import mongoose from 'mongoose';
import { logger } from '../middleware/logger';

interface DBConnection {
  client: mongoose.Mongoose;
  db: mongoose.Connection;
}

let cachedConnection: DBConnection | null = null;

const validateMongoURI = (uri: string | undefined): string => {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  return uri;
};

const connectDB = async (
  mongoURI: string | undefined,
  retries = 5
): Promise<DBConnection> => {
  if (cachedConnection) {
    logger.info('Using cached database connection');
    return cachedConnection;
  }

  logger.info('Attempting to connect to MongoDB');

  const validatedURI = validateMongoURI(mongoURI);

  try {
    const client = await mongoose.connect(validatedURI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    cachedConnection = { client, db: client.connection };
    logger.info('MongoDB connected successfully');
    return cachedConnection;
  } catch (err) {
    if (retries > 0) {
      logger.warn(`Connection failed. Retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB(validatedURI, retries - 1);
    }
    throw new Error(
      err instanceof Error ? err.message : 'Unknown connection error'
    );
  }
};

export const closeConnection = async (): Promise<void> => {
  if (cachedConnection) {
    await cachedConnection.client.disconnect();
    cachedConnection = null;
    logger.info('MongoDB connection closed');
  }
};

export const isConnected = (): boolean => {
  return !!cachedConnection && cachedConnection.db.readyState === 1;
};

export default connectDB;

// server/src/config/db.ts
