# MIGRION™ V13 – Full Stack (Docker)
1) Copy env files:
   - cp ../01_API/.env.example ../01_API/.env
   - cp ../02_WEB/.env.example ../02_WEB/.env
2) docker compose up -d --build
3) Init DB:
   - docker compose exec api npx prisma migrate dev --name init
   - docker compose exec api npm run seed
4) URLs:
   - Web: http://localhost:3000
   - API: http://localhost:4000/health
   - Directus: http://localhost:8055
   - n8n: http://localhost:5678
   - Adminer: http://localhost:8080
