# Multi-stage Dockerfile for Event Karo backend

ARG NODE_VERSION=18-alpine

# 1) Base image
FROM node:${NODE_VERSION} AS base
WORKDIR /usr/src/app

# 2) Dependencies stage (install all deps for caching)
FROM base AS deps
RUN corepack enable
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# 3) Production dependencies only
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 4) Production image
FROM node:${NODE_VERSION} AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy production node_modules
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules

# Copy app source
COPY server.js ./
COPY src ./src
COPY package.json ./

# Add health check script
COPY scripts/health-check.js ./scripts/health-check.js

# Create non-root user (use the pre-existing node user)
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node ./scripts/health-check.js || exit 1

CMD ["node", "server.js"]
