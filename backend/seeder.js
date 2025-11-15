import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import products from './data/products.js';
import { connectDB } from './config/db.js';

dotenv.config();
await connectDB();

await Product.deleteMany();
await Product.insertMany(products);
console.log('Products seeded');
await mongoose.connection.close();
process.exit(0);
