const express = require('express');
const router = express.Router();
const {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  updateProviderStatus,
  getProviderAvailability,
  getProviderSchedule,
  getMyProviderProfile,
} = require('../controllers/providerController');
const { protect, adminOnly, providerOnly } = require('../middleware/auth');

// Provider self-profile
router.get('/me', protect, providerOnly, getMyProviderProfile);

// Public: list providers (optional auth for admin to see all)
router.get('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return protect(req, res, () => getAllProviders(req, res, next));
  }
  getAllProviders(req, res, next);
});

// Availability – public
router.get('/:providerId/availability', getProviderAvailability);

// Schedule – admin
router.get('/:providerId/schedule', protect, adminOnly, getProviderSchedule);

// Get single provider – public
router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return protect(req, res, () => getProviderById(req, res, next));
  }
  getProviderById(req, res, next);
});

// Admin only
router.post('/', protect, adminOnly, createProvider);
router.delete('/:id', protect, adminOnly, deleteProvider);
router.patch('/:id/status', protect, adminOnly, updateProviderStatus);

// Admin or Provider (own profile)
router.put('/:id', protect, updateProvider);

module.exports = router;
