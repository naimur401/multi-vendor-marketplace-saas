import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import Product from '../models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Sample data
const sampleUsers = [
  {
    email: 'admin@brightflow.com',
    password: 'Admin@123456',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  {
    email: 'vendor1@brightflow.com',
    password: 'Vendor@123456',
    firstName: 'John',
    lastName: 'Seller',
    role: 'vendor',
  },
  {
    email: 'vendor2@brightflow.com',
    password: 'Vendor@123456',
    firstName: 'Jane',
    lastName: 'Merchant',
    role: 'vendor',
  },
  {
    email: 'customer@brightflow.com',
    password: 'Customer@123456',
    firstName: 'Alice',
    lastName: 'Buyer',
    role: 'customer',
  },
];

const sampleTenants = [
  {
    name: 'Tech Store',
    description: 'Premium electronics and gadgets',
    logo: 'https://via.placeholder.com/200',
    status: 'approved',
  },
  {
    name: 'Fashion Hub',
    description: 'Latest fashion trends and clothing',
    logo: 'https://via.placeholder.com/200',
    status: 'approved',
  },
];

const sampleProducts = [
  {
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 79.99,
    category: 'Electronics',
    inventory: 50,
    images: [{ url: 'https://via.placeholder.com/300' }],
  },
  {
    name: 'USB-C Cable',
    description: 'Fast charging USB-C cable (2 pack)',
    price: 12.99,
    category: 'Accessories',
    inventory: 200,
    images: [{ url: 'https://via.placeholder.com/300' }],
  },
  {
    name: 'Phone Stand',
    description: 'Adjustable phone stand for desk',
    price: 15.99,
    category: 'Accessories',
    inventory: 100,
    images: [{ url: 'https://via.placeholder.com/300' }],
  },
  {
    name: 'Winter Jacket',
    description: 'Warm and stylish winter jacket',
    price: 129.99,
    category: 'Clothing',
    inventory: 30,
    images: [{ url: 'https://via.placeholder.com/300' }],
  },
  {
    name: 'Running Shoes',
    description: 'Comfortable running shoes with gel cushioning',
    price: 89.99,
    category: 'Footwear',
    inventory: 40,
    images: [{ url: 'https://via.placeholder.com/300' }],
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Product.deleteMany({});

    // Create users
    console.log('Creating users...');
    const createdUsers = await Promise.all(
      sampleUsers.map(async (userData) => {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return User.create({
          ...userData,
          password: hashedPassword,
        });
      })
    );
    console.log(`Created ${createdUsers.length} users`);

    // Create tenants
    console.log('Creating vendors (tenants)...');
    const createdTenants = await Promise.all(
      sampleTenants.map((tenantData, index) => {
        const vendorUser = createdUsers.find((u) => u.role === 'vendor' && u.email.includes(`vendor${index + 1}`));
        return Tenant.create({
          ...tenantData,
          ownerId: vendorUser._id, slug: tenantData.name.toLowerCase().replace(/\s+/g, '-'),
        });
      })
    );
    console.log(`Created ${createdTenants.length} vendors`);

    // Create products
    console.log('Creating products...');
    let productCount = 0;
    for (let i = 0; i < createdTenants.length; i++) {
      const tenant = createdTenants[i];
      const productsToCreate = sampleProducts.slice(0, Math.ceil(sampleProducts.length / 2));
      
      const products = await Product.create(
        productsToCreate.map((product) => ({
          ...product,
          tenantId: tenant._id,
          vendorName: tenant.name,
        }))
      );
      productCount += products.length;
    }
    console.log(`Created ${productCount} products`);

    // Create text indexes for search
    console.log('Creating indexes...');
    await Product.collection.createIndex({ name: 'text', description: 'text', category: 'text' });
    console.log('Indexes created');

    console.log('Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@brightflow.com / Admin@123456');
    console.log('Vendor 1: vendor1@brightflow.com / Vendor@123456');
    console.log('Vendor 2: vendor2@brightflow.com / Vendor@123456');
    console.log('Customer: customer@brightflow.com / Customer@123456');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();



