const Event = require('../models/Event');

// Build search filter using text index if available, fallback to regex
const buildSearchFilter = (search = '') => {
  const filter = {};
  const term = String(search).trim();
  if (term) {
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { location: { $regex: term, $options: 'i' } },
    ];
  }
  return filter;
};

const applyFilters = (filter, { category, location, startDate, endDate, priceMin, priceMax } = {}) => {
  if (category) filter.category = category;
  if (location) filter.location = { $regex: String(location), $options: 'i' };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (priceMin != null || priceMax != null) {
    filter.price = {};
    if (priceMin != null) filter.price.$gte = Number(priceMin);
    if (priceMax != null) filter.price.$lte = Number(priceMax);
  }
  return filter;
};

const paginateEvents = async (Model, filter, { page = 1, limit = 10, sort = { date: 1 }, populate } = {}) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    (populate
      ? Model.find(filter).sort(sort).skip(skip).limit(limit).populate(populate)
      : Model.find(filter).sort(sort).skip(skip).limit(limit)),
    Model.countDocuments(filter),
  ]);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const updateSeatAvailability = async (eventId, newSeats) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');
  const booked = Math.max(0, event.seats - event.availableSeats);
  if (newSeats < booked) throw new Error(`Seats cannot be less than already booked (${booked})`);
  event.seats = newSeats;
  event.availableSeats = Math.max(0, newSeats - booked);
  await event.save();
  return event;
};

const checkSeatAvailability = async (eventId, quantity = 1) => {
  const event = await Event.findById(eventId);
  if (!event || !event.isActive) return false;
  return event.availableSeats >= quantity;
};

const formatEventResponse = (event) => {
  const obj = event.toJSON ? event.toJSON() : event;
  // Ensure sensitive organizer fields are not leaked
  if (obj.organizer && obj.organizer.email) delete obj.organizer.email;
  return obj;
};

module.exports = {
  buildSearchFilter,
  applyFilters,
  paginateEvents,
  updateSeatAvailability,
  checkSeatAvailability,
  formatEventResponse,
};
