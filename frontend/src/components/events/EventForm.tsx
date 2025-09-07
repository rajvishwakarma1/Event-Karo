import { useMemo, useState } from 'react';
import type { Event } from '../../types';

type Values = Partial<Pick<Event, 'title' | 'description' | 'date' | 'location' | 'seats' | 'price' | 'category' | 'tags'>>;

export default function EventForm({ initial, onSubmit, submitting }: { initial?: Values; onSubmit: (v: Values, poster?: File | null) => Promise<void> | void; submitting?: boolean }) {
  const [values, setValues] = useState<Values>({
  title: '', description: '', date: '', location: '', seats: undefined, price: undefined, category: 'conference', tags: [],
    ...initial,
  });
  const [poster, setPoster] = useState<File | null>(null);
  const categories = useMemo(() => ['conference', 'workshop', 'social', 'sports'] as const, []);
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) =>
    setValues((v) => ({ ...v, [k]: typeof e === 'string' ? e : e.target.value }));

  const onSubmitLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize payload to satisfy backend validation
    const payload: Values = {
      title: (values.title || '').trim(),
      description: (values.description || '').trim(),
      date: values.date ? new Date(String(values.date)).toISOString() : '',
      location: (values.location || '').trim(),
      seats: Number(values.seats || 0),
      price: Number(values.price || 0),
      category: values.category && categories.includes(values.category as any) ? values.category : 'conference',
      tags: (values.tags || []).map((s: any) => String(s).trim()).filter(Boolean),
    };
    // Basic client validation to avoid common 400s
    if (!payload.title || payload.title.length < 3) return alert('Title must be at least 3 characters.');
    if (!payload.description || payload.description.length < 10) return alert('Description must be at least 10 characters.');
    if (!payload.date) return alert('Please pick a valid date/time in the future.');
    if (!payload.location || payload.location.length < 5) return alert('Location must be at least 5 characters.');
    if (!payload.seats || payload.seats < 1) return alert('Seats must be at least 1.');

  await onSubmit(payload, poster);
  // If parent handles creation and returns an id externally, poster upload can be done there.
  };

  return (
    <form onSubmit={onSubmitLocal} className="space-y-3">
      <input className="input" placeholder="Title" value={values.title || ''} onChange={set('title')} required />
      <textarea className="input min-h-[120px]" placeholder="Description" value={values.description || ''} onChange={set('description')} required />
      <input className="input" type="datetime-local" value={values.date || ''} onChange={set('date')} required />
      <input className="input" placeholder="Location" value={values.location || ''} onChange={set('location')} required />
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1" htmlFor="seats">Seats</label>
          <input
            id="seats"
            className="input"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="Enter seats"
            value={values.seats ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setValues((v) => ({ ...v, seats: val === '' ? undefined : Number(val) }));
            }}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1" htmlFor="price">Price</label>
          <input
            id="price"
            className="input"
            type="number"
            min={0}
            step={0.01}
            inputMode="decimal"
            placeholder="Enter price"
            value={values.price ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setValues((v) => ({ ...v, price: val === '' ? undefined : Number(val) }));
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select className="input" value={values.category || 'conference'} onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}>
          {categories.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <input className="input" placeholder="Tags (comma separated)" value={(values.tags || []).join(', ')} onChange={(e) => setValues((v) => ({ ...v, tags: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))} />
      </div>
      <div className="flex items-center gap-2">
        <input className="input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setPoster(e.target.files?.[0] || null)} />
        {poster && <span className="text-xs text-gray-600">{poster.name}</span>}
      </div>
      <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Event'}</button>
    </form>
  );
}
