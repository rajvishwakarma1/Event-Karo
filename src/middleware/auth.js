const { verifyToken } = require('../utils/jwt');
const mongoose = require('mongoose');
const User = require('../models/User');

// Authenticate user via Bearer token
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(String(decoded.id))) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

  // Single, clear user lookup
  const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    // Treat cast/jwt issues as 401 rather than 500
    if (err?.name === 'CastError' || err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

// Authorize specific roles
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Optionally attach user if token is present and valid; never errors
const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (user) req.user = user;
      } catch (_) {
        // ignore invalid tokens for optional auth
      }
    }
  } catch (_) {
    // swallow errors in optional auth
  }
  next();
};

module.exports = { auth, authorize, optionalAuth };
