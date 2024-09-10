// server/src/middleware/cartMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import Cart, { ICart } from '../models/cartModel';

// Extend the Express Request type to include cart, user_id, and sessionID
declare global {
  namespace Express {
    interface Request {
      cart?: ICart;
      user_id?: string;
      sessionID: string;
    }
  }
}

// Extend the Express Session type to include user_id
declare module 'express-session' {
  interface SessionData {
    user_id?: string;
  }
}

export const ensureCartExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let cart: ICart | null;
    const userId = req.session.user_id || req.user_id;
    const sessionToken = req.sessionID;

    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else {
      cart = await Cart.findOne({ sessionToken });
    }

    if (!cart) {
      cart = new Cart({
        user: userId || null,
        sessionToken: userId ? null : sessionToken,
      });
      await cart.save();
    }

    req.cart = cart;
    next();
  } catch (error) {
    console.error('Error ensuring cart exists', error);
    res.status(500).send({
      message: 'Failed to ensure cart',
      error: (error as Error).message,
    });
  }
};
