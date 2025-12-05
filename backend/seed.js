require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

const seedData = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@goldenaura.test',
      password: await bcrypt.hash('Admin@123', 10),
      isAdmin: true
    });

    console.log('Adding sample products...');
    const products = [
      {
        title: 'Golden Aura — Amber Oud',
        slug: 'amber-oud',
        description: 'Luxurious woody-amber fragrance with oud accents.',
        category: 'Unisex',
        price: 9999,
        images: ['/images/amber-oud.jpg'],
        features: ['Long lasting', 'Warm & woody']
      },
      {
        title: 'Golden Aura — Rose Elixir',
        slug: 'rose-elixir',
        description: 'Soft rose with musky base for evenings.',
        category: 'Women',
        price: 7999,
        images: ['/images/rose-elixir.jpg'],
        features: ['Romantic', 'Elegant']
      },
      {
        title: 'Golden Aura — Citrus Breeze',
        slug: 'citrus-breeze',
        description: 'Fresh citrus blend for daytime daily wear.',
        category: 'Men',
        price: 5999,
        images: ['/images/citrus-breeze.jpg'],
        features: ['Fresh', 'Uplifting']
      }
    ];

    await Product.insertMany(products);

    console.log('✅ Seed complete!');
    console.log('Admin Login → Email: admin@goldenaura.test | Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
