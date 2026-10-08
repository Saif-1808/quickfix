const express = require('express');
const router = express.Router();
const { getAllServices, getServiceById, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middleware/auth');

// Public: get all active services, get service by id
router.get('/', (req, res, next) => {
  // Attach user if token present but don't require it
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return protect(req, res, () => getAllServices(req, res, next));
  }
  getAllServices(req, res, next);
});
router.get('/:id', getServiceById);

// Admin only
router.post('/', protect, adminOnly, createService);
router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;
