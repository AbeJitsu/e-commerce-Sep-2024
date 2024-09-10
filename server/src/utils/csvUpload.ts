// server/src/utils/csvUpload.ts

import fs from 'fs';
import Product from '../models/productModel';

// Use type assertion for csv-parser
const csv = require('csv-parser') as any;

interface CSVItem {
  title: string;
  handle: string;
  bodyHtml: string;
  vendor: string;
  variantSKU: string;
  variantPrice: string;
  imageSrc: string;
  imagePosition: string;
  quantity: string;
  status: string;
  colors?: string;
  materials?: string;
  looks?: string;
  styles?: string;
}

interface CSVFile {
  path: string;
}

export const handleCSVUpload = async (
  regularCSV: CSVFile,
  premiereCSV: CSVFile
): Promise<void> => {
  await processCSV(regularCSV, 'regular');
  await processCSV(premiereCSV, 'premiere');
};

const processCSV = (file: CSVFile, type: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const results: CSVItem[] = [];
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (data: CSVItem) => results.push(data))
      .on('end', async () => {
        try {
          for (const item of results) {
            await saveProduct(item, type);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
  });
};

const saveProduct = async (item: CSVItem, type: string): Promise<void> => {
  const product = new Product({
    title: item.title,
    handle: item.handle,
    bodyHtml: item.bodyHtml,
    vendor: item.vendor,
    type,
    variantSKU: item.variantSKU,
    variantPrice: parseFloat(item.variantPrice),
    imageSrc: item.imageSrc.split('|'),
    imagePosition: item.imagePosition.split('|').map(Number),
    quantity: parseInt(item.quantity),
    status: item.status,
    colors: item.colors ? item.colors.split('|') : [],
    materials: item.materials ? item.materials.split('|') : [],
    looks: item.looks ? item.looks.split('|') : [],
    styles: item.styles ? item.styles.split('|') : [],
  });

  await product.save();
};
