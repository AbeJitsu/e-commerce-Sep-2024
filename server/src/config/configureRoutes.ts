import { Application } from 'express';
import authRoutes from '../routes/authRoutes';
import cartRoutes from '../routes/cartRoutes';
import productRoutes from '../routes/productRoutes';
import paymentRoutes from '../routes/paymentRoutes';
import searchRoutes from '../routes/searchRoutes';
import testPageRoutes from '../routes/testPageRoutes';
import userRoutes from '../routes/userRoutes';

const configureRoutes = (app: Application): void => {
  // Setup routes prefixed with /api
  app.use('/api/auth', authRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/test-page', testPageRoutes);
  app.use('/api/user', userRoutes);
};

export default configureRoutes;
