const mongoose = require('mongoose');

const CATEGORIES = ['conference', 'workshop', 'social', 'sports'];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description must be at most 1000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      validate: {
        validator: (v) => v && v.getTime() > Date.now(),
        message: 'Event date must be in the future',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    seats: {
      type: Number,
      required: [true, 'Seats is required'],
      min: [1, 'Seats must be at least 1'],
      max: [10000, 'Seats must be at most 10000'],
    },
    availableSeats: {
      type: Number,
      default: 0,
      min: [0, 'Available seats cannot be negative'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
    },
    tags: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure availableSeats initializes to seats on creation
eventSchema.pre('save', function (next) {
  if (this.isNew) {
    this.availableSeats = this.seats;
  } else if (this.isModified('seats')) {
    const booked = Math.max(0, (this._previousSeats ?? this.seats) - this.availableSeats);
    // Adjust available seats based on new total seats keeping booked constant
    this.availableSeats = Math.max(0, this.seats - booked);
  }
  next();
});

// Track previous seats for adjustment
eventSchema.pre('validate', function (next) {
  if (!this.isNew && this.isModified('seats')) {
    this._previousSeats = this.get('seats');
  }
  next();
});

// Virtual: isFull
eventSchema.virtual('isFull').get(function () {
  return this.availableSeats === 0;
});

// Indexes for performance and search
eventSchema.index({ date: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
// Text index for search across common fields
eventSchema.index({ title: 'text', description: 'text', location: 'text' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
