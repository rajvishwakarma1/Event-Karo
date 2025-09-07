# Event Karo Postman Collection

This directory contains a complete Postman collection and environments to explore and test the Event Karo API.

## Contents
- Event-Karo-API.postman_collection.json — Main collection
- Event-Karo-Development.postman_environment.json — Dev environment
- Event-Karo-Production.postman_environment.json — Prod environment
- test-data.json — Sample payloads and edge cases
- run-tests.js — Newman runner for CLI/CI

## Setup
1. Install Postman (app) or use the CLI via Newman.
2. Import the collection and an environment (Development recommended).
3. Start your backend server on http://localhost:5000.
4. In Postman, select the Development environment.

## Authentication Workflow
- Register an organizer and an attendee using the Authentication folder.
- Login with the attendee to set `authToken`, `userId`, and `userRole` into the environment.
- All protected requests use `Authorization: Bearer {{authToken}}` automatically via headers in saved requests.

## Variable Guide
- baseUrl: Root server URL (e.g., http://localhost:5000)
- apiUrl: API base path ({{baseUrl}}/api)
- authToken: Filled by login tests
- userId, userRole: Filled by login tests
- eventId, rsvpId: Captured when creating events/RSVPs

## Test Execution Order (Recommended)
1. Authentication → Register (Organizer)
2. Authentication → Register (Attendee)
3. Authentication → Login (Valid)
4. Events → POST /events (Create as organizer) — switch token to organizer if needed
5. Events → GET/PUT/DELETE flows
6. RSVPs → Create RSVP as attendee, then list/cancel
7. Attendees → Organizer-only endpoints

Tip: Use the Tests tab of each request to see assertions and environment variable updates.

## Troubleshooting
- 401 Unauthorized: Ensure `authToken` is set and valid for the required role.
- 403 Forbidden: You might be using an attendee token on organizer-only endpoints.
- 404 Not Found: Verify `eventId` / `rsvpId` exist.
- Validation errors: Check required fields and value ranges (date in future, seats > 0, etc.).

## Running via CLI (Newman)
Use the `run-tests.js` script or the npm scripts in the root `package.json` once installed. HTML and JSON reports will be generated in `./postman/reports`.
