# Pickelton Partner Backend

Standalone JavaScript API for the Pickelton partner portal. It owns partner accounts,
courts, customers, bookings, dashboard metrics, reports, profile data, and settings.
It is intentionally separate from the Java player/tournament backend and can be
deployed independently.

## Stack

- Node.js 22 with native ES modules
- Express 5
- PostgreSQL 16
- `pg` SQL client
- JWT and bcrypt authentication
- Zod request/environment validation
- Helmet, CORS, rate limiting, Pino logging

## Local setup

```powershell
Copy-Item .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

The API runs at `http://localhost:8090`. The seeded login is:

```text
partner@pickelton.local
Partner123!
```

The seed credentials are development-only.

## Docker

```powershell
docker compose up --build
docker compose exec api node scripts/seed.js
```

## API routes

```text
GET    /health
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me
GET    /api/v1/dashboard
GET    /api/v1/courts
POST   /api/v1/courts
GET    /api/v1/courts/:id
PATCH  /api/v1/courts/:id
DELETE /api/v1/courts/:id
GET    /api/v1/bookings
POST   /api/v1/bookings
GET    /api/v1/bookings/:id
PATCH  /api/v1/bookings/:id/status
GET    /api/v1/customers
GET    /api/v1/customers/:id
GET    /api/v1/reports/summary
GET    /api/v1/profile
PATCH  /api/v1/profile
GET    /api/v1/settings
PUT    /api/v1/settings
```

All routes except health, register, and login require `Authorization: Bearer <token>`.

## Deployment

1. Provision a separate PostgreSQL database.
2. Set every environment variable from `.env.example`.
3. Run `npm run migrate` as the release command.
4. Start with `npm start`.
5. Configure the platform health check as `/health`.
6. Set the partner frontend API URL to this service's public URL.

Never run `npm run seed` in production.
