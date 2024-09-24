// server/src/controllers/cartController.ts

import { Request, Response } from 'express';
import Cart from '../models/cartModel';
import Product from '../models/productModel';
import * as cartService from '../services/cartService';

// Extend the Express Request type to include sessionID and user_id
declare module 'express-serve-static-core' {
  interface Request {
    sessionID: string;
    user_id?: string;
  }
}

// Extend the Express Session type to include isInitialized
declare module 'express-session' {
  interface SessionData {
    user_id?: string;
    isInitialized?: boolean;
  }
}

// Utility function to construct the query object
const getCartQuery = (req: Request) => {
  const sessionId = req.sessionID;
  const userId = req.session.user_id || req.user_id;
  return userId ? { user: userId } : { sessionToken: sessionId };
};

// Utility function to handle errors
const handleError = (
  res: Response,
  error: Error,
  message: string,
  statusCode = 500
) => {
  console.error(message, error);
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

// Get cart
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = getCartQuery(req);
    const cart = await cartService.getCart(query);
    if (!cart) {
      res.status(404).send({ message: 'Cart not found' });
      return;
    }
    handleSuccess(res, 'Cart retrieved successfully', cart);
  } catch (error) {
    handleError(res, error as Error, 'Failed to retrieve cart');
  }
};

// Add item to cart
export const addItemToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    res
      .status(400)
      .send({ message: "'productId' and 'quantity' are required." });
    return;
  }

  try {
    const query = getCartQuery(req);
    const cart = await cartService.addItemToCart(query, productId, quantity);
    if (!cart) {
      res.status(500).send({
        message: 'Failed to add item to cart. Cart not found or created.',
      });
      return;
    }
    handleSuccess(res, 'Item added to cart successfully', cart);

    // Ensure session is saved
    if (!req.session.isInitialized) {
      req.session.isInitialized = true;
      await new Promise<void>((resolve) => req.session.save(() => resolve()));
    }
  } catch (error) {
    handleError(res, error as Error, 'Failed to add item to cart');
  }
};

// Update item quantity in cart
export const updateItemQuantity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId, quantity } = req.body;

  try {
    const query = getCartQuery(req);
    const cart = await cartService.updateItemQuantity(
      query,
      productId,
      quantity
    );
    if (!cart) {
      res
        .status(500)
        .send({ message: 'Failed to update item quantity. Cart not found.' });
      return;
    }
    handleSuccess(res, 'Item quantity updated successfully', cart);
  } catch (error) {
    handleError(res, error as Error, 'Failed to update item quantity');
  }
};

// Remove item from cart
export const removeItemFromCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId } = req.params;

  try {
    const query = getCartQuery(req);
    const cart = await cartService.removeItemFromCart(query, productId);
    if (!cart) {
      res
        .status(500)
        .send({ message: 'Failed to remove item from cart. Cart not found.' });
      return;
    }
    handleSuccess(res, 'Item removed from cart successfully', cart);
  } catch (error) {
    handleError(res, error as Error, 'Failed to remove item from cart');
  }
};

// Sync cart
export const syncCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = getCartQuery(req);
    const cart = await cartService.syncCart(query, req.body.cartItems);
    if (!cart) {
      res
        .status(500)
        .send({ message: 'Failed to sync cart. Cart not found or created.' });
      return;
    }
    handleSuccess(res, 'Cart synced successfully', cart);

    // Ensure session is saved
    if (!req.session.isInitialized) {
      req.session.isInitialized = true;
      await new Promise<void>((resolve) => req.session.save(() => resolve()));
    }
  } catch (error) {
    handleError(res, error as Error, 'Failed to sync cart');
  }
};

// Merge carts
export const mergeCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = getCartQuery(req);
    const mergedCart = await cartService.mergeCart(
      query.user as string,
      req.body.localCartItems
    );
    if (!mergedCart) {
      res
        .status(500)
        .send({ message: 'Failed to merge cart. Cart not found or created.' });
      return;
    }
    handleSuccess(res, 'Cart merged successfully', mergedCart);

    // Ensure session is saved
    if (!req.session.isInitialized) {
      req.session.isInitialized = true;
      await new Promise<void>((resolve) => req.session.save(() => resolve()));
    }
  } catch (error) {
    handleError(res, error as Error, 'Failed to merge cart');
  }
};
