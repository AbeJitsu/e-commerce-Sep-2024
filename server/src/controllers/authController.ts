// server/src/controllers/authController.ts

import { Request, Response } from 'express';
import validator from 'validator';
import { logger } from '../middleware/logger';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import * as cartService from '../services/cartService';
import { IUser } from '../models/userModel';

// Extend the Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user_id?: string;
  }
}

// Utility function to handle errors
const handleError = (
  res: Response,
  error: Error,
  message: string,
  statusCode = 500
) => {
  logger.error(message, { error });
  res.status(statusCode).json({ error: message });
};

// Utility function to handle success responses
const handleSuccess = (
  res: Response,
  message: string,
  data = {},
  statusCode = 200
) => {
  res.status(statusCode).json({ message, ...data });
};

// Utility function for email and password validation
const validateEmailAndPassword = (email: string, password: string) => {
  if (!validator.isEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long',
    };
  }
  return { valid: true };
};

// Register function
export const register = async (req: Request, res: Response) => {
  const { email, password, preferredFirstName } = req.body;
  const validation = validateEmailAndPassword(email, password);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await authService.hashPassword(password);
    await userService.createUser({
      email,
      password: hashedPassword,
      preferredFirstName,
    });

    handleSuccess(res, 'User registered successfully. Please log in.', {}, 201);
  } catch (error) {
    handleError(res, error as Error, 'An error occurred during registration');
  }
};

// Login function
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const validation = validateEmailAndPassword(email, password);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const user = (await userService.getUserByEmail(email)) as IUser | null;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email and/or password' });
    }

    const isPasswordValid = await authService.verifyPassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = authService.generateToken({
      _id: user._id.toString(),
      role: user.role,
    });
    req.session.user_id = user._id.toString();
    req.user_id = user._id.toString();

    const guestCartConversion = await cartService.convertGuestCartToUserCart(
      req.sessionID,
      user._id.toString()
    );

    handleSuccess(res, 'Login successful', {
      user: {
        _id: user._id.toString(),
        email: user.email,
        preferredFirstName: user.preferredFirstName,
        role: user.role,
      },
      token,
      guestCartConversion,
    });
  } catch (error) {
    handleError(res, error as Error, 'An internal error occurred during login');
  }
};

// Logout function
export const logout = async (req: Request, res: Response) => {
  try {
    logger.debug('Logging out user with session ID:', { session: req.session });
    if (!req.session) {
      throw new Error('No session found');
    }
    req.session.destroy((err) => {
      if (err) {
        return handleError(res, err, 'Failed to log out, please try again');
      }
      res.clearCookie('connect.sid');
      handleSuccess(res, 'Logged out successfully');
    });
  } catch (error) {
    handleError(res, error as Error, 'An error occurred during logout');
  }
};

// Get user profile function
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    logger.debug('Fetching user profile for user_id:', {
      user_id: req.user_id,
    });

    const user = (await userService.getUserById(req.user_id)) as IUser | null;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    handleSuccess(res, 'User profile fetched successfully', {
      preferredFirstName: user.preferredFirstName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    handleError(
      res,
      error as Error,
      'An internal error occurred during fetching user profile'
    );
  }
};

// Change user role function
export const changeUserRole = async (req: Request, res: Response) => {
  const { userId, role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = (await userService.getUserById(userId)) as IUser | null;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = role as 'user' | 'admin';
    await user.save();
    handleSuccess(res, 'User role updated successfully');
  } catch (error) {
    handleError(res, error as Error, 'Error updating user role');
  }
};
