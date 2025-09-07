const { body, query, validationResult } = require('express-validator');
const Event = require('../models/Event');

const CATEGORIES = ['conference', 'workshop', 'social', 'sports'];

const validateEventCreation = [
  body('title').isString().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').isString().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('date').isISO8601().toDate().custom((v) => v.getTime() > Date.now()).withMessage('Date must be in the future'),
  body('location').isString().trim().isLength({ min: 5, max: 200 }).withMessage('Location must be 5-200 characters'),
  body('seats').isInt({ min: 1, max: 10000 }).withMessage('Seats must be between 1 and 10000'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
  body('tags.*').optional().isString().trim().isLength({ min: 1, max: 30 }).withMessage('Each tag must be 1-30 characters'),
];

const validateEventUpdate = [
  body('title').optional().isString().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().isString().trim().isLength({ min: 10, max: 1000 }),
  body('date').optional().isISO8601().toDate().custom((v) => v.getTime() > Date.now()),
  body('location').optional().isString().trim().isLength({ min: 5, max: 200 }),
  body('seats').optional().isInt({ min: 1, max: 10000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(CATEGORIES),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString().trim().isLength({ min: 1, max: 30 }),
];

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Ownership check (organizer must own the event)
const checkEventOwnership = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (String(event.organizer) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You do not have permission to modify this event' });
    }
    next();
  } catch (err) {
    console.error('Ownership check error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Availability check middleware (for RSVPs, etc.)
const checkEventAvailability = async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity) || 1;
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) return res.status(404).json({ error: 'Event not found' });
    if (event.availableSeats < quantity) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }
    next();
  } catch (err) {
    console.error('Availability check error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  validateEventCreation,
  validateEventUpdate,
  runValidation,
  checkEventOwnership,
  checkEventAvailability,
};
