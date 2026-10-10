const ServiceRequest = require('../models/ServiceRequest');
const ServiceProvider = require('../models/ServiceProvider');

// @route POST /api/service-requests
// @access Provider
const createServiceRequest = async (req, res, next) => {
  try {
    const { serviceId, serviceName, description, hourlyRate } = req.body;

    // Get provider profile for this user
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found. Please set up your provider profile first.' });
    }

    const request = await ServiceRequest.create({
      providerId: provider._id,
      userId: req.user._id,
      serviceId,
      serviceName: serviceName || '',
      description: description || '',
      hourlyRate,
      status: 'Pending',
    });

    const populated = await ServiceRequest.findById(request._id)
      .populate('serviceId', 'name icon')
      .populate('userId', 'name email');

    res.status(201).json({ success: true, message: 'Service request submitted successfully. Awaiting admin approval.', request: populated });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/service-requests/my
// @access Provider
const getMyServiceRequests = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found.' });

    const requests = await ServiceRequest.find({ providerId: provider._id })
      .populate('serviceId', 'name icon')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/service-requests
// @access Admin
const getAllServiceRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ServiceRequest.countDocuments(filter);
    const requests = await ServiceRequest.find(filter)
      .populate('serviceId', 'name icon')
      .populate('userId', 'name email phone')
      .populate('providerId', 'businessName location')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, requests });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/service-requests/:id/review
// @access Admin
const reviewServiceRequest = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected.' });
    }
    if (status === 'Rejected' && !rejectionReason?.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required when rejecting.' });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Service request not found.' });

    request.status = status;
    request.rejectionReason = status === 'Rejected' ? rejectionReason.trim() : '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // If approved, update the provider's hourlyRate (price) field
    if (status === 'Approved') {
      await ServiceProvider.findByIdAndUpdate(request.providerId, {
        price: request.hourlyRate,
        isApproved: true,
      });
    }

    const populated = await ServiceRequest.findById(request._id)
      .populate('serviceId', 'name icon')
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name');

    res.status(200).json({ success: true, message: `Service request ${status.toLowerCase()}.`, request: populated });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/service-requests/:id/resubmit
// @access Provider (for rejected requests)
const resubmitServiceRequest = async (req, res, next) => {
  try {
    const { serviceId, serviceName, description, hourlyRate } = req.body;

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Service request not found.' });

    // Verify this belongs to the requesting provider
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider || request.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (request.status !== 'Rejected') {
      return res.status(400).json({ success: false, message: 'Only rejected requests can be resubmitted.' });
    }

    request.serviceId = serviceId || request.serviceId;
    request.serviceName = serviceName || request.serviceName;
    request.description = description || request.description;
    request.hourlyRate = hourlyRate || request.hourlyRate;
    request.status = 'Pending';
    request.rejectionReason = '';
    request.reviewedBy = null;
    request.reviewedAt = null;
    await request.save();

    const populated = await ServiceRequest.findById(request._id)
      .populate('serviceId', 'name icon');

    res.status(200).json({ success: true, message: 'Request resubmitted successfully.', request: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  reviewServiceRequest,
  resubmitServiceRequest,
};
