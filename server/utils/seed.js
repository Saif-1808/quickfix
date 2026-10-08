require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');
const ServiceProvider = require('../models/ServiceProvider');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Review.deleteMany({});
    await Booking.deleteMany({});
    await ServiceProvider.deleteMany({});
    await Service.deleteMany({});
    await User.deleteMany({});

    console.log('Creating services...');
    const services = await Service.insertMany([
      { name: 'Electrician', description: 'Electrical repairs, wiring, and installations', icon: '⚡', isActive: true },
      { name: 'Plumber', description: 'Plumbing repairs, pipe fixing, and installations', icon: '🔧', isActive: true },
      { name: 'Carpenter', description: 'Furniture, woodwork, and carpentry services', icon: '🪚', isActive: true },
      { name: 'Cleaning', description: 'Home and office cleaning services', icon: '🧹', isActive: true },
      { name: 'AC Repair', description: 'Air conditioner servicing and repair', icon: '❄️', isActive: true },
      { name: 'Appliance Repair', description: 'Washing machine, refrigerator, and appliance repair', icon: '🔌', isActive: true },
      { name: 'Computer/Laptop Repair', description: 'Computer and laptop repair and servicing', icon: '💻', isActive: true },
      { name: 'Painter', description: 'Interior and exterior painting services', icon: '🎨', isActive: true },
      { name: 'Locksmith', description: 'Lock installation, repair, and key duplication', icon: '🔐', isActive: true },
    ]);

    console.log(`Created ${services.length} services`);

    // Create users
    console.log('Creating users...');

    // Admin
    const adminUser = await User.create({
      name: 'Admin QuickFix',
      email: 'admin@quickfix.com',
      phone: '9000000001',
      password: 'Admin@123',
      role: 'admin',
      address: 'QuickFix HQ, Mumbai',
      isActive: true,
    });

    // Customers
    const customers = await Promise.all([
      User.create({ name: 'Amit Sharma', email: 'amit@demo.com', phone: '9876543210', password: 'Customer@123', role: 'customer', address: '12 MG Road, Kolhapur', isActive: true }),
      User.create({ name: 'Sneha Patil', email: 'sneha@demo.com', phone: '9876543211', password: 'Customer@123', role: 'customer', address: '45 Station Road, Pune', isActive: true }),
      User.create({ name: 'Ravi Kumar', email: 'ravi@demo.com', phone: '9876543212', password: 'Customer@123', role: 'customer', address: '78 Gandhi Nagar, Mumbai', isActive: true }),
      User.create({ name: 'Priya Desai', email: 'priya@demo.com', phone: '9876543213', password: 'Customer@123', role: 'customer', address: '23 Lake View, Nashik', isActive: true }),
    ]);

    // Provider users
    const providerUsers = await Promise.all([
      User.create({ name: 'Rahul Verma', email: 'rahul@demo.com', phone: '9876500001', password: 'Provider@123', role: 'provider', address: 'Kolhapur, Maharashtra', isActive: true }),
      User.create({ name: 'Suresh Joshi', email: 'suresh@demo.com', phone: '9876500002', password: 'Provider@123', role: 'provider', address: 'Pune, Maharashtra', isActive: true }),
      User.create({ name: 'Manoj Kumar', email: 'manoj@demo.com', phone: '9876500003', password: 'Provider@123', role: 'provider', address: 'Mumbai, Maharashtra', isActive: true }),
      User.create({ name: 'Deepak Singh', email: 'deepak@demo.com', phone: '9876500004', password: 'Provider@123', role: 'provider', address: 'Kolhapur, Maharashtra', isActive: true }),
      User.create({ name: 'Vijay Raut', email: 'vijay@demo.com', phone: '9876500005', password: 'Provider@123', role: 'provider', address: 'Nashik, Maharashtra', isActive: true }),
      User.create({ name: 'Anita Kadam', email: 'anita@demo.com', phone: '9876500006', password: 'Provider@123', role: 'provider', address: 'Pune, Maharashtra', isActive: true }),
    ]);

    console.log('Creating provider profiles...');
    const serviceMap = {};
    services.forEach(s => { serviceMap[s.name] = s._id; });

    const providers = await Promise.all([
      ServiceProvider.create({
        userId: providerUsers[0]._id,
        serviceId: serviceMap['Electrician'],
        businessName: 'Rahul Electrical Services',
        description: 'Professional electrical repair and installation services with 8+ years of experience. Specializing in wiring, short circuit repairs, and new installations.',
        experience: 8,
        location: 'Kolhapur, Maharashtra',
        price: 500,
        rating: 4.6,
        totalReviews: 3,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingStartTime: '09:00',
        workingEndTime: '18:00',
        slotDuration: 60,
        isApproved: true,
        isActive: true,
      }),
      ServiceProvider.create({
        userId: providerUsers[1]._id,
        serviceId: serviceMap['Plumber'],
        businessName: 'Suresh Plumbing Solutions',
        description: 'Expert plumbing services for homes and commercial spaces. Pipe repairs, leakage fixes, and bathroom fittings.',
        experience: 12,
        location: 'Pune, Maharashtra',
        price: 400,
        rating: 4.3,
        totalReviews: 2,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingStartTime: '09:00',
        workingEndTime: '18:00',
        slotDuration: 60,
        isApproved: true,
        isActive: true,
      }),
      ServiceProvider.create({
        userId: providerUsers[2]._id,
        serviceId: serviceMap['AC Repair'],
        businessName: 'Manoj AC Services',
        description: 'AC installation, servicing, gas filling, and repairs. All brands supported.',
        experience: 6,
        location: 'Mumbai, Maharashtra',
        price: 700,
        rating: 4.8,
        totalReviews: 2,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingStartTime: '09:00',
        workingEndTime: '18:00',
        slotDuration: 60,
        isApproved: true,
        isActive: true,
      }),
      ServiceProvider.create({
        userId: providerUsers[3]._id,
        serviceId: serviceMap['Cleaning'],
        businessName: 'Deep Clean Services',
        description: 'Professional home, office, and deep cleaning services. Eco-friendly products used.',
        experience: 5,
        location: 'Kolhapur, Maharashtra',
        price: 800,
        rating: 0,
        totalReviews: 0,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingStartTime: '09:00',
        workingEndTime: '18:00',
        slotDuration: 60,
        isApproved: true,
        isActive: true,
      }),
      ServiceProvider.create({
        userId: providerUsers[4]._id,
        serviceId: serviceMap['Carpenter'],
        businessName: 'Vijay Carpenter Works',
        description: 'Custom furniture, woodwork, door/window repairs, and modular kitchen installations.',
        experience: 10,
        location: 'Nashik, Maharashtra',
        price: 600,
        rating: 4.5,
        totalReviews: 1,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingStartTime: '09:00',
        workingEndTime: '18:00',
        slotDuration: 60,
        isApproved: true,
        isActive: true,
      }),
      ServiceProvider.create({
        userId: providerUsers[5]._id,
        serviceId: serviceMap['Computer/Laptop Repair'],
        businessName: 'Anita Tech Solutions',
        description: 'Laptop, desktop, printer, and networking repairs. Windows/Mac support.',
        experience: 7,
        location: 'Pune, Maharashtra',
        price: 350,
        rating: 0,
        totalReviews: 0,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingStartTime: '09:00',
        workingEndTime: '18:00',
        slotDuration: 60,
        isApproved: true,
        isActive: true,
      }),
    ]);

    console.log(`Created ${providers.length} providers`);

    // Create sample bookings
    console.log('Creating sample bookings...');

    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 5);
    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 7);

    const formatDate = (d) => d.toISOString().split('T')[0];

    // Completed booking for review demo
    const completedBooking = await Booking.create({
      customerId: customers[0]._id,
      providerId: providers[0]._id,
      serviceId: serviceMap['Electrician'],
      bookingDate: '2026-09-15',
      startTime: '10:00',
      endTime: '11:00',
      problemDescription: 'Short circuit in kitchen wiring needs urgent repair',
      address: '12 MG Road, Kolhapur',
      status: 'Completed',
      statusHistory: [
        { status: 'Pending', changedAt: new Date('2026-09-14') },
        { status: 'Accepted', changedAt: new Date('2026-09-14') },
        { status: 'In Progress', changedAt: new Date('2026-09-15') },
        { status: 'Completed', changedAt: new Date('2026-09-15') },
      ],
    });

    const completedBooking2 = await Booking.create({
      customerId: customers[1]._id,
      providerId: providers[0]._id,
      serviceId: serviceMap['Electrician'],
      bookingDate: '2026-09-20',
      startTime: '14:00',
      endTime: '15:00',
      problemDescription: 'Fan installation needed',
      address: '45 Station Road, Pune',
      status: 'Completed',
      statusHistory: [
        { status: 'Pending' },
        { status: 'Accepted' },
        { status: 'In Progress' },
        { status: 'Completed' },
      ],
    });

    const completedBooking3 = await Booking.create({
      customerId: customers[2]._id,
      providerId: providers[0]._id,
      serviceId: serviceMap['Electrician'],
      bookingDate: '2026-09-25',
      startTime: '11:00',
      endTime: '12:00',
      problemDescription: 'Socket replacement needed',
      address: '78 Gandhi Nagar, Mumbai',
      status: 'Completed',
      statusHistory: [{ status: 'Pending' }, { status: 'Accepted' }, { status: 'Completed' }],
    });

    // Pending booking (future)
    await Booking.create({
      customerId: customers[3]._id,
      providerId: providers[1]._id,
      serviceId: serviceMap['Plumber'],
      bookingDate: formatDate(futureDate1),
      startTime: '10:00',
      endTime: '11:00',
      problemDescription: 'Water pipe leakage in bathroom',
      address: '23 Lake View, Nashik',
      status: 'Pending',
      statusHistory: [{ status: 'Pending' }],
    });

    // Accepted booking
    await Booking.create({
      customerId: customers[0]._id,
      providerId: providers[2]._id,
      serviceId: serviceMap['AC Repair'],
      bookingDate: formatDate(futureDate2),
      startTime: '11:00',
      endTime: '12:00',
      problemDescription: 'AC not cooling properly, need gas refill',
      address: '12 MG Road, Kolhapur',
      status: 'Accepted',
      statusHistory: [{ status: 'Pending' }, { status: 'Accepted' }],
    });

    // In Progress booking
    await Booking.create({
      customerId: customers[1]._id,
      providerId: providers[1]._id,
      serviceId: serviceMap['Plumber'],
      bookingDate: formatDate(futureDate1),
      startTime: '14:00',
      endTime: '15:00',
      problemDescription: 'Bathroom tap replacement',
      address: '45 Station Road, Pune',
      status: 'In Progress',
      statusHistory: [{ status: 'Pending' }, { status: 'Accepted' }, { status: 'In Progress' }],
    });

    console.log('Creating sample reviews...');

    // Reviews for completed bookings
    await Review.create({
      bookingId: completedBooking._id,
      customerId: customers[0]._id,
      providerId: providers[0]._id,
      rating: 5,
      comment: 'Excellent service! Rahul was very professional and fixed the short circuit quickly. Highly recommended!',
    });

    await Review.create({
      bookingId: completedBooking2._id,
      customerId: customers[1]._id,
      providerId: providers[0]._id,
      rating: 4,
      comment: 'Good work, fan installed properly. Came on time and was polite. Will hire again.',
    });

    await Review.create({
      bookingId: completedBooking3._id,
      customerId: customers[2]._id,
      providerId: providers[0]._id,
      rating: 5,
      comment: 'Very quick and efficient. Socket replaced in less than 30 minutes. Worth every penny!',
    });

    // Reviews for provider 2 (Plumber)
    const plumberBooking1 = await Booking.create({
      customerId: customers[0]._id,
      providerId: providers[1]._id,
      serviceId: serviceMap['Plumber'],
      bookingDate: '2026-09-10',
      startTime: '09:00',
      endTime: '10:00',
      problemDescription: 'Kitchen sink blocked',
      address: '12 MG Road, Kolhapur',
      status: 'Completed',
      statusHistory: [{ status: 'Completed' }],
    });

    const plumberBooking2 = await Booking.create({
      customerId: customers[2]._id,
      providerId: providers[1]._id,
      serviceId: serviceMap['Plumber'],
      bookingDate: '2026-09-12',
      startTime: '13:00',
      endTime: '14:00',
      problemDescription: 'Shower repair needed',
      address: '78 Gandhi Nagar, Mumbai',
      status: 'Completed',
      statusHistory: [{ status: 'Completed' }],
    });

    await Review.create({
      bookingId: plumberBooking1._id,
      customerId: customers[0]._id,
      providerId: providers[1]._id,
      rating: 4,
      comment: 'Good plumbing work. Fixed the sink blockage quickly.',
    });

    await Review.create({
      bookingId: plumberBooking2._id,
      customerId: customers[2]._id,
      providerId: providers[1]._id,
      rating: 5,
      comment: 'Excellent! Shower working perfectly now. Very professional.',
    });

    // AC Provider reviews
    const acBooking1 = await Booking.create({
      customerId: customers[3]._id,
      providerId: providers[2]._id,
      serviceId: serviceMap['AC Repair'],
      bookingDate: '2026-09-18',
      startTime: '10:00',
      endTime: '11:00',
      problemDescription: 'AC servicing needed',
      address: '23 Lake View, Nashik',
      status: 'Completed',
      statusHistory: [{ status: 'Completed' }],
    });

    const acBooking2 = await Booking.create({
      customerId: customers[1]._id,
      providerId: providers[2]._id,
      serviceId: serviceMap['AC Repair'],
      bookingDate: '2026-09-22',
      startTime: '15:00',
      endTime: '16:00',
      problemDescription: 'AC making noise',
      address: '45 Station Road, Pune',
      status: 'Completed',
      statusHistory: [{ status: 'Completed' }],
    });

    await Review.create({
      bookingId: acBooking1._id,
      customerId: customers[3]._id,
      providerId: providers[2]._id,
      rating: 5,
      comment: 'Perfect AC servicing! Very thorough and professional. AC runs much better now.',
    });

    await Review.create({
      bookingId: acBooking2._id,
      customerId: customers[1]._id,
      providerId: providers[2]._id,
      rating: 5,
      comment: 'Manoj identified the noise issue immediately and fixed it. Great work!',
    });

    // Carpenter review
    const carpenterBooking = await Booking.create({
      customerId: customers[0]._id,
      providerId: providers[4]._id,
      serviceId: serviceMap['Carpenter'],
      bookingDate: '2026-09-28',
      startTime: '09:00',
      endTime: '10:00',
      problemDescription: 'Door hinge repair',
      address: '12 MG Road, Kolhapur',
      status: 'Completed',
      statusHistory: [{ status: 'Completed' }],
    });

    await Review.create({
      bookingId: carpenterBooking._id,
      customerId: customers[0]._id,
      providerId: providers[4]._id,
      rating: 5,
      comment: 'Amazing carpenter! Fixed the door perfectly. Great craftsmanship.',
    });

    // Recalculate ratings for all providers
    for (const provider of providers) {
      const reviews = await Review.find({ providerId: provider._id });
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;
        await ServiceProvider.findByIdAndUpdate(provider._id, { rating: avgRating, totalReviews: reviews.length });
      }
    }

    console.log('\n✅ Seed data created successfully!\n');
    console.log('='.repeat(60));
    console.log('DEMO CREDENTIALS');
    console.log('='.repeat(60));
    console.log('\n👑 ADMIN:');
    console.log('   Email: admin@quickfix.com');
    console.log('   Password: Admin@123');
    console.log('\n👤 CUSTOMERS:');
    console.log('   amit@demo.com / Customer@123');
    console.log('   sneha@demo.com / Customer@123');
    console.log('   ravi@demo.com / Customer@123');
    console.log('   priya@demo.com / Customer@123');
    console.log('\n🔧 PROVIDERS:');
    console.log('   rahul@demo.com / Provider@123  (Rahul Electrical Services)');
    console.log('   suresh@demo.com / Provider@123 (Suresh Plumbing Solutions)');
    console.log('   manoj@demo.com / Provider@123  (Manoj AC Services)');
    console.log('   deepak@demo.com / Provider@123 (Deep Clean Services)');
    console.log('   vijay@demo.com / Provider@123  (Vijay Carpenter Works)');
    console.log('   anita@demo.com / Provider@123  (Anita Tech Solutions)');
    console.log('='.repeat(60));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
