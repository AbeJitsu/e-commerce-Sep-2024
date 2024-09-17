import dotenv from 'dotenv';
import express from 'express';
import configMiddleware from './config/configMiddleware';
import configRoutes from './config/configRoutes';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandling';
import { logger } from './middleware/logger';

dotenv.config();

const app = express();

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

const PORT = parseInt(getEnvVar('PORT', '3000'), 10);
const MONGODB_URI = getEnvVar('MONGODB_URI');

// Apply middleware configuration
configMiddleware(app);

// Apply routes configuration
configRoutes(app);

// Apply error handling middleware
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    await connectDB(MONGODB_URI);
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Initialize server
startServer();

export default app;

// server/src/index.ts
