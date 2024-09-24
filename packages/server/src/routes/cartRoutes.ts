// server/src/routes/cartRoutes.ts

import express from 'express';
import * as cartController from '../controllers/cartController';
import { authMiddleware } from '../middleware/auth/authMiddleware';
import { ensureCartExists } from '../middleware/cartMiddleware';

const router = express.Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *       401:
 *         description: User not authenticated
 */
router.get('/', ensureCartExists, cartController.getCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item added to cart
 *       400:
 *         description: Bad request
 *       401:
 *         description: User not authenticated
 */
router.post('/add', ensureCartExists, cartController.addItemToCart);

/**
 * @swagger
 * /cart/update:
 *   post:
 *     summary: Update item quantity in cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item quantity updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: User not authenticated
 */
router.post('/update', ensureCartExists, cartController.updateItemQuantity);

/**
 * @swagger
 * /cart/remove:
 *   post:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       400:
 *         description: Bad request
 *       401:
 *         description: User not authenticated
 */
router.post('/remove', ensureCartExists, cartController.removeItemFromCart);

/**
 * @swagger
 * /cart/sync:
 *   post:
 *     summary: Sync cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 product:
 *                   type: string
 *                 quantity:
 *                   type: number
 *     responses:
 *       200:
 *         description: Cart synced successfully
 *       400:
 *         description: Bad request
 */
router.post('/sync', cartController.syncCart);

/**
 * @swagger
 * /cart/merge:
 *   post:
 *     summary: Merge guest cart with user cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 product:
 *                   type: string
 *                 quantity:
 *                   type: number
 *     responses:
 *       200:
 *         description: Cart merged successfully
 *       401:
 *         description: User not authenticated
 */
router.post('/merge', authMiddleware, cartController.mergeCart);

export default router;
