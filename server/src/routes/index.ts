import express from 'express';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Basic API route
router.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

export default router;

// server/src/routes/index.ts
