const mongoose = require('mongoose');

const RSVP_STATUS = ['pending', 'confirmed', 'cancelled'];
const PAYMENT_STATUS = ['pending', 'completed', 'failed', 'refunded'];

const rsvpSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    status: { type: String, enum: RSVP_STATUS, default: 'pending', index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: 'pending', index: true },
    paymentIntentId: { type: String },
    ticketQuantity: { type: Number, default: 1, min: [1, 'Quantity must be at least 1'] },
    totalAmount: { type: Number, default: 0, min: [0, 'Total amount cannot be negative'] },
    rsvpDate: { type: Date, default: Date.now },
    notes: { type: String, maxlength: [500, 'Notes must be at most 500 characters'] },
  },
  { timestamps: true }
);

// Prevent duplicate ACTIVE RSVPs (pending/confirmed) for same user & event.
// Allow multiple historical (cancelled/failed/refunded) RSVPs as separate records.
rsvpSchema.index(
  { user: 1, event: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);

const RSVP = mongoose.model('RSVP', rsvpSchema);

// Best-effort index migration: drop old strict unique index if it exists, then sync desired indexes
// Ignore errors if index doesn't exist or collection not yet created
RSVP.collection
  .dropIndex('user_1_event_1')
  .catch(() => {})
  .finally(() => {
  RSVP.syncIndexes().catch(() => {});
  });

// Helpful index to list a user's bookings by latest first
rsvpSchema.index({ user: 1, rsvpDate: -1, createdAt: -1 });

module.exports = RSVP;
