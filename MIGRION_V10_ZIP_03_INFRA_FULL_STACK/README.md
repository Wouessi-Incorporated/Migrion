# MIGRION™ Infra (V8)
Single docker-compose stack: Web + API + Directus CMS + Postgres + Redis + n8n + Adminer.

## Quick start
1) Copy env files:
   - 01_WEB/.env.example -> 01_WEB/.env
   - 02_API/.env.example -> 02_API/.env
2) docker compose up -d --build
3) URLs:
   - Web: http://localhost:3000
   - API: http://localhost:4000/health
   - CMS: http://localhost:8055
   - n8n: http://localhost:5678
   - Adminer: http://localhost:8080
