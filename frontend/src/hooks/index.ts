import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const setValue = useCallback((value: T | ((v: T) => T)) => {
    setStoredValue((prev) => {
      const v = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(v));
      return v as T;
    });
  }, [key]);
  return [storedValue, setValue] as const;
}

export function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function usePagination(initialPage = 1, initialLimit = 9) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const next = useCallback(() => setPage((p) => p + 1), []);
  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const reset = useCallback(() => { setPage(initialPage); setLimit(initialLimit); }, [initialPage, initialLimit]);
  return { page, limit, setPage, setLimit, next, prev, reset } as const;
}

export function useApi<T, A extends unknown[]>(fn: (...args: A) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  const run = useCallback(async (...args: A) => {
    setLoading(true); setError(null);
    try {
      const res = await fn(...args);
      if (mounted.current) setData(res);
      return res;
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Request failed';
      if (mounted.current) setError(msg);
      throw e;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [fn]);
  return useMemo(() => ({ data, error, loading, run, setData }) as const, [data, error, loading, run]);
}
