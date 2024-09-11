// server/src/models/userModel.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
// import bcrypt from 'bcryptjs';

interface IAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  preferredFirstName: string;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;
  role: 'user' | 'admin' | 'vip';
  // comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  // You can add any static methods here if needed
}

const addressSchema = new Schema<IAddress>({
  street: { type: String, required: true, trim: true },
  apartment: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zip: { type: String, required: true, trim: true },
});

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: { type: String, required: true, minlength: 8 },
  preferredFirstName: { type: String, required: true, maxlength: 20 },
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  role: { type: String, enum: ['user', 'admin', 'vip'], default: 'user' },
});

// Pre-save hook to hash the password
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    // const salt = await bcrypt.genSalt(10);
    // this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare candidate password with hashed password
/* userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
}; */

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export { User, IUserModel };
