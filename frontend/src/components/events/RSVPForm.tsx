import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RSVPForm({ eventId, onSuccess }: { eventId: string; onSuccess?: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.rsvp.create(eventId, { quantity, notes });
      if (res.payment?.clientSecret) {
        // Stripe confirmation would go here
      }
      toast.success('RSVP successful');
      onSuccess?.();
    } catch (e: unknown) {
      const msg = (e as any)?.response?.data?.error || (e as Error)?.message || 'Failed to RSVP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm">Tickets</label>
        <input className="input w-28" type="number" min={1} max={10} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      </div>
      <div>
        <label className="mb-1 block text-sm">Notes</label>
        <textarea className="input min-h-[90px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <button className="btn btn-primary" disabled={loading}>{loading ? 'Processing...' : 'Confirm RSVP'}</button>
    </form>
  );
}
