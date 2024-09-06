import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose, { Schema, Document } from 'mongoose';

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
const PORT = process.env.PORT || 3000;

// Ensure MONGODB_URI is defined
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Define custom CORS options
const corsOptions = {
  origin: 'https://e-commerce-sep-2024.vercel.app', // Allow requests from the Vercel frontend
  credentials: true, // Allow credentials if needed
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Handle CORS preflight requests for all routes
app.options('*', cors(corsOptions));

// Define routes
app.get('/', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not established');
    }

    const db = mongoose.connection.db!;
    await db.admin().ping();

    res.json({
      message: 'Welcome to EscapeRelaxandBeJeweled API',
      dbStatus: 'Connected to MongoDB successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Welcome to EscapeRelaxandBeJeweled API',
      dbStatus: 'Failed to connect to MongoDB',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/count', async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUri as string);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

connectToDatabase();

// Monitor MongoDB connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log('MongoDB connected successfully');
});

// server/src/index.ts
