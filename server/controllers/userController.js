const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');

// @route GET /api/users
// @access Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), users });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/users/:id
// @access Admin or self
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Only admin or the user themselves can view
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/users/:id
// @access Private (self) or Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, address, profileImage } = req.body;

    // Only admin or the user themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, profileImage },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/users/:id  (Admin: deactivate)
// @access Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Soft delete – just deactivate
    user.isActive = false;
    await user.save();

    res.status(200).json({ success: true, message: 'User deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/users/:id/status
// @access Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, toggleUserStatus };
