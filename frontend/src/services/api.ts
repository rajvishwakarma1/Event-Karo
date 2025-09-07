import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { LoginResponse, RegisterResponse, EventsResponse, Event, RSVP, RSVPResponse } from '../types';

// Resolve API base: prefer VITE_API_URL; otherwise use the Vite dev proxy path '/api'
// This avoids hard-coding http://localhost:5000 and works in both dev (proxy) and prod (same-origin reverse proxy).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const V: any = (import.meta as any)?.env || {};
const apiBase: string = V.VITE_API_URL || '/api';
if (V?.PROD && apiBase === '/api') {
  // In production, '/api' only works if frontend and backend share the same domain (reverse proxy).
  // Otherwise you must set VITE_API_URL to your backend URL.
  // eslint-disable-next-line no-console
  console.warn('[Event Karo] VITE_API_URL is not set; using relative /api which will 404 if API is on a different domain.');
}

const instance = axios.create({ baseURL: apiBase });

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = localStorage.getItem('auth');
  if (auth) {
    const { token } = JSON.parse(auth);
    if (token) {
  config.headers = config.headers || {} as any;
  (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    const err = error as any;
    if (err?.response?.status === 401) {
      localStorage.removeItem('auth');
      // Optionally redirect to login
    }
    return Promise.reject(err);
  }
);

const auth = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await instance.post('/auth/login', { email, password });
    return data;
  },
  register: async (userData: { name: string; email: string; password: string; role?: 'organizer' | 'attendee' }): Promise<RegisterResponse> => {
    const { data } = await instance.post('/auth/register', userData);
    return data;
  },
  logout: async () => {
    await instance.post('/auth/logout');
    localStorage.removeItem('auth');
  },
};

const events = {
  getAll: async (params?: Record<string, string | number | undefined>): Promise<EventsResponse> => {
    // Public endpoint - create request without automatic auth headers for attendees
    const { data } = await axios.get(`${apiBase}/events`, { params });
    return data;
  },
  getById: async (id: string): Promise<Event> => {
    // Public endpoint - create request without automatic auth headers
    const { data } = await axios.get(`${apiBase}/events/${id}`);
    return data;
  },
  create: async (eventData: Partial<Event>): Promise<Event> => {
    const { data } = await instance.post('/events', eventData);
    return data;
  },
  update: async (id: string, eventData: Partial<Event>): Promise<Event> => {
    const { data } = await instance.put(`/events/${id}`, eventData);
    return data;
  },
  uploadPoster: async (id: string, file: File): Promise<{ imageUrl: string; event: Event }> => {
    const form = new FormData();
    form.append('poster', file);
    const { data } = await instance.post(`/events/${id}/poster`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await instance.delete(`/events/${id}`);
    return data;
  },
  getMyEvents: async (): Promise<EventsResponse> => {
    const { data } = await instance.get('/events/my-events');
    return data;
  },
};

const rsvp = {
  create: async (eventId: string, data: { quantity?: number; notes?: string }): Promise<RSVPResponse> => {
    const { data: resp } = await instance.post('/rsvp', { eventId, ...data });
    return resp;
  },
  getMyRSVPs: async (): Promise<RSVP[]> => {
    const { data } = await instance.get('/rsvp/my-rsvps');
    return data;
  },
  cancel: async (rsvpId: string): Promise<{ message: string; rsvp: RSVP }> => {
    const { data } = await instance.put(`/rsvp/${rsvpId}/cancel`);
    return data;
  },
};

const attendees = {
  getOrganizerStats: async () => {
    const { data } = await instance.get('/attendees/organizer/stats');
    return data as { totalEvents: number; totalRsvps: number; confirmed: number; pending: number; cancelled: number; revenue: number };
  },
  getEventAttendees: async (eventId: string) => {
    const { data } = await instance.get(`/attendees/events/${eventId}/attendees`);
    return data;
  },
  getStats: async (eventId: string) => {
    const { data } = await instance.get(`/attendees/events/${eventId}/attendees/stats`);
    return data;
  },
  updateStatus: async (eventId: string, rsvpId: string, status: string) => {
    const { data } = await instance.put(`/attendees/events/${eventId}/attendees/${rsvpId}/status`, { status });
    return data;
  },
};

export default { auth, events, rsvp, attendees };
