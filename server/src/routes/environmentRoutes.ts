import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Environment
 *   description: Environment management
 */

/**
 * @swagger
 * /api/toggle-environment:
 *   post:
 *     summary: Toggle environment settings
 *     tags: [Environment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               useCloudBackend:
 *                 type: boolean
 *               useCloudDB:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Environment settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 SERVER_USE_CLOUD_BACKEND:
 *                   type: string
 *                 SERVER_USE_CLOUD_DB:
 *                   type: string
 *       400:
 *         description: Invalid input. Expected boolean values.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/api/toggle-environment', (req: Request, res: Response) => {
  const { useCloudBackend, useCloudDB } = req.body;

  if (typeof useCloudBackend !== 'boolean' || typeof useCloudDB !== 'boolean') {
    return res
      .status(400)
      .json({ error: 'Invalid input. Expected boolean values.' });
  }

  process.env.SERVER_USE_CLOUD_BACKEND = useCloudBackend ? 'true' : 'false';
  process.env.SERVER_USE_CLOUD_DB = useCloudDB ? 'true' : 'false';

  res.json({
    message: 'Environment settings updated successfully',
    SERVER_USE_CLOUD_BACKEND: process.env.SERVER_USE_CLOUD_BACKEND,
    SERVER_USE_CLOUD_DB: process.env.SERVER_USE_CLOUD_DB,
  });
});

export default router;
