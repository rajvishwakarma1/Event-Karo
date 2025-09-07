export function formatDate(date: string | number | Date) {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return String(date);
  }
}

export function formatCurrency(amount: number, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
}

export function truncateText(text: string, max = 100) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  let id: number | undefined;
  return (...args: Parameters<T>) => {
    if (id) window.clearTimeout(id);
    id = window.setTimeout(() => fn(...args), delay);
  };
}

export const tokenStorage = {
  get<TUser = unknown>(): { token: string; user: TUser } | null {
    const a = localStorage.getItem('auth');
    return a ? JSON.parse(a) : null;
  },
  set<T = unknown>(v: T) { localStorage.setItem('auth', JSON.stringify(v)); },
  clear() { localStorage.removeItem('auth'); },
};
