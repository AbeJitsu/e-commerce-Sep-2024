import cors from 'cors';
import { Express } from 'express';
import { getFrontendUrl } from './envUtils';

const getCorsOptions = async (): Promise<cors.CorsOptions> => {
  const frontendUrl = await getFrontendUrl();
  console.log('CORS origin set to:', frontendUrl);
  return {
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-counter-value'],
    credentials: true,
    optionsSuccessStatus: 204,
  };
};

export const configureCors = async (app: Express): Promise<void> => {
  const corsOptions = await getCorsOptions();
  app.use(cors(corsOptions));
};

// Usage example:
// await configureCors(app);
