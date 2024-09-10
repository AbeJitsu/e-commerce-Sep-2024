// server/src/controllers/productController.ts

import { Request, Response } from 'express';
import Product, { IProduct } from '../models/productModel';
import { extractKeywordsFromDescription } from '../utils/keywordExtraction';
import { handleCSVUpload } from '../utils/csvUpload';
import {
  performDbOperation,
  handleError,
  handleSuccess,
} from '../utils/responseUtils';

// Get all products with pagination
export const getProducts = (req: Request, res: Response): void => {
  const { page = 1, limit = 12 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  performDbOperation(
    res,
    async () => await Product.find({}).skip(offset).limit(Number(limit)),
    'Products fetched successfully'
  );
};

// Add a new product
export const addProduct = (req: Request, res: Response): void => {
  const keywords = extractKeywordsFromDescription(req.body.description);
  const newProduct = new Product({ ...req.body, ...keywords });

  performDbOperation(
    res,
    async () => await newProduct.save(),
    'Product added successfully'
  );
};

// Update an existing product
export const updateProduct = (req: Request, res: Response): void => {
  const keywords = extractKeywordsFromDescription(req.body.description);

  performDbOperation(
    res,
    async () =>
      await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.body, ...keywords },
        { new: true }
      ),
    'Product updated successfully'
  );
};

// Delete a product
export const deleteProduct = (req: Request, res: Response): void => {
  performDbOperation(
    res,
    async () => await Product.findByIdAndDelete(req.params.id),
    'Product deleted successfully'
  );
};

// Fetch a single product by its ID
export const getProductById = (req: Request, res: Response): void => {
  performDbOperation(
    res,
    async () => await Product.findById(req.params.id),
    'Product fetched successfully'
  );
};

// Upload CSV and process it
export const uploadCSV = async (req: Request, res: Response): Promise<void> => {
  if (!req.files || !req.files.regular || !req.files.premiere) {
    res.status(400).send({ message: 'Both CSV files are required.' });
    return;
  }

  const regularCSV = req.files.regular[0];
  const premiereCSV = req.files.premiere[0];

  try {
    await handleCSVUpload(regularCSV, premiereCSV);
    handleSuccess(res, 'CSV files processed successfully');
  } catch (error) {
    handleError(res, error as Error, 'Error processing CSV files');
  }
};
