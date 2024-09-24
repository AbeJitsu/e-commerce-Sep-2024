import { Application } from 'express';
import routes from '../routes/index';

const configRoutes = (app: Application): void => {
  // Use the main router from routes/index.ts
  app.use('/', routes);
};

export default configRoutes;

// server/src/config/configRoutes.ts
