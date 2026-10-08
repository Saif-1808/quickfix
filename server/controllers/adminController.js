const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Service = require('../models/Service');

// @route GET /api/admin/stats
// @access Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalProviders,
      totalServices,
      bookingStats,
      avgRatingResult,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer', isActive: true }),
      ServiceProvider.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ServiceProvider.aggregate([
        { $match: { totalReviews: { $gt: 0 } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
    ]);

    const bookingCounts = {
      total: 0,
      Pending: 0,
      Accepted: 0,
      'In Progress': 0,
      Completed: 0,
      Rejected: 0,
      Cancelled: 0,
    };
    bookingStats.forEach((s) => {
      bookingCounts[s._id] = s.count;
      bookingCounts.total += s.count;
    });

    const avgRating = avgRatingResult[0]?.avgRating || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalProviders,
        totalServices,
        ...bookingCounts,
        avgProviderRating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
