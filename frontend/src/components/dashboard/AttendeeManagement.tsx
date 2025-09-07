import { useEffect, useState } from 'react';
import api from '../../services/api';

type Attendee = { _id: string; user: { name: string; email: string }; status: string; paymentStatus: string; ticketQuantity: number };

export default function AttendeeManagement({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.attendees.getEventAttendees(eventId);
      setAttendees(data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load attendees');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (eventId) load(); }, [eventId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Tickets</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">RSVP</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Payment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {attendees.map((a) => (
            <tr key={a._id}>
              <td className="px-3 py-2">{a.user?.name}</td>
              <td className="px-3 py-2">{a.user?.email}</td>
              <td className="px-3 py-2">{a.ticketQuantity}</td>
              <td className="px-3 py-2">{a.status}</td>
              <td className="px-3 py-2">{a.paymentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
