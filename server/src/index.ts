import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import configureMiddleware from './config/configureMiddleware';
import connectDB from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Apply middleware configuration
configureMiddleware(app);

// Counter model
const CounterSchema = new mongoose.Schema({
  value: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', CounterSchema);

// Routes
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Welcome to EscapeRelaxandBeJeweled API' });
});

app.get('/health', async (req: express.Request, res: express.Response) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection not established',
    });
    return;
  }
  res.json({
    status: 'healthy',
    dbStatus: 'Connected to MongoDB successfully',
  });
});

app.get('/api/count', async (req: express.Request, res: express.Response) => {
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
    res.status(500).json({ error: 'Failed to update counter' });
  }
});

// Start server function
const startServer = async () => {
  try {
    await connectDB(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Initialize server
startServer();

export default app;
