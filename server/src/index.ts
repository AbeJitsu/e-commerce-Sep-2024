import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import configureMiddleware from './config/configureMiddleware';
import configureRoutes from './config/configureRoutes';
import connectDB from './config/db';
import { errorHandler, asyncHandler } from './middleware/errorHandling';
import { Counter } from './models/Counter';

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
configureMiddleware(app);

// Apply routes configuration
configureRoutes(app);

// Routes
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Welcome to EscapeRelaxandBeJeweled API' });
});

app.get(
  '/health',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    if (mongoose.connection.readyState !== 1) {
      res.status(500).json({
        status: 'error',
        message: 'Database connection not established',
      });
      return;
    }
    res.json({
      status: 'healthy',
      dbStatus: 'Connected to MongoDB successfully',
    });
  })
);

app.get(
  '/api/count',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    let counter = await Counter.findOne();
    if (!counter) {
      counter = new Counter({ value: 0 });
    }
    counter.value += 1;
    await counter.save();
    res.json({
      count: counter.value,
      message: 'Counter updated successfully and saved to the database',
    });
  })
);

// Apply error handling middleware
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    await connectDB(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Initialize server
startServer();

export default app;

// server/src/index.ts
