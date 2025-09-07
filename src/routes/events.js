const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const Event = require('../models/Event');
const {
  validateEventCreation,
  validateEventUpdate,
  runValidation,
  checkEventOwnership,
} = require('../middleware/eventValidation');
const {
  buildSearchFilter,
  applyFilters,
  paginateEvents,
  formatEventResponse,
} = require('../utils/eventUtils');

const router = express.Router();

// Multer setup for poster uploads
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `event-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = /\.(png|jpe?g|webp)$/i.test(file.originalname);
    cb(ok ? null : new Error('Only PNG, JPG, WEBP allowed'), ok);
  },
});

// GET /api/events - list with search/filter/pagination (auth optional to support organizer=me)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search = '',
      category,
      location,
      startDate,
      endDate,
      priceMin,
      priceMax,
      organizer,
      page = 1,
      limit = 10,
      sort = 'date',
      order = 'asc',
    } = req.query;

    const filter = buildSearchFilter(search);
    applyFilters(filter, { category, location, startDate, endDate, priceMin, priceMax });
    filter.isActive = true;

    // If client asks for organizer=me, apply only when user is authenticated
    if (organizer === 'me') {
      if (req.user) {
        filter.organizer = req.user._id;
      } else {
        // Ignore the 'me' filter if unauthenticated to avoid 500s
        // Alternatively, we could return 401; but keeping list public without narrowing
      }
    } else if (organizer) {
      if (mongoose.Types.ObjectId.isValid(String(organizer))) {
        filter.organizer = organizer;
      }
    }

    const sortOption = {};
    if (sort === 'date') sortOption.date = order === 'desc' ? -1 : 1;
    else if (sort === 'price') sortOption.price = order === 'desc' ? -1 : 1;
    else sortOption.createdAt = -1;

    const result = await paginateEvents(Event, filter, {
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 10, 100),
      sort: sortOption,
      populate: { path: 'organizer', select: 'name role' },
    });

    result.data = result.data.map(formatEventResponse);

  return res.json(result);
  } catch (err) {
    console.error('List events error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/events/my-events - organizer's events
router.get('/my-events', auth, authorize('organizer'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { organizer: req.user._id, isActive: true };
    const result = await paginateEvents(Event, filter, {
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 10, 100),
      sort: { date: 1 },
    });

    result.data = result.data.map(formatEventResponse);

    return res.json(result);
  } catch (err) {
    console.error('My events error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/events/:id - event detail
router.get('/:id', async (req, res) => {
  try {
    // Guard against invalid ObjectId to prevent CastErrors -> 500
    if (!mongoose.Types.ObjectId.isValid(String(req.params.id))) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = await Event.findOne({ _id: req.params.id, isActive: true })
      .populate('organizer', 'name role');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.json(formatEventResponse(event));
  } catch (err) {
    console.error('Get event error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/events - create (organizers only)
router.post('/', auth, authorize('organizer'), validateEventCreation, runValidation, async (req, res) => {
  try {
    const payload = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      date: new Date(req.body.date),
      location: req.body.location.trim(),
      seats: Number(req.body.seats),
      price: req.body.price != null ? Number(req.body.price) : 0,
      category: req.body.category,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      organizer: req.user._id,
      isActive: true,
    };

    const event = new Event(payload);
    await event.save();

    return res.status(201).json(formatEventResponse(event));
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/events/:id - update (organizer owner only)
router.put(
  '/:id',
  auth,
  authorize('organizer'),
  validateEventUpdate,
  runValidation,
  checkEventOwnership,
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event || !event.isActive) return res.status(404).json({ error: 'Event not found' });

      // Update basic fields if provided
      const updatable = ['title', 'description', 'date', 'location', 'price', 'category', 'tags'];
      for (const key of updatable) {
        if (req.body[key] !== undefined) {
          event[key] = key === 'date' ? new Date(req.body[key]) : req.body[key];
        }
      }

      if (req.body.seats !== undefined) {
        const newSeats = Number(req.body.seats);
        const booked = Math.max(0, event.seats - event.availableSeats);
        if (newSeats < booked) {
          return res.status(400).json({ error: `Seats cannot be less than already booked (${booked})` });
        }
        event.seats = newSeats;
        event.availableSeats = Math.max(0, newSeats - booked);
      }

      await event.save();
      return res.json(formatEventResponse(event));
    } catch (err) {
      console.error('Update event error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/events/:id/poster - upload/replace poster image
router.post(
  '/:id/poster',
  auth,
  authorize('organizer'),
  checkEventOwnership,
  upload.single('poster'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const event = await Event.findById(req.params.id);
      if (!event || !event.isActive) return res.status(404).json({ error: 'Event not found' });
      const rel = `/uploads/${path.basename(req.file.path)}`;
      event.imageUrl = rel;
      await event.save();
      return res.json({ imageUrl: rel, event: formatEventResponse(event) });
    } catch (err) {
      console.error('Poster upload error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// DELETE /api/events/:id - soft delete (organizer owner only)
router.delete('/:id', auth, authorize('organizer'), checkEventOwnership, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) return res.status(404).json({ error: 'Event not found' });
    event.isActive = false;
    await event.save();
    return res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
