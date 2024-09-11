import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose, { Schema, Document } from 'mongoose';
import http from 'http';
import { errorHandler, asyncHandler } from './middleware/errorHandling';
import connectDB from './config/db';
import setupTestPageRoutes from './routes/testPageRoutes';
import environmentRoutes from './routes/environmentRoutes';
import {
  isProduction,
  getFrontendUrl,
  isCloudEnvironment,
} from './utils/envUtils';
import { applySessionMiddleware } from './middleware/sessionMiddleware';
import setupSwaggerDocs from './config/swaggerConfig';
import { attachLogger, logger } from './middleware/logger';
import configureRoutes from './config/configureRoutes';
import setupWebSocket from './websocket';
import Config from './config/config';

interface ICounter extends Document {
  value: number;
}

const CounterSchema: Schema = new Schema({
  value: Number,
});

const Counter = mongoose.model<ICounter>('Counter', CounterSchema);

const app = express();
const server = http.createServer(app);
const PORT = Config.PORT;

const mongoUri = Config.MONGODB_URI || Config.getDatabaseUrl();

if (!mongoUri) {
  throw new Error('MongoDB URI is not set');
}

console.log('Loaded Environment Variables:', {
  SERVER_LOCAL_DATABASE_URL: Config.SERVER_LOCAL_DATABASE_URL,
  SERVER_CLOUD_DATABASE_URL: Config.SERVER_CLOUD_DATABASE_URL,
  SERVER_USE_CLOUD_DB: Config.SERVER_USE_CLOUD_DB,
  NODE_ENV: Config.NODE_ENV,
  SERVER_CORS_ORIGIN: getFrontendUrl(),
  SERVER_LOCAL_BACKEND_URL: Config.SERVER_LOCAL_BACKEND_URL,
  IS_CLOUD_ENVIRONMENT: isCloudEnvironment(),
});

const corsOptions: cors.CorsOptions = {
  origin: getFrontendUrl(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-counter-value'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(attachLogger);
app.use(express.json());
app.use('/', environmentRoutes);
app.use('/', setupTestPageRoutes());

setupSwaggerDocs(app);

app.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ message: 'Welcome to EscapeRelaxandBeJeweled API' });
  })
);

app.get(
  '/health',
  asyncHandler(async (req: Request, res: Response) => {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not established');
    }
    const db = mongoose.connection.db!;
    await db.admin().ping();
    res.json({
      status: 'healthy',
      dbStatus: 'Connected to MongoDB successfully',
    });
  })
);

app.get(
  '/api/count',
  asyncHandler(async (req: Request, res: Response) => {
    let counter = await Counter.findOne();
    if (!counter) {
      counter = new Counter({ value: 0 });
    }
    counter.value += 1;
    await counter.save();
    res.json({
      count: counter.value,
      message: 'Counter updated successfully and saved to the database',
    });
  })
);

app.use(errorHandler);

const setupServer = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const dbConnection = await connectDB();
    console.log('MongoDB Connected after connectDB() call');

    applySessionMiddleware(app, mongoUri);

    configureRoutes(app);

    setupWebSocket(server);

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      server.close(async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        console.log('Server closed');
        process.exit(0);
      });
    });

    return { app, dbConnection };
  } catch (error) {
    console.error('Error setting up server:', error);
    throw error;
  }
};

if (require.main === module) {
  setupServer();
}

let appInstance: express.Application | null = null;

export default async (req: Request, res: Response) => {
  if (!appInstance) {
    const { app: expressApp } = await setupServer();
    appInstance = expressApp;
  }
  return appInstance(req, res);
};

mongoose.connection.on(
  'error',
  console.error.bind(console, 'MongoDB connection error:')
);
mongoose.connection.once('open', function () {
  console.log('MongoDB connected successfully');
});
