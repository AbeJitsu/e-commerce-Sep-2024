// server/src/services/cartService.ts

import mongoose, { FilterQuery } from 'mongoose';
import Cart, { ICart } from '../models/cartModel';
import { logger } from '../middleware/logger';

interface CartQuery {
  user?: string | mongoose.Types.ObjectId;
  sessionToken?: string;
  [key: string]: any; // This allows for additional properties
}

interface CartOperation {
  type: 'add' | 'update' | 'remove' | 'sync';
  quantity?: number;
  cartItems?: any[];
}

// Utility function to fetch a cart and populate items
const fetchCart = async (query: CartQuery): Promise<ICart | null> => {
  try {
    return await Cart.findOne(query as FilterQuery<ICart>).populate(
      'items.product'
    );
  } catch (error) {
    logger.error('Error fetching cart:', error);
    throw new Error('Failed to fetch cart');
  }
};

// Utility function to create a new cart if it doesn't exist
const getOrCreateCart = async (query: CartQuery): Promise<ICart> => {
  let cart = await fetchCart(query);
  if (!cart) {
    cart = new Cart({
      user: query.user,
      sessionToken: query.sessionToken,
      items: [],
    });
  }
  return cart;
};

// Utility function to save and fetch updated cart
const saveAndFetchCart = async (
  cart: ICart,
  query: CartQuery
): Promise<ICart | null> => {
  await cart.save();
  return await fetchCart(query);
};

// Utility function to handle cart item operations
const handleCartItemOperation = async (
  query: CartQuery,
  productId: string | null,
  operation: CartOperation
): Promise<ICart | null> => {
  let cart = await getOrCreateCart(query);
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  switch (operation.type) {
    case 'add':
      if (itemIndex !== -1 && operation.quantity) {
        cart.items[itemIndex].quantity += operation.quantity;
      } else if (productId && operation.quantity) {
        cart.items.push({
          product: new mongoose.Types.ObjectId(productId),
          quantity: operation.quantity,
        });
      }
      break;
    case 'update':
      if (itemIndex !== -1 && operation.quantity) {
        cart.items[itemIndex].quantity = parseInt(
          operation.quantity.toString(),
          10
        );
      }
      break;
    case 'remove':
      if (itemIndex !== -1) {
        cart.items.splice(itemIndex, 1);
      }
      break;
    case 'sync':
      if (operation.cartItems) {
        cart.items = operation.cartItems.map((item) => ({
          ...item,
          product: new mongoose.Types.ObjectId(item.product),
        }));
      }
      break;
    default:
      throw new Error('Invalid cart operation');
  }

  return await saveAndFetchCart(cart, query);
};

// Get cart
export const getCart = async (query: CartQuery): Promise<ICart | null> => {
  return await fetchCart(query);
};

// Add item to cart
export const addItemToCart = async (
  query: CartQuery,
  productId: string,
  quantity: number
): Promise<ICart | null> => {
  return await handleCartItemOperation(query, productId, {
    type: 'add',
    quantity,
  });
};

// Update item quantity in cart
export const updateItemQuantity = async (
  query: CartQuery,
  productId: string,
  quantity: number
): Promise<ICart | null> => {
  return await handleCartItemOperation(query, productId, {
    type: 'update',
    quantity,
  });
};

// Remove item from cart
export const removeItemFromCart = async (
  query: CartQuery,
  productId: string
): Promise<ICart | null> => {
  return await handleCartItemOperation(query, productId, { type: 'remove' });
};

// Sync cart
export const syncCart = async (
  query: CartQuery,
  cartItems: any[]
): Promise<ICart | null> => {
  return await handleCartItemOperation(query, null, {
    type: 'sync',
    cartItems,
  });
};

// Merge carts
export const mergeCart = async (
  userId: string,
  localCartItems: any[]
): Promise<ICart | null> => {
  try {
    let userCart = await getOrCreateCart({ user: userId });

    for (const localItem of localCartItems) {
      const itemIndex = userCart.items.findIndex(
        (item) => item.product.toString() === localItem.product._id
      );
      if (itemIndex !== -1) {
        userCart.items[itemIndex].quantity += localItem.quantity;
      } else {
        userCart.items.push({
          product: new mongoose.Types.ObjectId(localItem.product._id),
          quantity: localItem.quantity,
        });
      }
    }

    return await saveAndFetchCart(userCart, { user: userId });
  } catch (error) {
    logger.error('Failed to merge cart:', error);
    throw new Error('Failed to merge cart');
  }
};

// Convert guest cart to user cart
export const convertGuestCartToUserCart = async (
  sessionToken: string,
  userId: string
): Promise<ICart | null> => {
  try {
    const guestCart = await fetchCart({ sessionToken });
    if (!guestCart) {
      return null;
    }

    guestCart.user = new mongoose.Types.ObjectId(userId);
    guestCart.sessionToken = null;

    await guestCart.save();

    const userCart = await Cart.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      { $addToSet: { items: { $each: guestCart.items } } },
      { new: true, upsert: true }
    ).populate('items.product');

    await guestCart.deleteOne();
    return userCart;
  } catch (error) {
    logger.error('Failed to convert guest cart to user cart:', error);
    throw new Error('Failed to convert guest cart to user cart');
  }
};
