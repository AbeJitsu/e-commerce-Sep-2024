import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

// Middleware
app.use(cors());
app.use(express.json());

// Simple error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
);

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

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

export default app;
