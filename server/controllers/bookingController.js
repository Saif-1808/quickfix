const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const { generateTimeSlots, isWorkingDay } = require('../utils/timeSlots');

// Helper to compute endTime given startTime and duration
const computeEndTime = (startTime, durationMinutes) => {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

// @route POST /api/bookings
// @access Customer
const createBooking = async (req, res, next) => {
  try {
    const { providerId, serviceId, bookingDate, startTime, durationHours = 1, problemDescription, address, additionalNotes } = req.body;
    const customerId = req.user._id;

    // 1. Validate provider
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });
    if (!provider.isActive || !provider.isApproved) {
      return res.status(400).json({ success: false, message: 'Provider is not available for booking.' });
    }

    // 2. Validate duration
    const dur = parseInt(durationHours, 10);
    if (isNaN(dur) || dur < 1 || dur > 8) {
      return res.status(400).json({ success: false, message: 'Duration must be between 1 and 8 hours.' });
    }

    // 3. Validate date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(bookingDate)) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(bookingDate + 'T00:00:00');
    if (selectedDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book a date in the past.' });
    }

    // 4. Validate working day
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    if (!isWorkingDay(dayName, provider.workingDays)) {
      return res.status(400).json({ success: false, message: `Provider does not work on ${dayName}.` });
    }

    // 5. Validate start time is a valid slot
    const allSlots = generateTimeSlots(provider.workingStartTime, provider.workingEndTime, provider.slotDuration);
    const validSlot = allSlots.find((s) => s.start === startTime);
    if (!validSlot) {
      return res.status(400).json({ success: false, message: 'Invalid time slot. Please select a valid slot within working hours.' });
    }

    // 6. Compute end time
    const endTime = computeEndTime(startTime, dur * 60);

    // Validate end time is within working hours
    if (endTime > provider.workingEndTime) {
      return res.status(400).json({ success: false, message: `Duration exceeds provider working hours. Provider ends at ${provider.workingEndTime}.` });
    }

    // 7. CRITICAL: Range-based overlap check for multi-hour bookings
    // A new booking from startTime to endTime overlaps if any active booking's range intersects
    const existingBookings = await Booking.find({
      providerId,
      bookingDate,
      status: { $in: ['Pending', 'Accepted', 'In Progress'] },
    }).select('startTime endTime');

    const newStart = startTime;
    const newEnd = endTime;

    for (const eb of existingBookings) {
      // Overlap if: eb.start < newEnd AND eb.end > newStart
      if (eb.startTime < newEnd && eb.endTime > newStart) {
        return res.status(409).json({ success: false, message: 'This time range overlaps with an existing booking. Please choose a different time or shorter duration.' });
      }
    }

    // 8. Calculate total price
    const totalPrice = provider.price * dur;

    // 9. Create booking
    let booking;
    try {
      booking = await Booking.create({
        customerId,
        providerId,
        serviceId,
        bookingDate,
        startTime,
        endTime,
        durationHours: dur,
        totalPrice,
        problemDescription,
        address,
        additionalNotes,
        status: 'Pending',
        statusHistory: [{ status: 'Pending', changedBy: customerId }],
      });
    } catch (dbError) {
      if (dbError.code === 11000) {
        return res.status(409).json({ success: false, message: 'This time slot is no longer available. Please select another time.' });
      }
      throw dbError;
    }

    const populated = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate({ path: 'providerId', populate: { path: 'userId', select: 'name phone' }, select: 'businessName location price userId' })
      .populate('serviceId', 'name icon');

    res.status(201).json({ success: true, message: 'Booking created successfully', booking: populated });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings/my
// @access Customer or Provider
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    } else if (req.user.role === 'provider') {
      const provider = await ServiceProvider.findOne({ userId: req.user._id });
      if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found.' });
      filter.providerId = provider._id;
    }

    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('customerId', 'name email phone address')
      .populate('providerId', 'businessName location price')
      .populate('serviceId', 'name icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), bookings });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings (Admin – all bookings)
// @access Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { status, providerId, customerId, date, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (providerId) filter.providerId = providerId;
    if (customerId) filter.customerId = customerId;
    if (date) filter.bookingDate = date;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('customerId', 'name email phone')
      .populate({ path: 'providerId', populate: { path: 'userId', select: 'name' }, select: 'businessName userId' })
      .populate('serviceId', 'name icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), bookings });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings/:id
// @access Customer (own), Provider (assigned), Admin
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate({ path: 'providerId', populate: { path: 'userId', select: 'name email phone' }, select: 'businessName location price serviceId userId' })
      .populate('serviceId', 'name icon description');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Authorization check
    if (req.user.role === 'customer' && booking.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (req.user.role === 'provider') {
      const provider = await ServiceProvider.findOne({ userId: req.user._id });
      if (!provider || booking.providerId._id.toString() !== provider._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/bookings/:id/status
// @access Customer (cancel), Provider (accept/reject/start/complete), Admin
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Define valid transitions per role
    const allowedTransitions = {
      customer: { Pending: ['Cancelled'] },
      provider: {
        Pending: ['Accepted', 'Rejected'],
        Accepted: ['In Progress'],
        'In Progress': ['Completed'],
      },
      admin: {
        Pending: ['Accepted', 'Rejected', 'Cancelled'],
        Accepted: ['In Progress', 'Cancelled'],
        'In Progress': ['Completed'],
        Completed: [],
        Rejected: [],
        Cancelled: [],
      },
    };

    const currentStatus = booking.status;
    const userRole = req.user.role;

    // Check authorization for provider
    if (userRole === 'provider') {
      const provider = await ServiceProvider.findOne({ userId: req.user._id });
      if (!provider || booking.providerId.toString() !== provider._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    // Check authorization for customer
    if (userRole === 'customer' && booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const allowed = allowedTransitions[userRole]?.[currentStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition booking from '${currentStatus}' to '${status}' as ${userRole}.`,
      });
    }

    booking.status = status;
    booking.statusHistory.push({ status, changedBy: req.user._id });
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate('providerId', 'businessName location')
      .populate('serviceId', 'name icon');

    res.status(200).json({ success: true, message: `Booking ${status.toLowerCase()} successfully`, booking: updated });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/bookings/:id
// @access Admin
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.status(200).json({ success: true, message: 'Booking deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/bookings/stats
// @access Admin
const getBookingStats = async (req, res, next) => {
  try {
    const stats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result = {
      total: 0,
      Pending: 0,
      Accepted: 0,
      'In Progress': 0,
      Completed: 0,
      Rejected: 0,
      Cancelled: 0,
    };

    stats.forEach((s) => {
      result[s._id] = s.count;
      result.total += s.count;
    });

    res.status(200).json({ success: true, stats: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, getBookingById, updateBookingStatus, deleteBooking, getBookingStats };
