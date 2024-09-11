import express, { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  isProduction,
  getBackendUrl,
  getDatabaseUrl,
} from '../utils/envUtils';

let counter = 0;

const setupTestPageRoutes = (): Router => {
  const router: Router = express.Router();

  router.get('/api/test-page', async (req: Request, res: Response) => {
    const isCloudDB = process.env.SERVER_USE_CLOUD_DB === 'true';
    const serverAddress = getBackendUrl();

    try {
      res.json({
        serverLocation: `${isProduction() ? 'production' : 'development'} at ${serverAddress}`,
        databaseLocation: isCloudDB ? 'MongoDB Atlas' : 'Local MongoDB',
        databaseURI: getDatabaseUrl(),
        counter: counter,
        dbStatus: mongoose.connection.readyState,
        message: 'API and Database connection successful',
      });
    } catch (error) {
      console.error('Error connecting to database:', error);
      res.status(500).json({
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  router.post('/api/test-page/increment-counter', (req: Request, res: Response) => {
    counter++;
    res.json({ counter: counter });
  });

  return router;
};

export default setupTestPageRoutes;
