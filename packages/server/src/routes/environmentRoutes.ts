import express, { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandling';
import { logger } from '../middleware/logger';
import { configService } from '../services/configService';

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
 *                 useCloudBackend:
 *                   type: boolean
 *                 useCloudDB:
 *                   type: boolean
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
router.post(
  '/toggle-environment',
  asyncHandler(async (req: Request, res: Response) => {
    const { useCloudBackend, useCloudDB } = req.body;

    if (
      typeof useCloudBackend !== 'boolean' ||
      typeof useCloudDB !== 'boolean'
    ) {
      return res
        .status(400)
        .json({ error: 'Invalid input. Expected boolean values.' });
    }

    await configService.updateConfig({
      useCloudBackend,
      useCloudDatabase: useCloudDB,
    });

    logger.info(
      `Environment settings updated: useCloudBackend=${useCloudBackend}, useCloudDB=${useCloudDB}`
    );

    const updatedConfig = await configService.getConfig();

    res.json({
      message: 'Environment settings updated successfully',
      useCloudBackend: updatedConfig.useCloudBackend,
      useCloudDB: updatedConfig.useCloudDatabase,
    });
  })
);

export default router;
