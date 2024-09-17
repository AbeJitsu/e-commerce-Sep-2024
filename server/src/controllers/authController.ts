// server/src/controllers/authController.ts

import { Request, Response } from 'express';
import { Session } from 'express-session';
import validator from 'validator';
import { logger } from '../middleware/logger';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import * as cartService from '../services/cartService';
import { IUser, UserRole } from '../models/userModel';
import { handleError, handleSuccess } from '../utils/responseUtils';

interface AuthenticatedRequest extends Request {
  session: Session & { user_id?: string };
  sessionID: string;
  user_id?: string;
}

interface AuthRequestBody {
  email: string;
  password: string;
  preferredFirstName?: string;
}

const validateInput = (
  input: Partial<AuthRequestBody>
): { valid: boolean; error?: string } => {
  if (!input.email || !validator.isEmail(input.email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (!input.password || input.password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long',
    };
  }
  return { valid: true };
};

const handleAuthError = (res: Response, error: any, message: string) => {
  logger.error(message, { error });
  handleError(res, error, message);
};

export const register = async (req: Request, res: Response) => {
  const { email, password, preferredFirstName } =
    req.body as Partial<AuthRequestBody>;
  const validation = validateInput({ email, password });
  if (!validation.valid) {
    return handleError(
      res,
      new Error(validation.error!),
      validation.error!,
      400
    );
  }

  try {
    const existingUser: IUser | null = await userService.getUserByEmail(email!);
    if (existingUser) {
      return handleError(
        res,
        new Error('User already exists'),
        'User already exists',
        409
      );
    }

    const hashedPassword = await authService.hashPassword(password!);
    const newUser: IUser = await userService.createUser({
      email: email!,
      password: hashedPassword,
      preferredFirstName,
    });

    logger.info(`User registered successfully`, { email: newUser.email });
    handleSuccess(res, 'User registered successfully. Please log in.', {}, 201);
  } catch (error) {
    handleAuthError(res, error, 'An error occurred during registration');
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as Partial<AuthRequestBody>;
  const validation = validateInput({ email, password });
  if (!validation.valid) {
    return handleError(
      res,
      new Error(validation.error!),
      validation.error!,
      400
    );
  }

  try {
    const user: IUser | null = await userService.getUserByEmail(email!);
    if (
      !user ||
      !(await authService.verifyPassword(password!, user.password))
    ) {
      return handleError(
        res,
        new Error('Invalid credentials'),
        'Invalid email and/or password',
        401
      );
    }

    const token = authService.generateToken({
      _id: user._id.toString(),
      role: user.role,
    });
    (req as AuthenticatedRequest).session.user_id = user._id.toString();
    (req as AuthenticatedRequest).user_id = user._id.toString();

    const guestCartConversion = await cartService.convertGuestCartToUserCart(
      (req as AuthenticatedRequest).sessionID,
      user._id.toString()
    );

    logger.info(`User logged in successfully`, { userId: user._id });
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
    handleAuthError(res, error, 'An internal error occurred during login');
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  logger.debug('Logging out user with session ID:', { session: req.session });
  if (!req.session) {
    return handleError(
      res,
      new Error('No session found'),
      'No session found',
      400
    );
  }

  req.session.destroy((err: Error | null) => {
    if (err) {
      return handleAuthError(res, err, 'Failed to log out, please try again');
    }
    res.clearCookie('connect.sid');
    logger.info(`User logged out successfully`);
    handleSuccess(res, 'Logged out successfully');
  });
};

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user_id) {
    return handleError(
      res,
      new Error('User not authenticated'),
      'User not authenticated',
      401
    );
  }

  try {
    const user: IUser | null = await userService.getUserById(req.user_id);
    if (!user) {
      return handleError(
        res,
        new Error('User not found'),
        'User not found',
        404
      );
    }

    logger.info(`User profile fetched successfully`, { userId: req.user_id });
    handleSuccess(res, 'User profile fetched successfully', {
      preferredFirstName: user.preferredFirstName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    handleAuthError(
      res,
      error,
      'An internal error occurred during fetching user profile'
    );
  }
};

export const changeUserRole = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { userId, role } = req.body;
  if (!Object.values(UserRole).includes(role)) {
    return handleError(res, new Error('Invalid role'), 'Invalid role', 400);
  }

  try {
    const user: IUser | null = await userService.getUserById(userId);
    if (!user) {
      return handleError(
        res,
        new Error('User not found'),
        'User not found',
        404
      );
    }
    user.role = role;
    await user.save();
    logger.info(`User role updated successfully`, { userId, newRole: role });
    handleSuccess(res, 'User role updated successfully');
  } catch (error) {
    handleAuthError(res, error, 'Error updating user role');
  }
};
