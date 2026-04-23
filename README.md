# Planora

Full-stack calendar platform with a user app, admin control panel, recurrence support, and secure event management.

## Overview
Planora is a monorepo-based calendar application built for structured scheduling and administration. It combines a user-facing calendar experience with an admin dashboard for operational control, making it suitable for products that need event management, authentication, recurrence handling, audit visibility, and settings management.

The project is designed around clean separation between frontend and backend apps while sharing a single repository and a clear development workflow.

## Highlights
- Full-stack calendar application with dedicated admin panel
- Event CRUD with validation and date guardrails
- Recurring event support and occurrence generation
- ICS import/export support
- JWT-based authentication with refresh flow
- Audit logs and administrative controls
- Docker-ready local development setup

## Tech Stack
### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- FullCalendar
- Vitest

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod
- JWT authentication
- Jest + Supertest

## Monorepo Structure
```text
Planora/
├── apps/
│   ├── backend/   # Express API, Prisma schema, tests, auth, recurrence
│   └── frontend/  # React calendar UI and admin flows
├── docker-compose.yml
└── package.json
```

## Feature Set
### Calendar Experience
- Create, edit, view, and delete events
- Filter and search events
- Validate event ranges before saving
- Generate recurring event schedules

### Import / Export
- Export events to ICS
- Import ICS files with validation
- Guard against invalid file content and invalid time ranges

### Authentication & Security
- Register, login, logout, refresh token flow
- Forgot/reset password routes
- Backend environment validation on startup
- Structured request validation with Zod

### Admin Panel
- Admin login and protected routes
- User management and role control
- Audit logs
- Event moderation and platform settings

## Date Guardrail
All event dates are validated within this range:
- Minimum: `2000-01-01`
- Maximum: `2099-12-31`

Requests outside this window are rejected.

## Getting Started
### Prerequisites
- Node.js 18+
- npm
- PostgreSQL

### Local setup
```bash
git clone https://github.com/bhedanikhilkumar-code/Planora.git
cd Planora
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
npm run prisma:generate -w @planora/backend
npm run prisma:migrate -w @planora/backend
npm run prisma:seed -w @planora/backend
npm run dev
```

### Docker setup
```bash
docker compose up --build
```

## Build and Test
### Build
```bash
npm run build
```

### Run backend and frontend tests
```bash
npm run test -w @planora/backend
npm run test -w @planora/frontend
```

## Default Seed Accounts
- Admin: `admin@example.com` / `Admin@12345`
- User: `user@example.com` / `User@12345`

## Key API Areas
### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

### Events
- `GET /events`
- `POST /events`
- `GET /events/:id`
- `PUT /events/:id`
- `DELETE /events/:id`
- `POST /events/:id/recurrence`
- `GET /events/:id/occurrences`
- `GET /events/export/ics`
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

## Why This Project Matters
Planora demonstrates strong full-stack fundamentals: monorepo organization, backend validation, database-driven workflows, admin capabilities, recurring scheduling logic, and test coverage across both application layers.

## License
Licensed under the MIT License. See `LICENSE` for details.
