import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { logger } from './logger';

declare module 'express-session' {
  interface SessionData {
    user_id?: string;
  }
}

const createSessionConfig = (mongoURI: string) => {
  if (!mongoURI) {
    throw new Error('MongoDB URI is required for session store.');
  }

  return session({
    secret: process.env.SERVER_SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoURI,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 7, // 7 days
      stringify: false,
      autoRemove: 'native',
      touchAfter: 24 * 3600, // Update session every 24 hours if not modified
    }),
    cookie: {
      maxAge: 60 * 60 * 24 * 1000 * 7, // 7 days
      secure: process.env.SERVER_NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
    name: 'sessionId',
  });
};

const applySessionMiddleware = (app: express.Application, mongoURI: string) => {
  const sessionConfig = createSessionConfig(mongoURI);
  app.use(sessionConfig);

  app.use((req, res, next) => {
    if (process.env.SERVER_NODE_ENV !== 'production') {
      logger.info(`[${new Date().toISOString()}] Request URL: ${req.url}`);
      logger.info(`Request headers: ${JSON.stringify(req.headers)}`);
    }

    if (req.sessionID) {
      logger.info(`Session ID: ${req.sessionID}`);
      if (req.session.user_id) {
        logger.info(`Existing session found for user: ${req.session.user_id}`);
      }
    }

    const originalSave = req.session.save;
    req.session.save = function (callback?: (err: any) => void) {
      logger.info(`Saving session: ${req.sessionID}`);
      return originalSave.call(this, (err: any) => {
        if (err) {
          logger.error(`Error saving session: ${err}`);
        } else {
          logger.info(`Session saved successfully: ${req.sessionID}`);
        }
        if (callback) callback(err);
      });
    };
    const originalSend = res.send;
    res.send = function (body: any) {
      if (process.env.SERVER_NODE_ENV !== 'production') {
        logger.info(`Response headers: ${JSON.stringify(res.getHeaders())}`);
      }
      return originalSend.call(this, body);
    };

    next();
  });

  logger.info('Session middleware applied.');
};

export { createSessionConfig, applySessionMiddleware };
