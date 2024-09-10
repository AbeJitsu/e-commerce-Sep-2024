import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { isProduction } from '../utils/envUtils';

const jwtSecret = process.env.SERVER_JWT_SECRET;

if (!jwtSecret) {
  console.error('SERVER_JWT_SECRET environment variable is not defined!');
}

// Utility function for logging in non-production environments
const logDebug = (message: string, ...args: any[]) => {
  if (!isProduction()) {
    console.log(message, ...args);
  }
};

// Function to generate a JWT token
export const generateToken = (user: { _id: string; role: string }) => {
  logDebug('Generating token with secret:', jwtSecret);
  return jwt.sign({ id: user._id, role: user.role }, jwtSecret!, {
    expiresIn: '30d',
  });
};

// Function to verify a JWT token
export const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret!, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

// Function to verify a plaintext password against a hashed password
export const verifyPassword = async (
  plaintextPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  logDebug('Plaintext password:', plaintextPassword);
  logDebug('Hashed password:', hashedPassword);
  return bcrypt.compare(plaintextPassword, hashedPassword);
};

// Function to hash a password
export const hashPassword = async (password: string): Promise<string> => {
  logDebug('Password being hashed:', password);
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
