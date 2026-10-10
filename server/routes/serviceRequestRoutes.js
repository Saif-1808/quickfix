const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  reviewServiceRequest,
  resubmitServiceRequest,
} = require('../controllers/serviceRequestController');
const { protect, adminOnly, providerOnly } = require('../middleware/auth');

// Provider routes
router.post('/', protect, providerOnly, createServiceRequest);
router.get('/my', protect, providerOnly, getMyServiceRequests);
router.patch('/:id/resubmit', protect, providerOnly, resubmitServiceRequest);

// Admin routes
router.get('/', protect, adminOnly, getAllServiceRequests);
router.patch('/:id/review', protect, adminOnly, reviewServiceRequest);

module.exports = router;
