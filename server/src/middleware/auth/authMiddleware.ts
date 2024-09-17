// src/middleware/auth/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { User, IUser, UserRole } from '../../models/userModel';
import { handleError } from '../../utils/responseUtils'; // Import handleError utility

// Extend the Express Request type to include user and user_id
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      user_id?: string;
    }
  }
}

// Extend the Express Session type to include user_id
declare module 'express-session' {
  interface SessionData {
    user_id?: string;
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.session || !req.session.user_id) {
    handleError(
      res,
      new Error('User not authenticated'),
      'User not authenticated',
      401
    );
    return;
  }

  try {
    const user = await User.findById(req.session.user_id).exec();
    if (!user) {
      handleError(res, new Error('User not found'), 'User not found', 401);
      return;
    }

    req.user = user;
    req.user_id = user._id.toString();
    next();
  } catch (error) {
    handleError(res, error as Error, 'Internal server error', 500);
  }
};

export const roleMiddleware = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      handleError(res, new Error('Access denied'), 'Access denied', 403);
      return;
    }
    next();
  };
};
