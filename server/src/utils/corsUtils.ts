import cors from 'cors';
import { getFrontendUrl } from './envUtils';

const getCorsOptions = (): cors.CorsOptions => {
  const frontendUrl = getFrontendUrl();
  console.log('CORS origin set to:', frontendUrl);
  return {
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-counter-value'],
    credentials: true,
    optionsSuccessStatus: 204,
  };
};

export const corsMiddleware = cors(getCorsOptions());
