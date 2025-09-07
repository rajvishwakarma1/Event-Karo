import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MyEvents from '../components/dashboard/MyEvents';
import EventForm from '../components/events/EventForm';
import api from '../services/api';
import AttendeeManagement from '../components/dashboard/AttendeeManagement';
import type { Event } from '../types';
import Modal from '../components/common/Modal';

export default function Dashboard() {
  const { hasRole } = useAuth();
  const [tab, setTab] = useState<'overview' | 'events' | 'create' | 'attendees'>('overview');
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [stats, setStats] = useState<{ totalEvents: number; totalRsvps: number; revenue: number } | null>(null);
  const [analyticsEventId, setAnalyticsEventId] = useState<string | null>(null);

  useEffect(() => {
    api.events.getMyEvents().then((res) => {
      setMyEvents(res.data);
      if (res.data.length) setSelectedEventId(res.data[0]._id);
    }).catch(() => setMyEvents([]));
    // Load organizer stats for overview
    api.attendees.getOrganizerStats().then((s) => setStats({ totalEvents: s.totalEvents, totalRsvps: s.totalRsvps, revenue: s.revenue })).catch(() => setStats({ totalEvents: 0, totalRsvps: 0, revenue: 0 }));
  }, []);

  return (
  <>
  <section className="container mx-auto px-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
        <div className="text-sm text-gray-600">Welcome back{/* placeholder for organizer name */}</div>
      </div>
      <div className="mb-4 flex gap-2">
        <button className={`btn border ${tab === 'overview' ? 'bg-gray-100' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`btn border ${tab === 'events' ? 'bg-gray-100' : ''}`} onClick={() => setTab('events')}>My Events</button>
        {hasRole('organizer') && (
          <button className={`btn border ${tab === 'create' ? 'bg-gray-100' : ''}`} onClick={() => setTab('create')}>Create Event</button>
        )}
        {hasRole('organizer') && (
          <button className={`btn border ${tab === 'attendees' ? 'bg-gray-100' : ''}`} onClick={() => setTab('attendees')}>Attendees</button>
        )}
      </div>
  {tab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card">
            <div className="text-sm text-gray-500">Total Events</div>
    <div className="mt-2 text-2xl font-semibold">{stats ? stats.totalEvents : '--'}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-500">Total RSVPs</div>
    <div className="mt-2 text-2xl font-semibold">{stats ? stats.totalRsvps : '--'}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-500">Revenue</div>
    <div className="mt-2 text-2xl font-semibold">₹ {stats ? (stats.revenue / 100).toFixed(2) : '--'}</div>
          </div>
        </div>
      )}
      {tab === 'events' && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">Manage your events below.</div>
          <MyEvents onAnalytics={(id) => setAnalyticsEventId(id)} />
        </div>
      )}
      {tab === 'create' && hasRole('organizer') && (
        <div className="card">
          <EventForm onSubmit={async (v, poster) => {
            try {
              const created = await api.events.create(v as any);
              // If a poster file was chosen, upload it now.
              if (poster) {
                try {
                  await api.events.uploadPoster(created._id, poster);
                } catch (e) {
                  console.warn('Poster upload failed', e);
                }
              }
              alert('Event created');
            } catch (err: any) {
              const msg = err?.response?.data?.error
                || (err?.response?.data?.errors ? err.response.data.errors.map((e: any) => e.msg).join(', ') : '')
                || err?.message || 'Failed to create event';
              alert(msg);
            }
          }} />
        </div>
      )}
      {tab === 'create' && !hasRole('organizer') && (
        <div className="card text-red-600">Only organizers can create events.</div>
      )}
      {tab === 'attendees' && hasRole('organizer') && (
  <div className="space-y-3">
          <div className="card">
            <label className="mb-1 block text-sm">Select Event</label>
            <select className="input" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
              {myEvents.map((e) => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
          </div>
          {selectedEventId ? (
            <div className="card">
              <AttendeeManagement eventId={selectedEventId} />
            </div>
          ) : (
            <div className="text-gray-600">No events available.</div>
          )}
        </div>
      )}
      {tab === 'attendees' && !hasRole('organizer') && (
        <div className="card text-red-600">Only organizers can view attendees.</div>
      )}
    </section>
  <Modal open={!!analyticsEventId} onClose={() => setAnalyticsEventId(null)}>
      {analyticsEventId ? <EventAnalytics eventId={analyticsEventId} /> : null}
    </Modal>
  </>
  );
}

function EventAnalytics({ eventId }: { eventId: string }) {
  const [stats, setStats] = useState<{ total: number; confirmed: number; pending: number; cancelled: number; revenue: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.attendees.getStats(eventId)
      .then((s) => setStats(s))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div>Loading analytics…</div>;
  if (!stats) return <div className="text-red-600">Failed to load analytics</div>;

  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold">Event Analytics</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card"><div className="text-sm text-gray-500">Total RSVPs</div><div className="mt-2 text-xl font-semibold">{stats.total}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Confirmed</div><div className="mt-2 text-xl font-semibold">{stats.confirmed}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Pending</div><div className="mt-2 text-xl font-semibold">{stats.pending}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Cancelled</div><div className="mt-2 text-xl font-semibold">{stats.cancelled}</div></div>
        <div className="card md:col-span-2"><div className="text-sm text-gray-500">Revenue</div><div className="mt-2 text-xl font-semibold">₹ {(stats.revenue / 100).toFixed(2)}</div></div>
      </div>
    </div>
  );
}
