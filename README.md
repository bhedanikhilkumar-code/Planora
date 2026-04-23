# Planora

<p align="left">
  <a href="https://github.com/bhedanikhilkumar-code/Planora"><img src="https://img.shields.io/badge/Repo-GitHub-111827?style=for-the-badge&logo=github&logoColor=white" alt="Repo" /></a>
  <img src="https://img.shields.io/badge/Architecture-Monorepo-0F172A?style=for-the-badge" alt="Monorepo" />
  <img src="https://img.shields.io/badge/Dev%20Setup-Docker%20Ready-0A66C2?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Ready" />
</p>

Full-stack calendar and admin platform with recurrence, ICS import/export, authentication, and PostgreSQL-backed event workflows.

## What This Project Solves
Many scheduling products need more than a calendar UI. They also need structured event creation, recurring schedules, import/export workflows, admin visibility, authentication, and data validation.

Planora is designed around that full workflow, combining a user-facing calendar experience with backend logic and admin controls inside one monorepo.

## Key Capabilities
- Event CRUD with validation and date guardrails
- Recurring event support and occurrence generation
- ICS import / export workflows
- JWT authentication with refresh flow
- Admin controls, moderation, and audit visibility
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

## Feature Areas
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
- Register, login, logout, and refresh token flow
- Forgot / reset password routes
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

## Why This Project Stands Out
Planora demonstrates strong full-stack fundamentals: monorepo organization, backend validation, recurring scheduling logic, authentication flows, admin capabilities, and test coverage across both application layers.

## Demo Status
This repository currently documents a strong local development setup, but does not expose a public live demo link yet.

## License
Licensed under the MIT License. See `LICENSE` for details.
