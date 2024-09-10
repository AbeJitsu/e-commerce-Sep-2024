import User from '../models/userModel';
import { handleDbOperation } from '../utils/dbUtils';

export const createUser = (userData: any) => {
  return handleDbOperation(
    () => new User(userData).save(),
    'User created successfully'
  );
};

export const getUserById = (userId: string) => {
  return handleDbOperation(
    () => User.findById(userId),
    'User fetched successfully by ID'
  );
};

export const updateUser = (userId: string, updateData: any) => {
  return handleDbOperation(
    () => User.findByIdAndUpdate(userId, updateData, { new: true }),
    'User updated successfully'
  );
};

export const deleteUser = (userId: string) => {
  return handleDbOperation(
    () => User.findByIdAndDelete(userId),
    'User deleted successfully'
  );
};

export const getUserByEmail = (email: string) => {
  const sanitizedEmail = email.trim().toLowerCase();
  return handleDbOperation(
    () => User.findOne({ email: sanitizedEmail }),
    `User fetched successfully by email: ${sanitizedEmail}`
  );
};
