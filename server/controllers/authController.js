const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// @route POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, address } = req.body;

    // Validate role – customers and providers can self-register; admin must be seeded
    const allowedRoles = ['customer', 'provider'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Only customer or provider registration is allowed.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, phone, password, role: role || 'customer', address });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    // If provider, get provider profile
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ServiceProvider.findOne({ userId: user._id }).populate('serviceId', 'name icon');
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        profileImage: user.profileImage,
        isActive: user.isActive,
      },
      providerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
// @access Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ServiceProvider.findOne({ userId: user._id }).populate('serviceId', 'name icon');
    }

    res.status(200).json({
      success: true,
      user,
      providerProfile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
