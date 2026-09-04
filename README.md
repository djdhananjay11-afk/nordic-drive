# NordicDrive

Production-grade automotive comparison platform for Norway.

## Phase 1 Includes

- Turborepo monorepo
- Next.js 15 frontend with TypeScript, Tailwind, ShadCN-compatible setup, Auth.js boilerplate
- NestJS backend with TypeScript, validation, health endpoint, JWT strategy, RBAC primitives
- PostgreSQL and Prisma schema with initial migration
- Shared types package
- Shared ESLint and TypeScript config packages
- Docker Compose for local PostgreSQL and API
- CI workflow for lint, typecheck, migrations, and builds

## Structure

```text
apps/
  web/                 Next.js frontend
  api/                 NestJS backend
packages/
  database/            Prisma schema, migrations, seed, Prisma client export
  types/               Shared TypeScript contracts
  config/
    eslint/            Shared ESLint flat configs
    typescript/        Shared TS configs
docs/
  architecture.md
```

## Requirements

- Node.js 20+
- pnpm 9+
- Docker Desktop

## Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm db:generate
pnpm db:migrate
pnpm --filter @nordicdrive/database seed
pnpm dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:4000/api/v1/health`

## Environment

Copy the root `.env.example` into `.env`. App-specific examples also exist:

```text
apps/web/.env.example
apps/api/.env.example
```

For Auth.js GitHub login, configure:

```text
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
AUTH_SECRET
AUTH_URL
```

## Database

Prisma schema lives at:

```text
packages/database/prisma/schema.prisma
```

Useful commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm --filter @nordicdrive/database prisma:deploy
pnpm db:studio
```

## API

Current Phase 1 API endpoints:

```text
GET /api/v1/health
GET /api/v1/cars
GET /api/v1/cars/:brandSlug/:modelSlug
```

Responses are wrapped as:

```json
{
  "data": {},
  "meta": {
    "requestId": "optional"
  }
}
```

## Engineering Standards

- TypeScript everywhere
- Strict compiler settings
- Clean module boundaries
- Prisma for all database access
- DTO validation for API input
- Backend RBAC enforced through guards
- Public frontend optimized for SEO and low JavaScript
- 3D and AI to be introduced as progressive feature modules in later phases

## Deployment Direction

- Web: Vercel
- API: containerized service on Fly.io, Render, Railway, or similar
- Database: Supabase PostgreSQL
- Storage: Supabase Storage or equivalent CDN-backed object storage
- Monitoring: Sentry plus structured logs

Full production deployment, caching, monitoring, CI/CD, Docker, and security guidance:

```text
docs/production-deployment.md
```
