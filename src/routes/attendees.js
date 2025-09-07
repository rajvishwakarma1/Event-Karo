const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const { checkEventOwnershipParam } = require('../middleware/rsvpValidation');

const router = express.Router();

// GET /api/attendees/organizer/stats - aggregate stats across organizer's events
router.get('/organizer/stats', auth, authorize('organizer'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id, isActive: true }).select('_id');
    const eventIds = events.map((e) => e._id);
    const totalEvents = events.length;

    if (eventIds.length === 0) {
      return res.json({ totalEvents: 0, totalRsvps: 0, confirmed: 0, pending: 0, cancelled: 0, revenue: 0 });
    }

    const [totalRsvps, confirmed, pending, cancelled, revenueAgg] = await Promise.all([
      RSVP.countDocuments({ event: { $in: eventIds } }),
      RSVP.countDocuments({ event: { $in: eventIds }, status: 'confirmed' }),
      RSVP.countDocuments({ event: { $in: eventIds }, status: 'pending' }),
      RSVP.countDocuments({ event: { $in: eventIds }, status: 'cancelled' }),
      RSVP.aggregate([
        { $match: { event: { $in: eventIds }, paymentStatus: 'completed' } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.revenue || 0;
    return res.json({ totalEvents, totalRsvps, confirmed, pending, cancelled, revenue });
  } catch (err) {
    console.error('Organizer stats error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendees/events/:eventId/attendees - list attendees with optional status filter
router.get('/events/:eventId/attendees', auth, authorize('organizer'), checkEventOwnershipParam, async (req, res) => {
  try {
    const { status } = req.query; // pending | confirmed | cancelled
    const filter = { event: req.params.eventId };
    if (status) filter.status = status;
    const rsvps = await RSVP.find(filter).populate('user', 'name email role');
    return res.json(rsvps);
  } catch (err) {
    console.error('List attendees error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendees/events/:eventId/attendees/stats - attendee stats
router.get('/events/:eventId/attendees/stats', auth, authorize('organizer'), checkEventOwnershipParam, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const [total, confirmed, pending, cancelled, revenueAgg] = await Promise.all([
      RSVP.countDocuments({ event: eventId }),
      RSVP.countDocuments({ event: eventId, status: 'confirmed' }),
      RSVP.countDocuments({ event: eventId, status: 'pending' }),
      RSVP.countDocuments({ event: eventId, status: 'cancelled' }),
      RSVP.aggregate([
        { $match: { event: new (require('mongoose').Types.ObjectId)(eventId), paymentStatus: 'completed' } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.revenue || 0;
    return res.json({ total, confirmed, pending, cancelled, revenue });
  } catch (err) {
    console.error('Attendee stats error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/attendees/events/:eventId/attendees/:rsvpId/status - update RSVP status
router.put('/events/:eventId/attendees/:rsvpId/status', auth, authorize('organizer'), checkEventOwnershipParam, async (req, res) => {
  try {
    const { status } = req.body; // expected: confirmed | cancelled
    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const rsvp = await RSVP.findById(req.params.rsvpId);
    if (!rsvp || String(rsvp.event) !== String(req.params.eventId)) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    // Adjust seats when cancelling a confirmed reservation
    if (status === 'cancelled' && rsvp.status === 'confirmed') {
      const EventModel = require('../models/Event');
      await EventModel.findOneAndUpdate(
        { _id: rsvp.event },
        { $inc: { availableSeats: rsvp.ticketQuantity } }
      );
    }

    rsvp.status = status;
    await rsvp.save();

    return res.json(rsvp);
  } catch (err) {
    console.error('Update attendee status error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendees/events/:eventId/attendees/export - CSV export
router.get('/events/:eventId/attendees/export', auth, authorize('organizer'), checkEventOwnershipParam, async (req, res) => {
  try {
    const rsvps = await RSVP.find({ event: req.params.eventId }).populate('user', 'name email');
    const header = 'Name,Email,Status,Quantity,TotalAmount\n';
    const rows = rsvps.map(r => `${r.user?.name || ''},${r.user?.email || ''},${r.status},${r.ticketQuantity},${r.totalAmount}`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendees.csv"');
    return res.send(header + rows.join('\n'));
  } catch (err) {
    console.error('Export attendees error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
