import { Link } from 'react-router-dom';
import type { Event } from '../../types';
import { MapPin, CalendarDays, Users, Image as ImageIcon } from 'lucide-react';
import { formatDate, formatCurrency, truncateText } from '../../utils';

export default function EventCard({ event }: { event: Event }) {
  const placeholderByCategory: Record<string, string> = {
    conference: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=800&auto=format&fit=crop',
    workshop: 'https://images.unsplash.com/photo-1584697964203-55b17a8a9dc9?q=80&w=800&auto=format&fit=crop',
    social: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
    sports: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800&auto=format&fit=crop',
    music: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=800&auto=format&fit=crop',
    movie: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=800&auto=format&fit=crop',
    play: 'https://images.unsplash.com/photo-1542382257-80dedb725088?q=80&w=800&auto=format&fit=crop',
    meeting: 'https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?q=80&w=800&auto=format&fit=crop',
  };
  const poster = event.imageUrl && event.imageUrl.trim() !== ''
    ? event.imageUrl
    : placeholderByCategory[event.category || 'conference'] || placeholderByCategory.conference;
  return (
    <Link to={`/events/${event._id}`} className="card group transition-shadow hover:shadow-md">
      <div className="mb-3 overflow-hidden rounded-md">
        {poster ? (
          <img src={poster} alt={event.title} className="h-40 w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-gray-400"><ImageIcon className="h-8 w-8" /></div>
        )}
      </div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold group-hover:text-primary-700">{event.title}</h3>
        {event.price > 0 ? (
          <span className="badge blue">{formatCurrency(event.price)}</span>
        ) : (
          <span className="badge green">Free</span>
        )}
      </div>
      <p className="text-sm text-gray-600">{truncateText(event.description, 120)}</p>
      <div className="mt-3 space-y-1 text-sm text-gray-700">
        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {formatDate(event.date)}</div>
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</div>
        <div className="flex items-center gap-2"><Users className="h-4 w-4" /> {event.availableSeats} seats left</div>
      </div>
    </Link>
  );
}
