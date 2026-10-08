const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: [0, 'Price cannot be negative'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Working days: array of day names
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    // Format: "09:00" (24h)
    workingStartTime: {
      type: String,
      default: '09:00',
    },
    workingEndTime: {
      type: String,
      default: '18:00',
    },
    // Duration in minutes: 30, 60, or 90
    slotDuration: {
      type: Number,
      default: 60,
      enum: [30, 60, 90],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for provider search
serviceProviderSchema.index({ serviceId: 1, isActive: 1, isApproved: 1 });
serviceProviderSchema.index({ location: 1 });
serviceProviderSchema.index({ rating: -1 });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
