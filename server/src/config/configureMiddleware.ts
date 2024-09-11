import { Application } from 'express';
import { corsMiddleware } from '../utils/corsUtils';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { errorHandler } from '../middleware/errorHandling';
import { attachLogger } from '../middleware/logger';

const configureMiddleware = (app: Application): void => {
  // Apply CORS middleware before other middleware
  app.use(corsMiddleware);

  // Apply logging middleware
  app.use(attachLogger);

  // Middleware to parse JSON bodies
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Apply security headers
  app.use(helmet());

  // Apply request logging
  app.use(morgan('dev'));

  // Apply error handling middleware at the end
  app.use(errorHandler);
};

export default configureMiddleware;
