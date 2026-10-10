const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { generateTimeSlots, isWorkingDay } = require('../utils/timeSlots');

// @route GET /api/providers
// @access Public
const getAllProviders = async (req, res, next) => {
  try {
    const { serviceId, location, search, isApproved, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};

    // Public users only see active, approved providers
    if (req.user?.role !== 'admin') {
      filter.isActive = true;
      filter.isApproved = true;
    } else {
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    }

    if (serviceId) filter.serviceId = serviceId;
    if (location) filter.location = { $regex: location, $options: 'i' };

    let query = ServiceProvider.find(filter)
      .populate('serviceId', 'name icon description')
      .populate('userId', 'name email phone profileImage')
      .sort({ rating: -1, totalReviews: -1 });

    // Apply search filter on business name or location after population
    const skip = (Number(page) - 1) * Number(limit);
    const total = await ServiceProvider.countDocuments(filter);
    const providers = await query.skip(skip).limit(Number(limit));

    // Client-side search filter if search term given
    let filteredProviders = providers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProviders = providers.filter(
        (p) =>
          p.businessName.toLowerCase().includes(searchLower) ||
          p.location.toLowerCase().includes(searchLower) ||
          p.userId?.name?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ success: true, total, page: Number(page), providers: filteredProviders });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/providers/:id
// @access Public
const getProviderById = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate('serviceId', 'name icon description')
      .populate('userId', 'name email phone profileImage address');

    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });

    // Only active & approved for public
    if (req.user?.role !== 'admin' && (!provider.isActive || !provider.isApproved)) {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    res.status(200).json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/providers
// @access Admin
const createProvider = async (req, res, next) => {
  try {
    const {
      userId,
      serviceId,
      businessName,
      description,
      experience,
      location,
      price,
      workingDays,
      workingStartTime,
      workingEndTime,
      slotDuration,
      isApproved,
    } = req.body;

    // Verify user exists and has provider role
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role !== 'provider') return res.status(400).json({ success: false, message: 'User must have provider role.' });

    // Check if provider profile already exists
    const existingProvider = await ServiceProvider.findOne({ userId });
    if (existingProvider) return res.status(400).json({ success: false, message: 'Provider profile already exists for this user.' });

    const provider = await ServiceProvider.create({
      userId,
      serviceId,
      businessName,
      description,
      experience,
      location,
      price,
      workingDays,
      workingStartTime,
      workingEndTime,
      slotDuration,
      isApproved: isApproved !== undefined ? isApproved : false,
    });

    const populatedProvider = await ServiceProvider.findById(provider._id)
      .populate('serviceId', 'name icon')
      .populate('userId', 'name email phone');

    res.status(201).json({ success: true, message: 'Provider created successfully', provider: populatedProvider });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/providers/:id
// @access Admin or Provider (own profile)
const updateProvider = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });

    // Provider can only update their own profile
    if (req.user.role === 'provider') {
      if (provider.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own profile.' });
      }
      // Provider cannot change approval/active status
      delete req.body.isApproved;
      delete req.body.isActive;
    }

    const updatedProvider = await ServiceProvider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('serviceId', 'name icon')
      .populate('userId', 'name email phone');

    res.status(200).json({ success: true, message: 'Provider updated successfully', provider: updatedProvider });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/providers/:id
// @access Admin
const deleteProvider = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });

    provider.isActive = false;
    await provider.save();

    res.status(200).json({ success: true, message: 'Provider deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/providers/:id/status
// @access Admin
const updateProviderStatus = async (req, res, next) => {
  try {
    const { isApproved, isActive } = req.body;
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });

    if (isApproved !== undefined) provider.isApproved = isApproved;
    if (isActive !== undefined) provider.isActive = isActive;
    await provider.save();

    res.status(200).json({ success: true, message: 'Provider status updated', provider });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/providers/:providerId/availability
// @access Public
const getProviderAvailability = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required. Format: YYYY-MM-DD' });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const provider = await ServiceProvider.findById(providerId);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });

    if (!provider.isActive || !provider.isApproved) {
      return res.status(400).json({ success: false, message: 'Provider is not available.' });
    }

    // Check if the requested date falls on a working day
    const requestedDate = new Date(date + 'T00:00:00');
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    if (!isWorkingDay(dayName, provider.workingDays)) {
      return res.status(200).json({
        success: true,
        providerId,
        date,
        dayName,
        isWorkingDay: false,
        message: `Provider does not work on ${dayName}`,
        slots: [],
      });
    }

    // Generate all possible slots
    const allSlots = generateTimeSlots(provider.workingStartTime, provider.workingEndTime, provider.slotDuration);

    // Find existing active bookings for this provider on this date
    const existingBookings = await Booking.find({
      providerId,
      bookingDate: date,
      status: { $in: ['Pending', 'Accepted', 'In Progress'] },
    }).select('startTime endTime status');

    // Build list of blocked ranges
    const bookedRanges = existingBookings.map((b) => ({ start: b.startTime, end: b.endTime }));

    // A slot at time T is available only if no booked range overlaps [T, T+slotDuration]
    const slots = allSlots.map((slot) => {
      const slotEnd = slot.end;
      const isBlocked = bookedRanges.some((r) => r.start < slotEnd && r.end > slot.start);
      return {
        time: slot.start,
        endTime: slot.end,
        displayTime: slot.displayStart,
        displayEndTime: slot.displayEnd,
        available: !isBlocked,
        reason: isBlocked ? 'Booked' : null,
      };
    });

    res.status(200).json({
      success: true,
      providerId,
      date,
      dayName,
      isWorkingDay: true,
      workingHours: { start: provider.workingStartTime, end: provider.workingEndTime },
      slotDuration: provider.slotDuration,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/providers/:providerId/schedule
// @access Admin
const getProviderSchedule = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ success: false, message: 'Date is required.' });

    const provider = await ServiceProvider.findById(providerId).populate('userId', 'name');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });

    const allSlots = generateTimeSlots(provider.workingStartTime, provider.workingEndTime, provider.slotDuration);

    const bookings = await Booking.find({
      providerId,
      bookingDate: date,
      status: { $in: ['Pending', 'Accepted', 'In Progress', 'Completed'] },
    })
      .populate('customerId', 'name phone')
      .select('startTime endTime status customerId');

    const bookedMap = {};
    bookings.forEach((b) => {
      bookedMap[b.startTime] = b;
    });

    const schedule = allSlots.map((slot) => {
      const booking = bookedMap[slot.start];
      return {
        time: slot.start,
        endTime: slot.end,
        displayTime: slot.displayStart,
        displayEndTime: slot.displayEnd,
        status: booking ? booking.status : 'Available',
        customer: booking ? { name: booking.customerId?.name, phone: booking.customerId?.phone } : null,
        bookingId: booking ? booking._id : null,
      };
    });

    res.status(200).json({
      success: true,
      provider: { _id: provider._id, businessName: provider.businessName, name: provider.userId?.name },
      date,
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/providers/me
// @access Provider
const getMyProviderProfile = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id })
      .populate('serviceId', 'name icon description')
      .populate('userId', 'name email phone profileImage address');

    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found.' });

    res.status(200).json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  updateProviderStatus,
  getProviderAvailability,
  getProviderSchedule,
  getMyProviderProfile,
};
