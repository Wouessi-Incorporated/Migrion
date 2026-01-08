# Production Dockerfile for Migrion API
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations for workspace resolution
COPY package.json package-lock.json ./
# Copy API package logic
COPY apps/api/package.json ./apps/api/

# Install dependencies including Prisma
RUN npm install

# Copy source
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN npx prisma generate

# Final image
FROM node:20-alpine

WORKDIR /app

# Only copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api

WORKDIR /app/apps/api

ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

# Run using node directly for better performance/signal handling
CMD ["node", "src/server.js"]
