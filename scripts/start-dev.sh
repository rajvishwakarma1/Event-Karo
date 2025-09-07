#!/usr/bin/env bash
set -euo pipefail

command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }

cp -n .env.example .env || true
cp -n .env.development .env.development || true

echo "Building and starting services..."
docker compose up -d --build

echo "Waiting for services to be healthy..."
for i in {1..30}; do
  if docker inspect --format='{{json .State.Health.Status}}' ek-backend 2>/dev/null | grep -q healthy; then
    echo "Backend is healthy"; break
  fi
  sleep 2
  echo -n "."
done

echo "Logs (tail):"
docker compose logs --tail=50 backend

echo "Done. API at http://localhost:5000"
