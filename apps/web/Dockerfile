# Production Dockerfile for Migrion Web (Next.js)
FROM node:20-alpine AS builder

WORKDIR /app

# Arguments for build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy root configurations
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm install

# Copy source
COPY apps/web ./apps/web
COPY apps/web/src/lib/api.ts ./apps/web/src/lib/api.ts

# Build the app
WORKDIR /app/apps/web
RUN npm run build

# Final image
FROM node:20-alpine

WORKDIR /app

# Copy standalone build
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run standalone server
CMD ["node", "apps/web/server.js"]
