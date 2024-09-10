// server/src/utils/responseUtils.ts

import { Response } from 'express';
import { logger } from '../middleware/logger';

export const handleError = (
  res: Response,
  error: Error,
  message: string,
  statusCode: number = 500
): void => {
  logger.error(message, { error });
  res.status(statusCode).json({ error: message });
};

export const handleSuccess = (
  res: Response,
  message: string,
  data: Record<string, any> = {},
  statusCode: number = 200
): void => {
  res.status(statusCode).json({ message, ...data });
};

export const performDbOperation = async <T>(
  res: Response,
  operation: () => Promise<T>,
  successMessage: string
): Promise<void> => {
  try {
    const result = await operation();
    handleSuccess(res, successMessage, { data: result });
  } catch (error) {
    handleError(res, error as Error, 'Database operation failed');
  }
};
