FROM node:20-alpine

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Web App (Next.js)
RUN npm run build --workspace=migrion-web

# Expose ports for both services
EXPOSE 3000 4000

ENV NODE_ENV=production

# Start both services using the production script
CMD ["npm", "run", "start:prod"]
