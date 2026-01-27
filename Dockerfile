# MIGRION™ - Production Monolith Dockerfile
# Optimized for reliable Single-Container deployment (PaaS compatible)

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development

# 1. Install dependencies
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
# Force re-install dependencies for clean build
RUN npm ci

# 2. Copy source code
COPY . .

# 3. Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# 4. Build Web App (Standalone mode)
WORKDIR /app/apps/web
# Set default API URL for build time (Next.js needs this even if used client-side)
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build

# ==========================================
# Phase 2: Runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install Process Manager to run both services
RUN npm install -g concurrently

# 1. Copy necessary files (Selective Copying)
# We copy the root package.json for potential shared scripts, though standalone usually handles dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# 2. Copy Application Artifacts
# API (needs full source + modules because it's not bundled securely yet)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api

# Web (Standalone build is self-contained except for static assets)
# Note: Next.js standalone output structure is tricky. It puts everything under .next/standalone
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# 3. Environment Configuration
# API runs on 4000 internally
ENV PORT_API=4000
# Web runs on 3000 (or $PORT if provided by PaaS)
ENV PORT=3000

# 4. Internal Connectivity
# SSR can reach API via localhost
ENV INTERNAL_API_URL=http://localhost:4000
# Browser reaches API via /api proxy (handled by Next.js rewrites)
ENV NEXT_PUBLIC_API_URL=/api

# 5. Exposure
EXPOSE 3000 4000

# 6. Start Script
# Runs API on port 4000
# Runs Web on $PORT (defaults to 3000)
# 'concurrently' streams logs from both
CMD concurrently --names "API,WEB" -c "blue,magenta" \
    "PORT=4000 node apps/api/src/server.js" \
    "PORT=$PORT node apps/web/server.js"
