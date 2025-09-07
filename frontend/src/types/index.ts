export type Role = 'organizer' | 'attendee';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  seats: number;
  availableSeats: number;
  price: number;
  organizer: User;
  isActive: boolean;
  category?: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RSVP {
  _id: string;
  user: User;
  event: Event;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  ticketQuantity: number;
  totalAmount: number;
  rsvpDate: string;
  notes?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse extends LoginResponse {}

export interface EventsResponse {
  data: Event[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RSVPResponse {
  rsvp: RSVP;
  payment?: { id: string; clientSecret?: string; status: string; mock?: boolean };
}

export interface LoginForm { email: string; password: string }
export interface RegisterForm { name: string; email: string; password: string; role?: Role }
export interface EventForm { title: string; description: string; date: string; location: string; seats: number; price?: number; category?: string; tags?: string[] }
export interface RSVPForm { eventId: string; quantity?: number; notes?: string }

// zod schemas could live alongside forms; kept here as hints
// import { z } from 'zod';
// export const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
// export const RegisterSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), role: z.enum(['organizer', 'attendee']).optional() });
