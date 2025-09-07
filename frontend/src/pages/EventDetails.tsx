import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import type { Event } from '../types';
import Modal from '../components/common/Modal';
import RSVPForm from '../components/events/RSVPForm';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const data = await api.events.getById(id);
        setEvent(data);
      } catch (e: unknown) {
        const msg = (e as any)?.response?.data?.error || (e as Error)?.message || 'Failed to load event';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSuccess = () => setOpen(false);

  if (loading) return <div>Loading...</div>;
  if (error || !event) return <div className="text-red-600">{error || 'Event not found'}</div>;

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">{event.title}</h1>
      <p className="text-gray-600">{new Date(event.date).toLocaleString()} • {event.location}</p>
      <p className="mt-4">{event.description}</p>
      <div className="mt-6">
        <button className="btn btn-primary" onClick={() => setOpen(true)}>RSVP</button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        {id && <RSVPForm eventId={id} onSuccess={onSuccess} />}
      </Modal>
    </section>
  );
}
