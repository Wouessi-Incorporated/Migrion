# Production Dockerfile for Migrion Web (Next.js)
FROM node:20-alpine AS base

# Install wget for healthchecks
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

# Install dependencies
RUN npm ci --legacy-peer-deps --only=production && npm cache clean --force

# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install wget for healthchecks
RUN apk add --no-cache wget

# Arguments for build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

# Install all dependencies (including dev dependencies for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY apps/web ./apps/web

# Build the Next.js app
WORKDIR /app/apps/web
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install wget for healthchecks
RUN apk add --no-cache wget

WORKDIR /app

# Copy production dependencies from base stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Copy Next.js standalone build
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Expose port
EXPOSE 3000

# Start the Next.js server
CMD ["node", "apps/web/server.js"]
