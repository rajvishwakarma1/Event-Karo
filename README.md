# Event Karo Backend

Event Karo is a modern event management platform backend built with Node.js, Express, and MongoDB. It provides robust APIs for authentication, events, RSVPs, and attendee management with JWT-based security and validation.

## Features
- RESTful API (Express.js) with validation and error handling
- MongoDB (Mongoose) models and data access
- JWT auth with role-based access (organizer/attendee)
- Search, filter, sort, and pagination on events
- RSVP flow with Stripe payment placeholder
- Security best practices (Helmet, CORS)

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or cloud)

### Installation
1. Clone and install
    - git clone https://github.com/yourusername/event-karo.git
    - cd event-karo
    - npm install
2. Configure env
    - Copy `.env.example` to `.env` and fill values
3. Run
    - Dev: npm run dev
    - Prod: npm start

## Project Structure
```
├── server.js
├── src/
│   ├── app.js
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── .dockerignore
├── .env.example
├── .env.development
├── DEPLOYMENT.md
├── scripts/
│   ├── start-dev.sh
│   ├── deploy-prod.sh
│   └── health-check.js
├── postman/
│   ├── Event-Karo-API.postman_collection.json
│   ├── Event-Karo-Development.postman_environment.json
│   ├── Event-Karo-Production.postman_environment.json
│   ├── test-data.json
│   ├── run-tests.js
│   └── README.md
├── .env.example
├── package.json
└── README.md
```

## Docker Deployment (Quick Start)
Local development with Docker and Compose:

1) Copy envs
- cp .env.example .env
- cp .env.example .env.development (or use the provided one)

2) Start stack
- docker compose up -d --build

3) Verify health
- curl http://localhost:5000/api/health

4) View logs
- docker compose logs -f backend

See detailed steps in [DEPLOYMENT.md](DEPLOYMENT.md).

## API Overview
- Base URL: http://localhost:5000
- API Base: http://localhost:5000/api
- Auth: Bearer JWT via `Authorization: Bearer <token>`

### Authentication Endpoints (/api/auth)
- POST /register — Create user (organizer or attendee)
   - Body: { name, email, password, role }
   - 201: { token, user }
- POST /login — Authenticate user
   - Body: { email, password }
   - 200: { token, user }
- POST /logout — Invalidate token (if supported)

Examples

Request: POST /api/auth/register

{
    "name": "Ava Attendee",
    "email": "ava@example.com",
    "password": "Password123!",
    "role": "attendee"
}

Response 201

{
    "token": "<jwt>",
    "user": { "_id": "...", "name": "Ava Attendee", "email": "ava@example.com", "role": "attendee" }
}

Request: POST /api/auth/login

{
    "email": "ava@example.com",
    "password": "Password123!"
}

Response 200

{
    "token": "<jwt>",
    "user": { "_id": "...", "name": "Ava Attendee", "email": "ava@example.com", "role": "attendee" }
}

### Event Endpoints (/api/events)
- GET / — List events with filters
   - Query: search, category, location, dateStart, dateEnd, priceMin, priceMax, sort, page, limit
- GET /my-events — Organizer's events (auth: organizer)
- GET /:id — Event details
- POST / — Create event (auth: organizer)
- PUT /:id — Update event (auth: owner)
- DELETE /:id — Delete event (auth: owner)

Query Parameters

| Name       | Type   | Description                                    |
|------------|--------|------------------------------------------------|
| search     | string | Text search on title/description/tags          |
| category   | string | conference | workshop | social | sports         |
| location   | string | City or location text                          |
| dateStart  | ISO    | Filter events after this date                  |
| dateEnd    | ISO    | Filter events before this date                 |
| priceMin   | number | Minimum ticket price                           |
| priceMax   | number | Maximum ticket price                           |
| sort       | string | date | -date | price | -price | createdAt      |
| page       | number | Page number (default 1)                        |
| limit      | number | Page size (default 10)                         |

Examples

Request: GET /api/events?search=tech&category=conference&page=1&limit=10

Response 200

{
    "data": [
        {
            "_id": "...",
            "title": "Tech Conference SF",
            "description": "A premier software conference.",
            "date": "2025-10-01T10:00:00.000Z",
            "location": "San Francisco, CA",
            "seats": 200,
            "price": 199.99,
            "category": "conference",
            "tags": ["tech","conference"],
            "organizer": { "_id": "...", "name": "Olivia Organizer" }
        }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
}

Request: POST /api/events (organizer)

{
    "title": "React Workshop",
    "description": "Hands-on workshop.",
    "date": "2025-10-15T15:00:00.000Z",
    "location": "New York, NY",
    "seats": 40,
    "price": 49,
    "category": "workshop",
    "tags": ["react","frontend"]
}

Response 201: Created event document.

### RSVP Endpoints (/api/rsvp)
- POST / — Create RSVP (auth: attendee)
- GET /my-rsvps — User RSVPs (auth)
- PUT /:id/cancel — Cancel RSVP (auth)
- GET /event/:eventId — RSVPs for event (auth: organizer)
- DELETE /:id — Remove RSVP (auth: organizer)

Examples

Request: POST /api/rsvp

{
    "eventId": "<eventId>",
    "quantity": 2,
    "notes": "Looking forward!"
}

Response 201

{
    "_id": "<rsvpId>",
    "eventId": "<eventId>",
    "userId": "<userId>",
    "quantity": 2,
    "status": "pending",
    "payment": { "clientSecret": "..." }
}

Request: PUT /api/rsvp/:id/cancel → 200

### Attendee Endpoints (/api/attendees)
- GET /events/:eventId/attendees — List attendees (auth: organizer)
- GET /events/:eventId/attendees/stats — Attendee stats (auth: organizer)
- PUT /events/:eventId/attendees/:rsvpId/status — Update RSVP status (auth: organizer)
- GET /events/:eventId/attendees/export — CSV export (auth: organizer)

Examples

Response: GET /api/attendees/events/:eventId/attendees

[
    { "rsvpId": "...", "user": { "_id": "...", "name": "Ava Attendee" }, "quantity": 2, "status": "confirmed" }
]

## Error Handling
- Common codes: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server)
- Error shape: { message, errors? }

Example

{
    "message": "Validation error",
    "errors": [
        { "field": "email", "message": "Invalid email address" }
    ]
}

## Rate Limiting & Versioning
- If rate limiting is enabled, respect `Retry-After` headers.
- Current version: v1 under `/api`. Future versions will be `/api/v2`, etc.

## Postman Collection
Import the collection and environments from the `postman/` folder:
- Collection: [postman/Event-Karo-API.postman_collection.json](postman/Event-Karo-API.postman_collection.json)
- Environments: [Development](postman/Event-Karo-Development.postman_environment.json) | [Production](postman/Event-Karo-Production.postman_environment.json)

CLI runs with Newman are available via npm scripts (see below). Reports are output to `postman/reports`.

## Production Deployment
You can deploy on Vercel (serverless) or Docker (self-hosted).

### Vercel (Serverless)
This repo includes a Vercel setup for the API under `api/[[...slug]].js` and `vercel.json`.

Backend (API):
- Set environment variables in Vercel Project Settings → Environment Variables:
    - `MONGODB_URI`
    - `JWT_SECRET`
    - `NODE_ENV=production`
    - Any others you use (Stripe, etc.)
- Push the repo to GitHub and import it into Vercel, or run `vercel` from the repo root.
- The API will be available under `/api/*`.

Frontend:
- Deploy `frontend/` as a separate Vercel project (static build):
    - Build command: `npm run build`
    - Output directory: `frontend/dist`
    - Set `VITE_API_URL` env to the API URL of the backend project (e.g., `https://<backend>.vercel.app/api`).

### Docker (Self-hosted)
Use the production compose file with your hardened `.env`:

- docker compose -f docker-compose.prod.yml up -d --build

Consider placing a reverse proxy (Nginx/Traefik) in front for TLS termination and rate limiting.

## Monitoring & Health Checks
- The container healthcheck hits `/api/health` and verifies DB connectivity via a script.
- Adjust the script at `scripts/health-check.js` to fit your environment.

## Security Considerations
- Use strong, rotated secrets.
- Lock down MongoDB to internal networks.
- Set proper CORS in production.
- Keep images up to date and scan for vulnerabilities.

## Scripts
- npm run dev — start in watch mode
- npm start — start server
- npm run test — run unit tests (if configured)
- npm run test:api — run Postman collection (dev env)
- npm run test:api:dev — same as above
- npm run test:api:prod — run Postman collection (prod env)
- npm run test:api:report — run with HTML/JSON reports

## Environment Variables
See `.env.example` for required variables (MongoDB URI, JWT secret, Stripe keys, etc.).

## Contributing
PRs welcome. Please include tests where possible.

## License
MIT
