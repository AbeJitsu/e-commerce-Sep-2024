// server/src/services/searchService.ts

import Product, { IProduct } from '../models/productModel';
import { logger } from '../middleware/logger';
import { FilterQuery } from 'mongoose';

// Placeholder for a function to search products by name
export const searchProductsByName = async (
  query: string
): Promise<IProduct[]> => {
  try {
    logger.debug(`Searching products with query: ${query}`);
    const products = await Product.find({ name: new RegExp(query, 'i') });
    return products;
  } catch (error) {
    logger.error('Error searching products by name:', error);
    throw new Error('Error searching products by name');
  }
};

// Placeholder for a function to search products by category
export const searchProductsByCategory = async (
  category: string
): Promise<IProduct[]> => {
  try {
    logger.debug(`Searching products in category: ${category}`);
    const products = await Product.find({ category });
    return products;
  } catch (error) {
    logger.error('Error searching products by category:', error);
    throw new Error('Error searching products by category');
  }
};

// Placeholder for a function to search products by keywords
export const searchProductsByKeywords = async (
  keywords: string[]
): Promise<IProduct[]> => {
  try {
    logger.debug(`Searching products with keywords: ${keywords}`);
    const filter: FilterQuery<IProduct> = { keywords: { $in: keywords } };
    const products = await Product.find(filter);
    return products;
  } catch (error) {
    logger.error('Error searching products by keywords:', error);
    throw new Error('Error searching products by keywords');
  }
};
