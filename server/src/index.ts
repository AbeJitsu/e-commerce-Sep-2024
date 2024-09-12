import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose, { Schema, Document } from 'mongoose';
import { errorHandler, asyncHandler } from './middleware/errorHandling';

// Load environment variables
dotenv.config();

// Define the Counter interface and schema
interface ICounter extends Document {
  value: number;
}

const CounterSchema: Schema = new Schema({
  value: Number,
});

const Counter = mongoose.model<ICounter>('Counter', CounterSchema);

// Initialize Express app
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Ensure MONGODB_URI is defined
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Define custom CORS options
const allowedOrigins = [
  'https://e-commerce-sep-2024.vercel.app',
  'http://localhost:9000',
];
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Handle CORS preflight requests for all routes
app.options('*', cors(corsOptions));

// Define routes
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

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start the server
async function startServer() {
  try {
    await mongoose.connect(mongoUri as string);
    console.log('Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

startServer();

// Monitor MongoDB connection
mongoose.connection.on(
  'error',
  console.error.bind(console, 'MongoDB connection error:')
);
mongoose.connection.once('open', function () {
  console.log('MongoDB connected successfully');
});

// server/src/index.ts
