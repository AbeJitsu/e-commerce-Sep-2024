import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { attachLogger } from '../middleware/logger';

const configureMiddleware = (app: Application): void => {
  // Apply logging middleware
  app.use(attachLogger);

  // Basic CORS setup
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Middleware to parse JSON bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply security headers
  app.use(helmet());

  // Apply request logging
  app.use(morgan('dev'));
};

export default configureMiddleware;

// server/src/config/configureMiddleware.ts
