# Production Dockerfile for Migrion API
FROM node:20-alpine AS base

# Install wget for healthchecks
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

# Install dependencies
RUN npm ci --legacy-peer-deps --only=production && npm cache clean --force

# Development stage for building
FROM node:20-alpine AS builder

WORKDIR /app

# Install wget for healthchecks
RUN apk add --no-cache wget

# Copy package files
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

# Install all dependencies (including dev dependencies for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Production stage
FROM node:20-alpine AS production

# Install wget for healthchecks
RUN apk add --no-cache wget

WORKDIR /app

# Copy production dependencies from base stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Copy built application
COPY --from=builder /app/apps/api ./apps/api

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Set working directory to API
WORKDIR /app/apps/api

# Environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "src/server.js"]
