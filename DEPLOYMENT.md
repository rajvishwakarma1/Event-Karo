# Event Karo — Docker Deployment Guide

This guide explains how to run the Event Karo backend with Docker for development and production.

## Prerequisites
- Docker Desktop (Windows/macOS) or Docker Engine (Linux)
- Docker Compose v2

## Quick Start (Development)
1. Copy environment files
   - cp .env.example .env
   - cp .env.example .env.development (or use the provided .env.development)
2. Start services
   - docker compose up -d
3. Verify
   - curl http://localhost:5000/api/health
4. Logs
   - docker compose logs -f backend

## Services
- mongo: MongoDB 7 with a persistent volume (mongo-data)
- backend: Node.js API server on port 5000

## Environment Variables
- See `.env.example` for a complete list and descriptions.
- Development compose overrides DB credentials via MONGO_INITDB_ROOT_* and MONGODB_URI.

## Production Deployment
1. Prepare your .env with production values:
   - Strong JWT_SECRET, real SMTP, Stripe keys, etc.
2. Launch with production compose
   - docker compose -f docker-compose.prod.yml up -d --build
3. Reverse proxy (optional)
   - Place Nginx/Traefik in front for SSL termination and virtual hosts.

## Health Checks
- The backend container exposes a health check that pings /api/health and DB connectivity.
- Compose uses service_healthy on mongo to ensure backend starts after DB is ready.

## Backups
- Mount `mongo-data` to a reliable disk and snapshot regularly.
- Use `mongodump` for scheduled backups.

## Monitoring & Logging
- Forward container logs to your log aggregator (ELK, Loki, etc.).
- Configure LOG_LEVEL via env.

## Security Tips
- Use strong secrets and rotate regularly.
- Restrict database access to internal networks.
- Keep images updated with `docker compose pull`.
- Run as non-root (the image uses the node user).

## Troubleshooting
- Backend cannot connect to DB: ensure MONGODB_URI points to `mongo` service and includes authSource=admin when using root user.
- Port conflicts: change host ports in compose files.
- Slow startup: check compose logs for mongo initialization.

