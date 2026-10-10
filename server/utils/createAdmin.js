require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// ── Change these if you want different credentials ──────────────────────────
const ADMIN_NAME     = 'Admin QuickFix';
const ADMIN_EMAIL    = 'admin@quickfix.com';
const ADMIN_PHONE    = '9000000001';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_ADDRESS  = 'QuickFix HQ';
// ────────────────────────────────────────────────────────────────────────────

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected:', process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@'));

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`\n⚠️  Admin already exists with email: ${ADMIN_EMAIL}`);
      console.log('   Delete it first from MongoDB Atlas if you want to recreate it.');
      process.exit(0);
    }

    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password: ADMIN_PASSWORD,
      role: 'admin',
      address: ADMIN_ADDRESS,
      isActive: true,
    });

    console.log('\n✅ Admin created successfully!');
    console.log('   Email   :', admin.email);
    console.log('   Password: Admin@123  (change this after first login)');
    console.log('   Role    :', admin.role);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
};

run();
