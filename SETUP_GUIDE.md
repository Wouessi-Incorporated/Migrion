# MIGRION V13 - Quick Setup Guide

## ✅ Migration Status: COMPLETE

All code has been successfully replaced with the V13 updated version from the `@newupdate` folder.

## 📋 What Was Updated

### Files Replaced:
- ✅ `apps/api/` - Complete V13 API backend
- ✅ `apps/web/` - Complete V13 Next.js frontend  
- ✅ `apps/cms-config/` - Directus CMS configuration
- ✅ `apps/marketing-automation/` - n8n workflows
- ✅ `docker-compose.yml` - Updated infrastructure
- ✅ `package.json` - Updated to v13.0.0 with new scripts
- ✅ `start.ps1` - Updated startup script

### Dependencies:
- ✅ Root dependencies installed
- ✅ Workspace dependencies ready

## 🚀 How to Run the Application

### Option 1: Docker (Recommended for Production)

**Prerequisites:** Docker Desktop must be installed and running

```powershell
# Start all services with Docker
.\start.ps1

# OR manually:
docker compose up -d --build

# Initialize database (first time only)
docker compose exec api npx prisma migrate dev --name init
docker compose exec api npm run seed
```

**Access URLs:**
- Web: http://localhost:3000
- API: http://localhost:4000/health
- Directus CMS: http://localhost:8055
- n8n Automation: http://localhost:5678
- Adminer DB: http://localhost:8080

### Option 2: Local Development (Without Docker)

**Prerequisites:** 
- Node.js 20+ installed
- PostgreSQL 16 running locally (or use SQLite for testing)

#### Step 1: Configure Environment

Create `apps/api/.env`:
```env
PORT=4000
APP_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://migrion:migrion_pw@localhost:5432/migrion?schema=public
JWT_SECRET=change_me_strong_local_dev
ESCROW_WEBHOOK_SECRET=change_me_escrow_local
```

Create `apps/web/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CMS_URL=http://localhost:8055
NEXT_PUBLIC_SUPPORTED_LOCALES=en,fr,de
```

#### Step 2: Initialize Database

```powershell
# Navigate to API directory
cd apps/api

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npm run seed

# Return to root
cd ../..
```

#### Step 3: Start Development Servers

```powershell
# From root directory
npm run dev
```

This will start:
- API on http://localhost:4000
- Web on http://localhost:3000

## 🔧 Alternative: Using SQLite for Local Development

If you don't have PostgreSQL installed, you can use SQLite:

1. Edit `apps/api/prisma/schema.prisma`:
   ```prisma
   datasource db { 
     provider = "sqlite"  // Change from "postgresql"
     url = env("DATABASE_URL") 
   }
   ```

2. Update `apps/api/.env`:
   ```env
   DATABASE_URL=file:./dev.db
   ```

3. Run migrations:
   ```powershell
   cd apps/api
   npx prisma migrate dev --name init
   npm run seed
   cd ../..
   ```

4. Start dev servers:
   ```powershell
   npm run dev
   ```

## 📦 Available NPM Scripts

From the root directory:

```bash
npm run dev              # Start API and Web in development mode
npm run dev:api          # Start only API
npm run dev:web          # Start only Web
npm run build            # Build all workspaces
npm run start            # Start all workspaces in production mode
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run docker:logs      # View Docker logs
npm run prisma:migrate   # Run Prisma migrations (Docker)
npm run prisma:seed      # Seed database (Docker)
```

## 🗄️ Database Schema

The V13 database includes:
- **User** - Authentication and roles (candidate, employer, admin)
- **Candidate** - Migration candidates with 3-phase tracking
- **Employer** - Companies conducting interviews
- **Payment** - Phase payment records
- **Interview** - Interview scheduling and outcomes
- **EscrowMilestone** - Escrow milestone tracking
- **Referral** - Referral codes
- **Commission** - Referral commissions
- **AuditLog** - Complete audit trail
- **Destination** - Migration destinations
- **ContentPage** - CMS content pages

## 🔐 Default Credentials

**Directus CMS** (when using Docker):
- Email: `admin@migrion.local`
- Password: `ChangeMeNow123!`

## 🐛 Troubleshooting

### "Port already in use" Error
```powershell
npm run predev  # Kills processes on ports 3000 and 4000
```

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env files
- Or switch to SQLite (see above)

### Docker Not Found
- Install Docker Desktop
- Or use local development mode (Option 2)

### Prisma Client Not Generated
```powershell
cd apps/api
npx prisma generate
cd ../..
```

## 📚 API Documentation

- OpenAPI Spec: `apps/api/openapi.json`
- Postman Collection: `apps/api/postman_collection.json`
- API Health Check: http://localhost:4000/health

## 🎯 Next Steps

1. **Choose your deployment method** (Docker or Local)
2. **Configure environment variables** (.env files)
3. **Initialize the database** (migrations + seed)
4. **Start the application**
5. **Access the web interface** at http://localhost:3000

## 📖 Additional Documentation

- Full migration details: `MIGRATION_V13.md`
- API documentation: `apps/api/README.md`
- Web documentation: `apps/web/README.md`

---

**Version**: 13.0.0  
**Status**: ✅ Ready to Run  
**Last Updated**: 2026-01-08

## Current Status

The application code has been completely replaced with V13. To start using it:

1. **If you have Docker**: Run `.\start.ps1` or `docker compose up -d --build`
2. **If you don't have Docker**: Follow "Option 2: Local Development" above

The application is configured and ready to run once you choose your deployment method!
