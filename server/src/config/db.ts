import mongoose from 'mongoose';
import { logger } from '../middleware/logger';
import { getDatabaseUrl } from '../utils/envUtils';
import { DatabaseConnectionError, handleDbOperation } from '../utils/dbUtils';

interface DBConnection {
  client: mongoose.Mongoose;
  db: mongoose.Connection;
}

let cachedConnection: DBConnection | null = null;

const connectDB = async (retries = 5): Promise<DBConnection> => {
  if (cachedConnection) {
    logger.info('Using cached database connection');
    return cachedConnection;
  }

  const mongoURI = await getDatabaseUrl();
  logger.info('Attempting to connect to MongoDB');

  if (!mongoURI) {
    throw new DatabaseConnectionError('MongoDB URI is not defined');
  }

  try {
    const client = await handleDbOperation(() =>
      mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      })
    );

    cachedConnection = { client, db: client.connection };
    logger.info('MongoDB connected successfully');
    return cachedConnection;
  } catch (err) {
    if (retries > 0) {
      logger.warn(`Connection failed. Retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }
    throw new DatabaseConnectionError(
      err instanceof Error ? err.message : 'Unknown connection error'
    );
  }
};

export const getConnection = async (): Promise<DBConnection> => {
  if (!cachedConnection) {
    return connectDB();
  }
  return cachedConnection;
};

export const closeConnection = async (): Promise<void> => {
  if (cachedConnection) {
    try {
      await cachedConnection.client.disconnect();
      cachedConnection = null;
      logger.info('MongoDB connection closed');
    } catch (err) {
      logger.error('Error closing MongoDB connection:', err);
      throw new DatabaseConnectionError(
        err instanceof Error ? err.message : 'Unknown disconnection error'
      );
    }
  }
};

export const isConnected = (): boolean => {
  return !!cachedConnection && cachedConnection.db.readyState === 1;
};

export { connectDB };
export default connectDB;
