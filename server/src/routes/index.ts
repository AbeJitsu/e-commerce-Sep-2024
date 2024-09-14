import express from 'express';
import environmentRoutes from './environmentRoutes';
import testPageRoutes from './testPageRoutes';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Use environment routes
router.use('/api', environmentRoutes);

// Use test page routes
router.use('/api', testPageRoutes);

export default router;

// server/src/routes/index.ts
