import { useEffect, useState } from 'react';
import { useDebounce } from '../../hooks';

export type Filters = {
  search?: string;
  category?: string;
  location?: string;
  sort?: 'date' | 'price' | 'popularity';
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
};

export default function SearchFilters({ onChange, initial }: { onChange: (f: Filters) => void; initial?: Filters }) {
  const [search, setSearch] = useState(initial?.search || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [sort, setSort] = useState<Filters['sort']>(initial?.sort || 'date');
  const [startDate, setStartDate] = useState(initial?.startDate || '');
  const [endDate, setEndDate] = useState(initial?.endDate || '');
  const [minPrice, setMinPrice] = useState<number | ''>(initial?.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState<number | ''>(initial?.maxPrice ?? '');
  const debounced = useDebounce(search, 400);

  useEffect(() => {
    onChange({
      search: debounced,
      category: category || undefined,
      location: location || undefined,
      sort,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      minPrice: minPrice === '' ? undefined : Number(minPrice),
      maxPrice: maxPrice === '' ? undefined : Number(maxPrice),
    });
    // Intentionally excluding onChange to avoid new function identities causing extra renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, category, location, sort, startDate, endDate, minPrice, maxPrice]);

  const clear = () => { setSearch(''); setCategory(''); setLocation(''); setSort('date'); setStartDate(''); setEndDate(''); setMinPrice(''); setMaxPrice(''); };

  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <input className="input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      <input className="input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="conference">Conference</option>
        <option value="workshop">Workshop</option>
        <option value="social">Social</option>
        <option value="sports">Sports</option>
      </select>
      <div className="flex gap-2">
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value as Filters['sort'])}>
          <option value="date">Date</option>
          <option value="price">Price</option>
          <option value="popularity">Popularity</option>
        </select>
        <button className="btn border" onClick={clear}>Clear</button>
      </div>
      <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <div className="flex gap-2">
        <input className="input" type="number" min={0} placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))} />
        <input className="input" type="number" min={0} placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))} />
      </div>
    </div>
  );
}
