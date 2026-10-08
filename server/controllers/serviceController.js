const Service = require('../models/Service');

// @route GET /api/services
// @access Public
const getAllServices = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    // Public gets only active; admin can filter
    if (req.user?.role === 'admin') {
      if (isActive !== undefined) filter.isActive = isActive === 'true';
    } else {
      filter.isActive = true;
    }

    const services = await Service.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, services });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/services/:id
// @access Public
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/services
// @access Admin
const createService = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const service = await Service.create({ name, description, icon });
    res.status(201).json({ success: true, message: 'Service created successfully', service });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/services/:id
// @access Admin
const updateService = async (req, res, next) => {
  try {
    const { name, description, icon, isActive } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, isActive },
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.status(200).json({ success: true, message: 'Service updated successfully', service });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/services/:id
// @access Admin
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });

    // Soft delete
    service.isActive = false;
    await service.save();

    res.status(200).json({ success: true, message: 'Service deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };
