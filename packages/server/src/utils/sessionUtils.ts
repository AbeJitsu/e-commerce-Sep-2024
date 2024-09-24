import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Application } from 'express';
import { logger } from '../middleware/logger';
import {
  getSessionSecret,
  isProduction,
  getDatabaseUrl,
} from '../utils/envUtils';
import { DatabaseConnectionError, handleDbOperation } from '../utils/dbUtils';

// Function to check if a session exists in the MongoDB database
export const checkSessionExists = async (
  sessionId: string
): Promise<boolean> => {
  if (!sessionId) {
    logger.error('Session ID is required to check session existence.');
    return false;
  }

  return handleDbOperation(async () => {
    if (mongoose.connection.readyState !== 1) {
      throw new DatabaseConnectionError(
        'Database connection is not established.'
      );
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new DatabaseConnectionError('Database instance is not available.');
    }

    const sessionCollection = db.collection('sessions');
    const session = await sessionCollection.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
    });

    if (session) {
      logger.info(`Session with ID ${sessionId} exists.`);
    } else {
      logger.info(`Session with ID ${sessionId} does not exist.`);
    }

    return !!session;
  }, 'Error checking session existence');
};

// Function to set up the session middleware
export const setupSession = async (app: Application): Promise<void> => {
  const mongoUrl = await getDatabaseUrl();
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error('Session secret is not set in environment variables');
  }

  app.use(
    session({
      secret: secret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: mongoUrl,
        crypto: {
          secret: secret,
        },
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: isProduction(),
        httpOnly: true,
        sameSite: 'strict',
      },
    })
  );

  logger.info('Session middleware set up successfully');
};

// Function to clear all sessions (useful for testing or admin purposes)
export const clearAllSessions = async (): Promise<void> => {
  return handleDbOperation(async () => {
    if (mongoose.connection.readyState !== 1) {
      throw new DatabaseConnectionError(
        'Database connection is not established.'
      );
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new DatabaseConnectionError('Database instance is not available.');
    }

    const sessionCollection = db.collection('sessions');
    await sessionCollection.deleteMany({});
    logger.info('All sessions cleared');
  }, 'Error clearing sessions');
};

// Function to get session data (for debugging or admin purposes)
export const getSessionData = async (sessionId: string): Promise<any> => {
  return handleDbOperation(async () => {
    if (mongoose.connection.readyState !== 1) {
      throw new DatabaseConnectionError(
        'Database connection is not established.'
      );
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new DatabaseConnectionError('Database instance is not available.');
    }

    const sessionCollection = db.collection('sessions');
    const session = await sessionCollection.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
    });
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }, 'Error retrieving session data');
};
