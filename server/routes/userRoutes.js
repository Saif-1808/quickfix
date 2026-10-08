const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, toggleUserStatus } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', adminOnly, getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', adminOnly, deleteUser);
router.patch('/:id/status', adminOnly, toggleUserStatus);

module.exports = router;
