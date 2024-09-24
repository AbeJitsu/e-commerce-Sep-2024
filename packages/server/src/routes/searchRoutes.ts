import express from 'express';
import { asyncHandler } from '../middleware/errorHandling';
import * as searchController from '../controllers/searchController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search operations
 */

/**
 * @swagger
 * /api/search/products:
 *   get:
 *     summary: Search for products
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Products found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid query
 *       500:
 *         description: Internal server error
 */
router.get('/products', asyncHandler(searchController.searchProducts));

/**
 * @swagger
 * /api/search/categories:
 *   get:
 *     summary: Search for categories
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Categories found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid query
 *       500:
 *         description: Internal server error
 */
router.get('/categories', asyncHandler(searchController.searchCategories));

export default router;
