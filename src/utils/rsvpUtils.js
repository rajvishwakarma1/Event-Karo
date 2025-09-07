const mongoose = require('mongoose');
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const { createPaymentIntent, refundPayment } = require('../services/payment');

const calculateTotalCost = (eventPrice, quantity) => Math.max(0, Math.round(Number(eventPrice) * 100) * quantity); // in cents

const generateTicketNumber = () => `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const updateSeatCount = async (eventId, quantityChange) => {
  const updated = await Event.findOneAndUpdate(
    { _id: eventId, availableSeats: { $gte: quantityChange > 0 ? 0 : Math.abs(quantityChange) }, isActive: true },
    { $inc: { availableSeats: quantityChange } },
    { new: true }
  );
  return updated;
};

const processRSVP = async ({ userId, eventId, quantity = 1, notes }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const event = await Event.findById(eventId).session(session);
    if (!event || !event.isActive) throw new Error('Event not found');
    if (event.date.getTime() <= Date.now()) throw new Error('Event already occurred');

    // Atomic seat decrement
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gte: quantity } },
      { $inc: { availableSeats: -quantity } },
      { new: true, session }
    );
    if (!updatedEvent) throw new Error('Not enough seats available');

    const amountCents = calculateTotalCost(event.price, quantity);

    let payment = null;
    let paymentStatus = 'completed';
    let status = 'confirmed';
    let paymentIntentId = undefined;

    if (amountCents > 0) {
      payment = await createPaymentIntent(amountCents, 'usd', { eventId: String(eventId), userId: String(userId) });
      paymentStatus = 'pending';
      status = 'pending';
      paymentIntentId = payment.id;
    }

    // Always create a fresh RSVP document for a new booking
    const created = await RSVP.create([
      {
        user: userId,
        event: eventId,
        status,
        paymentStatus,
        paymentIntentId,
        ticketQuantity: quantity,
        totalAmount: amountCents, // store cents
        notes,
      },
    ], { session });
    const rsvp = created[0];

    await session.commitTransaction();
    session.endSession();

  return { rsvp, payment };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const cancelRSVP = async (rsvp, { by = 'user', remove = false } = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const event = await Event.findById(rsvp.event).session(session);
    if (!event) throw new Error('Event not found');

    // Restore seats if previously held/confirmed
    if (rsvp.status !== 'cancelled') {
      await Event.findByIdAndUpdate(rsvp.event, { $inc: { availableSeats: rsvp.ticketQuantity } }, { session });
    }

    // Refund if payment completed
    if (rsvp.paymentStatus === 'completed' && rsvp.paymentIntentId) {
      await refundPayment(rsvp.paymentIntentId, rsvp.totalAmount);
      rsvp.paymentStatus = 'refunded';
    }

    rsvp.status = 'cancelled';
    await rsvp.save({ session });

    if (remove) {
      await RSVP.deleteOne({ _id: rsvp._id }).session(session);
    }

    await session.commitTransaction();
    session.endSession();
    return { message: 'RSVP cancelled', rsvp };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const sendRSVPConfirmation = async (_rsvp) => {
  // Placeholder for email notifications
  return true;
};

module.exports = {
  processRSVP,
  cancelRSVP,
  updateSeatCount,
  calculateTotalCost,
  generateTicketNumber,
  sendRSVPConfirmation,
};
