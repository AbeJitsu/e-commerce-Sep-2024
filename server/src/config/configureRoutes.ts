import { Application } from 'express';
import routes from '../routes/index';

const configureRoutes = (app: Application): void => {
  // Use the main router from routes/index.ts
  app.use('/', routes);
};

export default configureRoutes;

// server/src/config/configureRoutes.ts
