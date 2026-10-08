const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');

// @route POST /api/reviews
// @access Customer
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user._id;

    // 1. Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // 2. Must belong to logged-in customer
    if (booking.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. This is not your booking.' });
    }

    // 3. Booking must be completed
    if (booking.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed bookings.' });
    }

    // 4. Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking.' });
    }

    // 5. Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    // 6. Create review
    const review = await Review.create({
      bookingId,
      customerId,
      providerId: booking.providerId,
      rating,
      comment,
    });

    // 7. Update provider average rating
    const allReviews = await Review.find({ providerId: booking.providerId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await ServiceProvider.findByIdAndUpdate(booking.providerId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      totalReviews: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('customerId', 'name profileImage')
      .populate('providerId', 'businessName');

    res.status(201).json({ success: true, message: 'Review submitted successfully', review: populatedReview });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reviews/provider/:providerId
// @access Public
const getProviderReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Review.countDocuments({ providerId: req.params.providerId });
    const reviews = await Review.find({ providerId: req.params.providerId })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), reviews });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reviews/booking/:bookingId
// @access Customer (own), Provider, Admin
const getBookingReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ bookingId: req.params.bookingId })
      .populate('customerId', 'name profileImage')
      .populate('providerId', 'businessName');

    // Not necessarily an error if no review yet
    res.status(200).json({ success: true, review: review || null });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/reviews (Admin)
// @access Admin
const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate('customerId', 'name email')
      .populate('providerId', 'businessName')
      .populate('bookingId', 'bookingDate startTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getProviderReviews, getBookingReview, getAllReviews };
