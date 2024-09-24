import { Request, Response } from 'express';

export const searchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  // TODO: Implement actual product search logic
  res.status(200).json({ message: 'Search products endpoint' });
};

export const searchCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  // TODO: Implement actual category search logic
  res.status(200).json({ message: 'Search categories endpoint' });
};
