import { User, IUser } from '../models/userModel';
import { handleDbOperation } from '../utils/dbUtils';

export const createUser = (userData: any) => {
  return handleDbOperation(() => new User(userData).save());
};

export const getUserById = (userId: string) => {
  return handleDbOperation(() => User.findById(userId));
};

export const updateUser = (userId: string, updateData: any) => {
  return handleDbOperation(() =>
    User.findByIdAndUpdate(userId, updateData, { new: true })
  );
};

export const deleteUser = (userId: string) => {
  return handleDbOperation(() => User.findByIdAndDelete(userId));
};

export const getUserByEmail = (email: string) => {
  const sanitizedEmail = email.trim().toLowerCase();
  return handleDbOperation(() => User.findOne({ email: sanitizedEmail }));
};
