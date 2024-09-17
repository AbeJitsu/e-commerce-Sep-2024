import express from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/errorHandling';
import { Counter } from '../models/Counter';

const router = express.Router();

// Root route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to EscapeRelaxandBeJeweled API' });
});

// Health check route
router.get(
  '/health',
  asyncHandler(async (req, res) => {
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
  })
);

// Counter route
router.get(
  '/api/count',
  asyncHandler(async (req, res) => {
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

// Basic API route
router.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

export default router;

// server/src/routes/index.ts
