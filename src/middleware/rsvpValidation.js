const { body, validationResult, param } = require('express-validator');
const mongoose = require('mongoose');
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(String(v));

const validateRSVP = [
  body('eventId').custom(isObjectId).withMessage('Valid eventId is required'),
  body('quantity').optional().isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes must be at most 500 characters'),
];

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const checkEventExists = async (req, res, next) => {
  try {
    const event = await Event.findById(req.body.eventId || req.params.eventId);
    if (!event || !event.isActive) return res.status(404).json({ error: 'Event not found' });
    if (event.date.getTime() <= Date.now()) return res.status(400).json({ error: 'Event already occurred' });
    req.event = event;
    next();
  } catch (err) {
    console.error('checkEventExists error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const checkDuplicateRSVP = async (req, res, next) => {
  try {
  // Block only if there's an ACTIVE RSVP (pending or confirmed)
    const exists = await RSVP.findOne({
      user: req.user._id,
      event: req.body.eventId,
      status: { $in: ['pending', 'confirmed'] },
    });
  if (exists) return res.status(409).json({ error: 'You have already RSVP’d for this event' });
    next();
  } catch (err) {
    console.error('checkDuplicateRSVP error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const checkSeatAvailabilityPreCheck = async (req, res, next) => {
  try {
    const qty = Number(req.body.quantity) || 1;
    const event = req.event || (await Event.findById(req.body.eventId));
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.availableSeats < qty) return res.status(400).json({ error: 'Not enough seats available' });
    next();
  } catch (err) {
    console.error('checkSeatAvailability error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const checkEventOwnershipParam = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (String(event.organizer) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.event = event;
    next();
  } catch (err) {
    console.error('checkEventOwnershipParam error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  validateRSVP,
  runValidation,
  checkEventExists,
  checkDuplicateRSVP,
  checkSeatAvailabilityPreCheck,
  checkEventOwnershipParam,
};
