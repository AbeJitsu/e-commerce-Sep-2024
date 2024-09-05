import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose, { Schema, Document } from 'mongoose';

dotenv.config();

interface ICounter extends Document {
  value: number;
}

const CounterSchema: Schema = new Schema({
  value: Number,
});

const Counter = mongoose.model<ICounter>('Counter', CounterSchema);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure MONGODB_URI is defined
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Enable CORS for all routes
app.use(cors());

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

app.get('/count', async (req: Request, res: Response) => {
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
    }); // Add message here
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUri as string); // Type assertion here
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

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log('MongoDB connected successfully');
});

// server/src/index.ts
