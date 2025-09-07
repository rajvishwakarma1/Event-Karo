import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Event } from '../../types';

export default function MyEvents({ onAnalytics }: { onAnalytics?: (eventId: string) => void }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.events.getMyEvents();
      setEvents(res.data);
    } catch (e: unknown) {
      const msg = (e as any)?.response?.data?.error || (e as Error)?.message || 'Failed to load events';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await api.events.delete(id);
    await load();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  return (
    <div className="space-y-3">
      {events.map((e) => (
        <div key={e._id} className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{e.title || 'Untitled Event'}</div>
              <div className="text-sm text-gray-600">{new Date(e.date).toLocaleString()} • {e.location || 'Venue TBD'}</div>
            </div>
            <div className="text-right">
              <div className="mt-1 flex items-center justify-end gap-2">
                <span className="badge gray">seats: {e.availableSeats}</span>
                {e.price > 0 ? (
                  <span className="badge blue">₹{e.price}</span>
                ) : (
                  <span className="badge green">Free</span>
                )}
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button className="btn btn-outline" title="Edit (coming soon)">Edit</button>
                <button className="btn btn-outline" onClick={() => onAnalytics?.(e._id)} title="Analytics">Analytics</button>
                <button className="btn btn-primary" onClick={() => remove(e._id)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
