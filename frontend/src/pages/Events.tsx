import { useEffect, useMemo, useState, useCallback } from 'react';
import api from '../services/api';
import type { Event, EventsResponse } from '../types';
import EventList from '../components/events/EventList';
import type { Filters } from '../components/events/SearchFilters';
import FilterSection from '../components/common/FilterSection';
import { useSearchParams } from 'react-router-dom';
import { usePagination } from '../hooks';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { page, limit, setPage, next, prev } = usePagination(1, 9);
  const [totalPages, setTotalPages] = useState(1);
  const [params, setParams] = useSearchParams();
  const initialFilters: Filters = useMemo(() => ({
    search: params.get('search') || undefined,
    category: params.get('category') || undefined,
    location: params.get('location') || undefined,
    sort: (params.get('sort') as Filters['sort']) || undefined,
  startDate: params.get('startDate') || undefined,
  endDate: params.get('endDate') || undefined,
  minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
  maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
  }), [params]);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  useEffect(() => {
  const load = async () => {
      try {
    const data: EventsResponse = await api.events.getAll({ ...filters, page, limit });
    setEvents(data.data);
    setTotalPages(data.totalPages || 1);
      } catch (e: unknown) {
        const msg = (e as any)?.response?.data?.error || (e as Error)?.message || 'Failed to load events';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
  load();
  }, [filters, page, limit]);

  const onChange = useCallback((f: Filters) => {
    setFilters(f);
    const next = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v !== undefined && v !== '') next.set(k, String(v)); });
    setParams(next, { replace: true });
    setPage(1);
  }, [setParams, setPage]);

  return (
    <section className="container mx-auto px-4">
      <div className="mb-4 flex items-center justify-end">
        {/* Placeholder for city selector */}
        <button className="btn border" title="City selector coming soon">Delhi-NCR ▾</button>
      </div>
  <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Left filters - inspired by BMS */}
        <aside className="space-y-3">
          <FilterSection title="Date" action={<button className="text-xs text-primary-700 hover:underline" onClick={() => onChange({ ...filters, startDate: undefined, endDate: undefined })}>Clear</button>}>
            <div className="flex flex-wrap items-center gap-2">
              <button className={`chip ${filters.startDate === new Date().toISOString().slice(0,10) && filters.endDate === new Date().toISOString().slice(0,10) ? 'tint-primary' : 'muted'}`}
                onClick={() => onChange({ ...filters, startDate: new Date().toISOString().slice(0,10), endDate: new Date().toISOString().slice(0,10) })}>Today</button>
              <button className={`chip ${(() => { const d=new Date(Date.now()+86400000).toISOString().slice(0,10); return filters.startDate===d && filters.endDate===d ? 'tint-primary' : 'muted'; })()}`}
                onClick={() => { const d=new Date(Date.now()+86400000).toISOString().slice(0,10); onChange({ ...filters, startDate: d, endDate: d }); }}>Tomorrow</button>
              <button className="chip bg-amber-50 text-amber-700 border-amber-200" onClick={() => { /* Weekend placeholder quick filter */ }}>This Weekend</button>
              <div className="ml-auto grid grid-cols-2 gap-2 max-w-full">
                <div>
                  <input className="input h-9 px-2 py-1 text-sm min-w-[8.5rem]" type="date" value={filters.startDate || ''} onChange={(e)=>onChange({ ...filters, startDate: e.target.value || undefined })} />
                  <div className="mt-1 text-[10px] leading-none text-gray-500">From</div>
                </div>
                <div>
                  <input className="input h-9 px-2 py-1 text-sm min-w-[8.5rem]" type="date" value={filters.endDate || ''} onChange={(e)=>onChange({ ...filters, endDate: e.target.value || undefined })} />
                  <div className="mt-1 text-[10px] leading-none text-gray-500">To</div>
                </div>
              </div>
            </div>
          </FilterSection>
          <FilterSection title="Categories" action={<button className="text-xs text-primary-700 hover:underline" onClick={() => onChange({ ...filters, category: undefined })}>Clear</button>}>
            <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Conference', value: 'conference' },
                  { label: 'Workshop', value: 'workshop' },
                  { label: 'Social', value: 'social' },
                  { label: 'Sports', value: 'sports' },
                ].map((c) => (
                  <button key={c.value} className={`chip ${filters.category===c.value ? 'tint-primary' : 'muted'}`} onClick={() => onChange({ ...filters, category: c.value })}>{c.label}</button>
                ))}
            </div>
          </FilterSection>
          <FilterSection title="Price" action={<button className="text-xs text-primary-700" onClick={() => onChange({ ...filters, minPrice: undefined, maxPrice: undefined })}>Clear</button>}>
            <div className="flex gap-2">
              <input className="input" type="number" min={0} placeholder="₹ Min" onChange={(e)=>onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })} />
              <input className="input" type="number" min={0} placeholder="₹ Max" onChange={(e)=>onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
          </FilterSection>
          <FilterSection title="More Filters">
            {/* Placeholder chips */}
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="chip">Languages (soon)</span>
              <span className="chip">Venues (soon)</span>
              <span className="chip">Online events (soon)</span>
            </div>
          </FilterSection>
        </aside>

        {/* Right content */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              {/* Quick topic tags (placeholder) */}
              {['Workshops','Comedy Shows','Music Shows','Performances','Kids','Meetups','Screening','Exhibitions','Conferences','Talks'].map(t => (
        <span key={t} className="chip muted">{t}</span>
              ))}
            </div>
      <select className="input w-40" value={filters.sort || 'date'} onChange={(e)=>onChange({ ...filters, sort: e.target.value as Filters['sort'] })}>
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="popularity">Sort by Popularity</option>
            </select>
          </div>

          <EventList events={events} loading={loading} error={error} />

          {!loading && !error && (
            <div className="fixed bottom-6 right-6 z-40" aria-label="pagination controls">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 shadow-lg backdrop-blur">
                <span className="hidden whitespace-nowrap text-sm text-gray-600 md:block">Page {page} of {totalPages}</span>
                <button className="btn btn-outline h-9 px-3 text-sm" onClick={prev} disabled={page <= 1}>Previous</button>
                <button className="btn btn-primary h-9 px-3 text-sm" onClick={next} disabled={page >= totalPages}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
