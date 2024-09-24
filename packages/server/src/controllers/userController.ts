// server/src/controllers/userController.ts

import { Request, Response } from 'express';
import { User, IUser } from '../models/userModel';

// Extend the Express Request type to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

// Method to update user's address information
export const updateAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id; // Assuming you have user id from session or JWT token
    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    const { billingAddress, shippingAddress } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { billingAddress, shippingAddress } },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).send({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Address updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).send({ message: 'Error updating address', error });
  }
};

// Method to retrieve user's address information
export const getAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id; // Assuming you have user id from session or JWT token
    if (!userId) {
      res.status(401).send({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId, 'billingAddress shippingAddress');

    if (!user) {
      res.status(404).send({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Address retrieved successfully',
      billingAddress: user.billingAddress,
      shippingAddress: user.shippingAddress,
    });
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving address', error });
  }
};
