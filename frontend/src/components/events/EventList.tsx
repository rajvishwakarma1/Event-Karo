import type { Event } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EventCard from './EventCard';

export default function EventList({ events, loading, error }: { events: Event[]; loading: boolean; error?: string | null }) {
  if (loading) return <div className="flex justify-center"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!events.length) return <div className="text-center text-gray-600">No events found.</div>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((ev) => (
        <EventCard key={ev._id} event={ev} />
      ))}
    </div>
  );
}
