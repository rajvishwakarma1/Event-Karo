# Event Karo Frontend

Modern React + TypeScript app built with Vite and Tailwind CSS.

## Prerequisites
- Node.js 18+

## Setup
```sh
cd frontend
npm install
copy .env.example .env
```

## Scripts
- `npm run dev` — start dev server on http://localhost:3000 (proxy /api to http://localhost:5000)
- `npm run build` — type-check and build production bundle
- `npm run preview` — preview production build at http://localhost:3001
- `npm run lint` — run ESLint

## Environment
- `VITE_API_URL` — Backend API base (default http://localhost:5000/api)
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (optional; mock supported)

## Structure
- `src/components` — UI components (common, auth, events, dashboard)
- `src/contexts` — React context (Auth)
- `src/services` — API service (Axios with auth interceptors)
- `src/pages` — Routed pages
- `src/types` — TS types
- `src/utils` — helpers

## Notes
- Auth token is stored in localStorage and sent via Authorization header.
- Organizer routes are protected; use the Dashboard page to manage events.
