const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    // Store as YYYY-MM-DD string for consistent matching
    bookingDate: {
      type: String,
      required: [true, 'Booking date is required'],
    },
    // Store as "HH:MM" in 24h format e.g. "16:00"
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    // Computed end time e.g. "17:00"
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    // Duration in hours (1, 2, 3, ...)
    durationHours: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 hour'],
      max: [8, 'Duration cannot exceed 8 hours'],
      default: 1,
    },
    // Total price = hourlyRate * durationHours
    totalPrice: {
      type: Number,
      default: 0,
    },
    problemDescription: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true,
      maxlength: [1000, 'Problem description cannot exceed 1000 characters'],
    },
    address: {
      type: String,
      required: [true, 'Service address is required'],
      trim: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Additional notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    // Track status history
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

// CRITICAL: Unique constraint to prevent double booking
// Only one ACTIVE booking per provider+date+time
// Rejected and Cancelled bookings release the slot (handled at query level)
bookingSchema.index(
  { providerId: 1, bookingDate: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['Pending', 'Accepted', 'In Progress'] },
    },
  }
);

// Index for efficient queries
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ bookingDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
