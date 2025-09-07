import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Event } from '../../types';

export default function DashboardStats() {
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    api.events.getMyEvents().then((res) => setEvents(res.data)).catch(() => setEvents([]));
  }, []);
  const upcoming = events.filter((e) => new Date(e.date) > new Date()).length;
  const total = events.length;
  const revenue = events.reduce((sum, e) => sum + (e.price || 0) * ((e.seats || 0) - (e.availableSeats || 0)), 0);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="card"><div className="text-sm text-gray-500">Total Events</div><div className="text-2xl font-bold">{total}</div></div>
      <div className="card"><div className="text-sm text-gray-500">Upcoming</div><div className="text-2xl font-bold">{upcoming}</div></div>
      <div className="card"><div className="text-sm text-gray-500">Estimated Revenue</div><div className="text-2xl font-bold">₹{revenue.toFixed(2)}</div></div>
    </div>
  );
}
