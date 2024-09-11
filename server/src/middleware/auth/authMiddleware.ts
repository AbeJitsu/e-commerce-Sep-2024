// src/middleware/auth/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../../models/userModel';
import mongoose from 'mongoose';

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
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const user = await User.findById(req.session.user_id).exec();
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    req.user_id = user._id.toString();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    next();
  };
};
