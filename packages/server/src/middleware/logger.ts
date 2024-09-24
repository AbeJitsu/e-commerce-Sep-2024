import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { NODE_ENV } from '../utils/envUtils';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'debug',
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'error',
    })
  );
}

const attachLogger = (req: Request, res: Response, next: NextFunction) => {
  (req as any).logger = logger;
  next();
};

export { logger, attachLogger };

// server/src/middleware/logger.ts
