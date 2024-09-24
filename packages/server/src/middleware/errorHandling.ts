import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  customMessage?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error stack:', err.stack);

  // Note: We're not using req.session here as it's not set up yet.
  // If you add session handling later, you can uncomment this:
  // const sessionData = req.session as any;
  // console.error('User ID:', sessionData?.user_id);

  const statusCode = err.status || 500;
  const errorMessage = err.customMessage || 'An unexpected error occurred';

  res.status(statusCode).json({
    message: errorMessage,
    error: err.message || 'An unexpected error has occurred.',
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// server/src/middleware/errorHandling.ts
