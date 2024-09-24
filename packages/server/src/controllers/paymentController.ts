// server/src/controllers/paymentController.ts

import { Request, Response } from 'express';
import { processPayment } from '../services/paymentService';
import { handleError, handleSuccess } from '../utils/responseUtils';

// Handle Payment
export const handlePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, amount, currency } = req.body;

  if (!token || !amount || !currency) {
    res.status(400).json({ message: 'Missing required payment details' });
    return;
  }

  try {
    const result = await processPayment(token, amount, currency);
    handleSuccess(res, 'Payment successful', { data: result });
  } catch (error) {
    console.error('Payment processing error:', error);
    handleError(res, error as Error, 'Payment failed');
  }
};
