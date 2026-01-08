# MIGRION™ - Full Stack Turnkey Dockerfile
# Optimized for sequential startup and logic enforcement

# BUILD STAGE
FROM node:20-alpine AS build
WORKDIR /app

# Copy workspace configurations
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build Next.js Web App
WORKDIR /app/apps/web
ENV NEXT_PUBLIC_API_URL=http://localhost:4000
RUN npm run build

# PRODUCTION STAGE
FROM node:20-alpine
WORKDIR /app

# Install production tool for running concurrent processes
RUN npm install -g concurrently

# Copy production artifacts from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/package.json ./package.json

# Environment variables
ENV NODE_ENV=production
ENV PORT_API=4000
ENV PORT_WEB=3000

EXPOSE 3000 4000

# Start script: Runs API and Web simultaneously
CMD ["npm", "run", "start:prod"]
