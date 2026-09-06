# NordicDrive

Production-grade automotive comparison platform for Norway.

## Phase 1 Includes

- Turborepo monorepo
- Next.js 15 frontend with TypeScript, Tailwind, ShadCN-compatible setup, Auth.js boilerplate
- NestJS backend with TypeScript, validation, health endpoint, JWT strategy, RBAC primitives
- PostgreSQL and Prisma schema with initial migration
- Shared types package
- Shared ESLint and TypeScript config packages
- Vercel-first frontend deployment
- Supabase PostgreSQL connection setup
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
- Supabase PostgreSQL project

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:generate
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

For Supabase PostgreSQL, configure both database URLs:

```text
DATABASE_URL
DIRECT_URL
```

Use the Supabase pooled connection string for `DATABASE_URL` and the direct database connection
string for `DIRECT_URL`. Prisma uses `DIRECT_URL` for migrations.

## Database

Prisma schema lives at:

```text
packages/database/prisma/schema.prisma
```

Useful commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:deploy
pnpm db:seed
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
- API: optional separate service later, or Next.js route handlers for the first launch
- Database: Supabase PostgreSQL
- Storage: Supabase Storage or equivalent CDN-backed object storage
- Monitoring: Sentry plus structured logs

Recommended Vercel project settings:

```text
Framework Preset: Next.js
Install Command: pnpm install
Build Command: pnpm vercel-build
Output Directory: default
Root Directory: repository root
```

Required Vercel environment variables:

```text
AUTH_SECRET
AUTH_URL
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_ENABLE_R3F_VIEWER
```

Run database migrations from your machine or CI before production traffic:

```bash
pnpm db:deploy
pnpm db:seed
```

Full production deployment, caching, monitoring, CI/CD, and security guidance:

```text
docs/production-deployment.md
```
