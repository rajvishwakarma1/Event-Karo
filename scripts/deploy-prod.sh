#!/usr/bin/env bash
set -euo pipefail

command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }

if [ ! -f .env ]; then
  echo ".env not found. Copy from .env.example and set production values."
  exit 1
fi

echo "Building images..."
docker compose -f docker-compose.prod.yml build

echo "Starting production stack..."
docker compose -f docker-compose.prod.yml up -d

echo "Checking health..."
sleep 5
docker ps

echo "Deployment complete. API at http://<server>:5000"
