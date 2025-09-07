const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const { validateRSVP, runValidation, checkEventExists, checkDuplicateRSVP } = require('../middleware/rsvpValidation');
const { processRSVP, cancelRSVP } = require('../utils/rsvpUtils');

const router = express.Router();

// POST /api/rsvp - create RSVP
router.post('/', auth, validateRSVP, runValidation, checkEventExists, checkDuplicateRSVP, async (req, res) => {
  try {
    const { eventId, quantity = 1, notes } = req.body;
    const userId = req.user._id;

    const { rsvp, payment } = await processRSVP({ userId, eventId, quantity, notes });

    return res.status(201).json({ rsvp, payment });
  } catch (err) {
    console.error('Create RSVP error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rsvp/my-rsvps - user's RSVPs
router.get('/my-rsvps', auth, async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user._id })
      .sort({ rsvpDate: -1, createdAt: -1 })
      .populate('event');
    return res.json(rsvps);
  } catch (err) {
    console.error('My RSVPs error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/rsvp/:id/cancel - cancel own RSVP
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const rsvp = await RSVP.findById(req.params.id);
    if (!rsvp) return res.status(404).json({ error: 'RSVP not found' });
    if (String(rsvp.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You cannot cancel this RSVP' });
    }

  const result = await cancelRSVP(rsvp, { by: 'user' });
  // Ensure event details are returned so the client UI doesn't lose context
  const populated = await RSVP.findById(result.rsvp._id).populate('event');
  return res.json({ ...result, rsvp: populated });
  } catch (err) {
    console.error('Cancel RSVP error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rsvp/event/:eventId - RSVPs for an event (organizer only)
router.get('/event/:eventId', auth, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (String(event.organizer) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const rsvps = await RSVP.find({ event: event._id }).populate('user', 'name email role');
    return res.json(rsvps);
  } catch (err) {
    console.error('Event RSVPs error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/rsvp/:id - organizer removes an RSVP
router.delete('/:id', auth, authorize('organizer'), async (req, res) => {
  try {
    const rsvp = await RSVP.findById(req.params.id);
    if (!rsvp) return res.status(404).json({ error: 'RSVP not found' });

    const event = await Event.findById(rsvp.event);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (String(event.organizer) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await cancelRSVP(rsvp, { by: 'organizer', remove: true });
    return res.json(result);
  } catch (err) {
    console.error('Remove RSVP error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
