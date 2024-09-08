import mongoose from 'mongoose';
import { logger } from '../middleware/logger'; // Adjust the import path as necessary

// Define custom error types
class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

class EnvironmentVariableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentVariableError';
  }
}

// Define the shape of our environment variables
interface EnvVariables {
  SERVER_USE_CLOUD_DB: string;
  SERVER_CLOUD_DATABASE_URL: string;
  SERVER_LOCAL_DATABASE_URL: string;
}

// Function to safely get environment variables
const getEnvVariable = (key: keyof EnvVariables): string => {
  const value = process.env[key];
  if (!value) {
    throw new EnvironmentVariableError(
      `Environment variable ${key} is not set`
    );
  }
  return value;
};

// Database connection function
export const connectDB = async (): Promise<void> => {
  const useCloudDB = getEnvVariable('SERVER_USE_CLOUD_DB') === 'true';
  const dbURI = useCloudDB
    ? getEnvVariable('SERVER_CLOUD_DATABASE_URL')
    : getEnvVariable('SERVER_LOCAL_DATABASE_URL');

  try {
    await mongoose.connect(dbURI);
    logger.info('MongoDB connected successfully');
  } catch (err) {
    if (err instanceof Error) {
      logger.error('MongoDB connection error:', err.message);
      throw new DatabaseConnectionError(err.message);
    } else {
      logger.error('An unknown error occurred while connecting to MongoDB');
      throw new DatabaseConnectionError('Unknown connection error');
    }
  }
};

// Disconnect function for cleanup
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (err) {
    if (err instanceof Error) {
      logger.error('MongoDB disconnection error:', err.message);
      throw new DatabaseConnectionError(err.message);
    } else {
      logger.error(
        'An unknown error occurred while disconnecting from MongoDB'
      );
      throw new DatabaseConnectionError('Unknown disconnection error');
    }
  }
};
