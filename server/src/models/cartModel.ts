// server/src/models/cartModel.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './userModel';
import { IProduct } from './productModel';

export interface ICartItem {
  product: IProduct['_id'];
  quantity: number;
}

export interface ICart extends Document {
  user: IUser['_id'] | null;
  sessionToken: string | null;
  items: ICartItem[];
}

interface ICartModel extends Model<ICart> {
  convertGuestCartToUserCart(
    sessionToken: string,
    userId: string
  ): Promise<ICart | null>;
}

const cartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 0 },
});

const cartSchema = new Schema<ICart>({
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  sessionToken: { type: String, default: null },
  items: [cartItemSchema],
});

cartSchema.index({ user: 1, sessionToken: 1 }, { unique: true });

cartSchema.pre<ICart>('save', function (next) {
  if (!this.user && !this.sessionToken) {
    return next(new Error('A cart must have either a user or a session token'));
  }
  next();
});

cartSchema.statics.convertGuestCartToUserCart = async function (
  this: ICartModel,
  sessionToken: string,
  userId: string
): Promise<ICart | null> {
  console.log(
    `Attempting to convert guest cart to user cart for sessionToken: ${sessionToken}, userId: ${userId}`
  );
  const guestCart = await this.findOne({ sessionToken });
  if (!guestCart) {
    console.log('Guest cart not found for sessionToken:', sessionToken);
    return null;
  }
  console.log('Guest cart found:', guestCart);
  let userCart = await this.findOne({ user: userId });
  if (userCart) {
    console.log('User cart found, merging items...');
    guestCart.items.forEach((guestItem: ICartItem) => {
      const itemIndex = userCart!.items.findIndex(
        (userItem: ICartItem) =>
          userItem.product.toString() === guestItem.product.toString()
      );
      if (itemIndex !== -1) {
        userCart!.items[itemIndex].quantity += guestItem.quantity;
      } else {
        userCart!.items.push(guestItem);
      }
    });
    await guestCart.deleteOne();
  } else {
    console.log('No existing user cart. Assigning user to guest cart...');
    guestCart.user = userId;
    guestCart.sessionToken = null;
    userCart = guestCart;
  }
  const savedCart = await userCart.save();
  console.log('Cart after conversion:', savedCart);
  return savedCart;
};

const Cart = mongoose.model<ICart, ICartModel>('Cart', cartSchema);

export default Cart;
