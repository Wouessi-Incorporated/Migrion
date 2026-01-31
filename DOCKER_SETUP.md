# Docker Setup Guide for Migrion

This guide explains how to run Migrion with a **frontend-first** approach where the web interface starts immediately and other services run in the background.

## 🚀 Quick Start

### Prerequisites

- Docker Desktop 4.0+ installed and running
- Docker Compose V2 (comes with Docker Desktop)
- At least 4GB of available RAM
- Ports 3000, 4000, 5432, 6379, 8055, 5678, 8080 available

### Quick Start Options

#### Option 1: Frontend-First Mode (Recommended for Production)

**Windows (PowerShell):**
```powershell
.\start-frontend-first.ps1
```

**Linux/macOS (Bash):**
```bash
chmod +x start-frontend-first.sh
./start-frontend-first.sh
```

**Manual Docker Compose:**
```bash
docker compose -f docker-start-frontend-first.yml up
```

#### Option 2: Development Mode (Bypasses Build Issues)

If you're experiencing Next.js build errors, use development mode:

**Windows (PowerShell):**
```powershell
.\start-dev-mode.ps1
```

**Linux/macOS (Bash):**
```bash
chmod +x start-dev-mode.sh
./start-dev-mode.sh
```

**Manual Docker Compose:**
```bash
docker compose -f docker-compose.dev.yml up
```

## 📋 Service Overview

| Service | URL | Description | Priority |
|---------|-----|-------------|----------|
| **Frontend** | http://localhost:3000 | Next.js web app (PRIMARY) | 1 |
| **API** | http://localhost:4000 | Express.js backend | 2 |
| **PostgreSQL** | localhost:5432 | Main database | 2 |
| **Redis** | localhost:6379 | Cache & sessions | 2 |
| **Directus** | http://localhost:8055 | CMS interface | 3 |
| **n8n** | http://localhost:5678 | Workflow automation | 3 |
| **Adminer** | http://localhost:8080 | Database admin | 4 |

## 🔧 Configuration

### Environment Variables

Create these files if they don't exist:

**For Production (.env):**
```env
# Database
DATABASE_URL=postgresql://migrion:migrion_pw@postgres:5432/migrion?schema=public
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
DIRECTUS_KEY=directus-key-change-this
DIRECTUS_SECRET=directus-secret-change-this

# API Configuration
CORS_ORIGIN=http://localhost:3000
API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000

# Admin Credentials
DIRECTUS_ADMIN_EMAIL=admin@migrion.local
DIRECTUS_ADMIN_PASSWORD=ChangeMeNow123!

# Other
TIMEZONE=UTC
NODE_ENV=production
```

### Default Credentials

**Database:**
- Host: localhost:5432
- Database: migrion
- Username: migrion
- Password: migrion_pw

**Directus CMS:**
- URL: http://localhost:8055
- Email: admin@migrion.local
- Password: ChangeMeNow123!

## 🏗️ Architecture

### Frontend-First Approach

1. **Web (Next.js)** starts immediately - doesn't wait for backend
2. **Databases** (PostgreSQL, Redis) start in parallel
3. **API** starts after databases are healthy
4. **Supporting services** start in background

### Benefits

- ✅ Faster startup time
- ✅ Frontend loads even if backend is starting
- ✅ Better user experience
- ✅ Graceful error handling
- ✅ Independent service scaling

## 📖 Usage Examples

### Development Workflow

#### Production Mode
**Start everything:**
```bash
./start-frontend-first.sh
```

**Rebuild and start:**
```powershell
.\start-frontend-first.ps1 -Build
```

**Clean start (removes volumes):**
```powershell
.\start-frontend-first.ps1 -Clean
```

#### Development Mode (For Build Issues)
**Start development mode:**
```bash
./start-dev-mode.sh
```

**Development with rebuild:**
```powershell
.\start-dev-mode.ps1 -Rebuild
```

**Clean development start:**
```powershell
.\start-dev-mode.ps1 -Clean
```

**View logs:**
```bash
docker compose -f docker-start-frontend-first.yml logs -f
```

**Stop all services:**
```bash
docker compose -f docker-start-frontend-first.yml down
```

### Database Operations

**Run migrations:**
```bash
docker compose -f docker-start-frontend-first.yml exec api npx prisma migrate deploy
```

**Seed database:**
```bash
docker compose -f docker-start-frontend-first.yml exec api npm run seed
```

**Database backup:**
```bash
docker compose -f docker-start-frontend-first.yml exec postgres pg_dump -U migrion migrion > backup.sql
```

**Database restore:**
```bash
docker compose -f docker-start-frontend-first.yml exec -T postgres psql -U migrion migrion < backup.sql
```

## 🔍 Troubleshooting

## 🛠️ Development Mode

### When to Use Development Mode

Use development mode if you encounter:
- Next.js build errors (`TypeError: Cannot read properties of null (reading 'useContext')`)
- HTML import errors (`<Html> should not be imported outside of pages/_document`)
- Security vulnerabilities in Next.js versions
- Any build-time failures

### Development Mode Features

- ✅ Bypasses Next.js build process
- ✅ Simple fallback frontend
- ✅ Fast Docker testing
- ✅ All services in development mode
- ✅ No hot reload (static serving)
- ✅ Suitable for infrastructure testing

### Development Mode Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend (Dev)** | http://localhost:3000 | Simple fallback interface |
| **API** | http://localhost:4000 | Full backend functionality |
| **All other services** | Same ports | Full functionality |

## 🔍 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill processes on specific ports
npx kill-port 3000 4000 5432 6379

# Or find and kill manually
lsof -ti:3000 | xargs kill -9
```

**2. Docker Not Running**
```bash
# Check Docker status
docker info

# Start Docker Desktop or Docker daemon
sudo systemctl start docker  # Linux
open -a Docker               # macOS
```

**3. Out of Memory**
```bash
# Clean up Docker
docker system prune -a --volumes

# Check Docker resources
docker stats
```

**4. Database Connection Issues**
```bash
# Check PostgreSQL health
docker compose -f docker-start-frontend-first.yml exec postgres pg_isready -U migrion

# Reset database
docker compose -f docker-start-frontend-first.yml down -v
docker volume rm migrion_migrion_pg_data
```

**5. Web Service Build Failures**

*If you encounter Next.js build errors, switch to development mode:*

```bash
# Use development mode instead
./start-dev-mode.sh

# Or manually with Docker Compose
docker compose -f docker-compose.dev.yml up
```

*For production troubleshooting:*
```bash
# Clear build cache
docker builder prune -a

# Rebuild specific service
docker compose -f docker-start-frontend-first.yml build --no-cache web
```

**6. React Context or HTML Import Errors**

*These are common Next.js SSR issues. Use development mode:*

```bash
# Switch to development mode
./start-dev-mode.sh

# The development version bypasses these build-time errors
```

### Health Checks

**API Health:**
```bash
curl http://localhost:4000/health
# Expected: {"ok":true,"service":"migrion-api-v13"}
```

**Web Health:**
```bash
curl http://localhost:3000
# Expected: Next.js page content
```

**Database Health:**
```bash
docker compose -f docker-start-frontend-first.yml exec postgres pg_isready -U migrion
# Expected: "postgres:5432 - accepting connections"
```

### Service-Specific Issues

**Next.js Issues:**
- Check `next.config.mjs` for correct API rewrites
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Look for build errors in container logs

**API Issues:**
- Check database connection string
- Verify Prisma schema generation
- Check for missing environment variables

**Database Issues:**
- Ensure proper volume permissions
- Check available disk space
- Verify connection parameters

## 📊 Monitoring

### View Real-time Logs
```bash
# All services
docker compose -f docker-start-frontend-first.yml logs -f

# Specific service
docker compose -f docker-start-frontend-first.yml logs -f web

# Last 100 lines
docker compose -f docker-start-frontend-first.yml logs --tail=100 api
```

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df

# Service health
docker compose -f docker-start-frontend-first.yml ps
```

## 🚀 Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/TLS
- [ ] Set up proper logging
- [ ] Configure resource limits
- [ ] Set up monitoring/alerts

### Performance Optimizations

- [ ] Enable Redis for caching
- [ ] Configure PostgreSQL connection pooling
- [ ] Set up CDN for static assets
- [ ] Enable compression
- [ ] Configure rate limiting

### Scaling

**Horizontal scaling:**
```yaml
services:
  web:
    deploy:
      replicas: 3
  api:
    deploy:
      replicas: 2
```

**Resource limits:**
```yaml
services:
  web:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## 🔗 Integration

### External Services

**Redis Configuration:**
```yaml
redis:
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

**PostgreSQL Tuning:**
```yaml
postgres:
  environment:
    POSTGRES_SHARED_PRELOAD_LIBRARIES: "pg_stat_statements"
```

### Development Tools

**VS Code Integration:**
1. Install Docker extension
2. Use Remote-Containers for development
3. Configure debugger attachment

## 📞 Support

### Getting Help

1. Check service logs: `docker compose logs [service]`
2. Verify health endpoints
3. Check network connectivity
4. Review environment variables
5. Consult Docker documentation

### Common Commands Reference

#### Production Mode Commands
```bash
# Start services
docker compose -f docker-start-frontend-first.yml up -d

# Stop services
docker compose -f docker-start-frontend-first.yml down

# Restart specific service
docker compose -f docker-start-frontend-first.yml restart api

# Execute command in container
docker compose -f docker-start-frontend-first.yml exec api sh

# View service configuration
docker compose -f docker-start-frontend-first.yml config

# Pull latest images
docker compose -f docker-start-frontend-first.yml pull
```

#### Development Mode Commands
```bash
# Start development services
docker compose -f docker-compose.dev.yml up -d

# Stop development services
docker compose -f docker-compose.dev.yml down

# Rebuild development services
docker compose -f docker-compose.dev.yml up -d --build

# View development logs
docker compose -f docker-compose.dev.yml logs -f

# Execute command in development container
docker compose -f docker-compose.dev.yml exec api sh
```

---

**Last Updated:** 2024-01-20
**Version:** 13.0.0
**Maintainer:** Migrion Development Team