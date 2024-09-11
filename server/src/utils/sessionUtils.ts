import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Application } from 'express';

// Function to check if a session exists in the MongoDB database
export const checkSessionExists = async (
  sessionId: string
): Promise<boolean> => {
  if (!sessionId) {
    console.error('Session ID is required to check session existence.');
    return false;
  }

  try {
    // Ensure the database connection is established
    if (mongoose.connection.readyState !== 1) {
      console.error('Database connection is not established.');
      return false;
    }

    const sessionCollection = mongoose.connection.db.collection('sessions');
    const session = await sessionCollection.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
    });

    if (session) {
      console.log(`Session with ID ${sessionId} exists.`);
    } else {
      console.log(`Session with ID ${sessionId} does not exist.`);
    }

    return !!session;
  } catch (error) {
    console.error('Error checking session existence:', error);
    return false;
  }
};

// Function to set up the session middleware
export const setupSession = (app: Application, mongoURI: string): void => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'secret',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: mongoURI }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      },
    })
  );
};
