# Planora

Planora is an end-to-end calendar monorepo with user calendar app + admin control panel.

## Stack
- Frontend: React + TypeScript + Vite + Tailwind + FullCalendar
- Backend: Node.js + TypeScript + Express
- Database: PostgreSQL + Prisma
- Auth: JWT access/refresh + bcrypt
- Validation: Zod
- Tests: Jest + Supertest (backend), Vitest (frontend)
- DevOps: Docker + docker-compose

## Date Guardrail
All date fields are validated in the allowed range:
- Min: `2000-01-01`
- Max: `2099-12-31`
Outside this range returns: `Date must be between 2000-01-01 and 2099-12-31.`

## Folder structure
- `apps/backend`: Express API, Prisma schema/migrations/seed, tests
- `apps/frontend`: Vite React user/admin UI, tests
- `docker-compose.yml`: DB + backend + frontend

## Setup (non-Docker)
```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
npm run prisma:generate -w @planora/backend
npm run prisma:migrate -w @planora/backend
npm run prisma:seed -w @planora/backend
npm run dev
```

## Setup (Docker)
```bash
docker compose up --build
```

## Production builds
```bash
npm run build
npm run start -w @planora/backend
npm run preview -w @planora/frontend
```

## Run tests
```bash
npm run test -w @planora/backend
npm run test -w @planora/frontend
```

## Seed users
- Admin: `admin@example.com` / `Admin@12345`
- User: `user@example.com` / `User@12345`

## Admin Control Panel
- Admin login route: `/admin/login`
- Admin routes (protected):
  - `/admin/dashboard`
  - `/admin/users`
  - `/admin/users/:id`
  - `/admin/events`
  - `/admin/audit-logs`
  - `/admin/settings`

### Default admin credentials
- Email: `admin@example.com`
- Password: `Admin@12345`


## API docs

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

### Events
- `GET /events?from=&to=&q=&category=&page=&limit=`
- `POST /events`
- `GET /events/:id`
- `PUT /events/:id`
- `DELETE /events/:id`

### Recurrence
- `POST /events/:id/recurrence`
- `GET /events/:id/occurrences?from=&to=`

### ICS
- `GET /events/export/ics?from=&to=`
- `POST /events/import/ics`

### Admin
- `POST /admin/login`
- `GET /admin/kpis`
- `GET /admin/users`
- `PATCH /admin/users/:id/ban`
- `PATCH /admin/users/:id/role`
- `POST /admin/users/:id/reset-password`
- `GET /admin/audit-logs`
- `GET /admin/events`
- `DELETE /admin/events/:id`
- `GET /admin/settings`
- `PATCH /admin/settings`
