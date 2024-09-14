import express, { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandling';
import { logger } from '../middleware/logger';
import {
  isProduction,
  getBackendUrl,
  getDatabaseUrl,
  isCloudDatabase,
} from '../utils/envUtils';
import { getConnectionStatus, handleDbOperation } from '../utils/dbUtils';
import { Counter } from '../models/Counter';

const setupTestPageRoutes = (): Router => {
  const router: Router = express.Router();

  router.get(
    '/api/test-page',
    asyncHandler(async (req: Request, res: Response) => {
      const serverAddress = await getBackendUrl();
      const isCloudDB = await isCloudDatabase();

      const dbInfo = await handleDbOperation(async () => {
        const counter = await Counter.findOneAndUpdate(
          {},
          { $inc: { value: 1 } },
          { upsert: true, new: true }
        );

        return {
          databaseLocation: isCloudDB ? 'MongoDB Atlas' : 'Local MongoDB',
          databaseURI: await getDatabaseUrl(),
          count: counter.value,
          dbStatus: getConnectionStatus(),
        };
      });

      res.json({
        serverLocation: `${
          isProduction() ? 'production' : 'development'
        } at ${serverAddress}`,
        ...dbInfo,
        message: 'API and Database connection successful',
      });
    })
  );

  router.post(
    '/api/test-page/increment-counter',
    asyncHandler(async (req: Request, res: Response) => {
      const counter = await handleDbOperation(() =>
        Counter.findOneAndUpdate(
          {},
          { $inc: { value: 1 } },
          { upsert: true, new: true }
        )
      );

      res.json({ count: counter.value });
    })
  );

  router.get(
    '/api/count',
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();
      try {
        const counter = await handleDbOperation(() => Counter.findOne({}));
        const endTime = Date.now();
        logger.info(`Counter fetch took ${endTime - startTime}ms`);
        res.json({ count: counter ? counter.value : 0 });
      } catch (error) {
        logger.error('Error fetching counter:', error);
        res.status(500).json({ error: 'Failed to fetch counter' });
      }
    })
  );

  // Simple health check endpoint
  router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
  });

  return router;
};

export default setupTestPageRoutes;
