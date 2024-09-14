import cors from 'cors';
import { Express, RequestHandler } from 'express';
import { getFrontendUrl } from './envUtils';
import { logger } from '../middleware/logger';

const getCorsOptions = async (): Promise<cors.CorsOptions> => {
  const frontendUrl = await getFrontendUrl();
  logger.info('CORS origin set to:', frontendUrl);

  return {
    origin: (origin, callback) => {
      if (!origin || origin === frontendUrl) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-counter-value'],
    credentials: true,
    optionsSuccessStatus: 204,
  };
};

export const configureCors = async (): Promise<RequestHandler> => {
  const corsOptions = await getCorsOptions();
  return cors(corsOptions);
};

export const applyCors = async (app: Express): Promise<void> => {
  const corsMiddleware = await configureCors();
  app.use(corsMiddleware);
  logger.info('CORS middleware applied');
};

// Usage examples:
// 1. To apply CORS directly to the app:
//    await applyCors(app);
//
// 2. To get the CORS middleware for custom use:
//    const corsMiddleware = await configureCors();
//    app.use('/api', corsMiddleware);
