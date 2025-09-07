import { useEffect, useState } from 'react';
import api from '../services/api';
import type { RSVP } from '../types';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const data = await api.rsvp.getMyRSVPs();
        setRsvps(data);
      } catch (e: unknown) {
        const msg = (e as any)?.response?.data?.error || (e as Error)?.message || 'Failed to load bookings';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const cancelBooking = async (rsvpId: string) => {
    if (!rsvpId) return;
    const ok = window.confirm('Cancel this booking?');
    if (!ok) return;
    setBusy((b) => ({ ...b, [rsvpId]: true }));
    try {
      const { rsvp } = await api.rsvp.cancel(rsvpId);
      setRsvps((list) => list.map((x) => (x._id === rsvpId ? rsvp : x)));
      toast.success('Booking cancelled');
    } catch (e: unknown) {
      const msg = (e as any)?.response?.data?.error || (e as Error)?.message || 'Failed to cancel';
      toast.error(msg);
    } finally {
      setBusy((b) => ({ ...b, [rsvpId]: false }));
    }
  };

  const payNow = async (rsvp: RSVP) => {
    // Placeholder action — integrate payment later
    toast(`Payment flow coming soon for ${rsvp.event.title}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (!rsvps.length) return <div>You have no bookings yet.</div>;

  return (
    <div className="space-y-3">
      {rsvps.map((r) => {
        const canCancel = r.status !== 'cancelled';
        const canPay = r.paymentStatus === 'pending' && r.status !== 'cancelled';
        const isBusy = !!busy[r._id];
  const statusBadge = r.status === 'cancelled' ? 'badge amber' : r.status === 'confirmed' ? 'badge green' : 'badge blue';
  const payBadge = r.paymentStatus === 'completed' ? 'badge green' : r.paymentStatus === 'failed' ? 'badge amber' : r.paymentStatus === 'refunded' ? 'badge blue' : 'badge gray';
        return (
          <div key={r._id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{r.event?.title ?? 'Event'}</div>
                <div className="text-sm text-gray-600">
                  {r.event?.date ? new Date(r.event.date).toLocaleString() : ''}
                  {r.event?.location ? ` • ${r.event.location}` : ''}
                </div>
                <div className="mt-1 text-xs text-gray-500">Booked on {new Date(r.rsvpDate).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">Qty: {r.ticketQuantity}</div>
                <div className="text-sm">Amount: ₹{(r.totalAmount / 100).toFixed(2)}</div>
                <div className="mt-1 flex items-center justify-end gap-2">
                  <span className={statusBadge}>{r.status}</span>
                  {r.status !== 'cancelled' && <span className={payBadge}>payment: {r.paymentStatus}</span>}
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  {canPay && (
                    <button className="btn btn-primary" onClick={() => payNow(r)} disabled={isBusy}>Pay Now</button>
                  )}
                  {canCancel && (
                    <button className="btn btn-outline" onClick={() => cancelBooking(r._id)} disabled={isBusy}>
                      {isBusy ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
