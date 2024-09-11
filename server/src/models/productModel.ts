// server/src/models/productModel.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import moment from 'moment-timezone';

export interface IProduct extends Document {
  handle: string;
  title: string;
  bodyHtml?: string;
  vendor?: string;
  type: 'zi' | 'fashion-fix' | 'everyday';
  variantSKU?: string;
  variantPrice?: number;
  imageSrc: string[];
  imagePosition: number[];
  quantity: number;
  status: 'available' | 'in cart' | 'purchased';
  colors: string[];
  materials: string[];
  looks: string[];
  styles: string[];
  reservationDeadline: Date | null;
  reserve(): Promise<IProduct>;
  releaseReservation(): Promise<IProduct>;
}

interface IProductModel extends Model<IProduct> {
  // You can add any static methods here if needed
}

const productSchema = new Schema<IProduct>({
  handle: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  bodyHtml: String,
  vendor: String,
  type: {
    type: String,
    enum: ['zi', 'fashion-fix', 'everyday'],
    default: 'everyday',
  },
  variantSKU: String,
  variantPrice: Number,
  imageSrc: [String],
  imagePosition: [Number],
  quantity: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['available', 'in cart', 'purchased'],
    default: 'available',
  },
  colors: [{ type: String }],
  materials: [{ type: String }],
  looks: [{ type: String }],
  styles: [{ type: String }],
  reservationDeadline: {
    type: Date,
    default: () =>
      moment()
        .tz('America/New_York')
        .add(4, 'days')
        .hour(12)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate(),
  },
});

productSchema.pre<IProduct>('save', function (next) {
  if (this.variantPrice === 25) {
    this.type = 'zi';
  } else if (
    this.variantPrice === 20 ||
    (this.bodyHtml && this.bodyHtml.toLowerCase().includes('fashion-fix'))
  ) {
    this.type = 'fashion-fix';
  } else {
    this.type = 'everyday';
  }
  next();
});

productSchema.methods.reserve = function (this: IProduct): Promise<IProduct> {
  if (this.quantity > 0 && this.status === 'available') {
    this.status = 'in cart';
    this.reservationDeadline = moment()
      .tz('America/New_York')
      .add(4, 'days')
      .hour(12)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate();
    return this.save();
  }
  return Promise.resolve(this);
};

productSchema.methods.releaseReservation = function (
  this: IProduct
): Promise<IProduct> {
  if (this.status === 'in cart') {
    this.status = 'available';
    this.reservationDeadline = null;
    return this.save();
  }
  return Promise.resolve(this);
};

const Product = mongoose.model<IProduct, IProductModel>(
  'Product',
  productSchema
);

export default Product;
