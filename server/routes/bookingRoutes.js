const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
} = require('../controllers/bookingController');
const { protect, adminOnly, customerOnly } = require('../middleware/auth');

router.use(protect);

router.post('/', customerOnly, createBooking);
router.get('/my', getMyBookings);          // customer or provider
router.get('/stats', adminOnly, getBookingStats);
router.get('/', adminOnly, getAllBookings); // admin
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', adminOnly, deleteBooking);

module.exports = router;
