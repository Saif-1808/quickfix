const express = require('express');
const router = express.Router();
const { createReview, getProviderReviews, getBookingReview, getAllReviews } = require('../controllers/reviewController');
const { protect, adminOnly, customerOnly } = require('../middleware/auth');

router.post('/', protect, customerOnly, createReview);
router.get('/', protect, adminOnly, getAllReviews);
router.get('/provider/:providerId', getProviderReviews);  // Public
router.get('/booking/:bookingId', protect, getBookingReview);

module.exports = router;
