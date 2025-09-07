const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const rsvpRoutes = require('./routes/rsvp');
const attendeeRoutes = require('./routes/attendees');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
const uploadRoot = process.env.UPLOADS_ROOT || (process.env.VERCEL ? '/tmp' : path.join(__dirname, '..'));
const staticUploads = path.join(uploadRoot, 'uploads');
try { if (!fs.existsSync(staticUploads)) fs.mkdirSync(staticUploads, { recursive: true }); } catch (_) {}
app.use('/uploads', express.static(staticUploads));

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Root route (useful for deployed environments)
app.get('/', (req, res) => {
  res.json({
    name: 'Event Karo API',
    status: 'ok',
    health: '/api/health',
    docs: 'README.md'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Event routes
app.use('/api/events', eventRoutes);

// RSVP routes
app.use('/api/rsvp', rsvpRoutes);

// Attendee management routes
app.use('/api/attendees', attendeeRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
