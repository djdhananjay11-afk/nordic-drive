# NordicDrive Production Deployment

This guide describes the production setup for the NordicDrive monorepo.

## Targets

- Frontend: Vercel, Next.js App Router, ISR, Vercel CDN, Next Image Optimization.
- Database: Supabase PostgreSQL with Prisma migrations.
- API: NestJS container, deployable to Fly.io, Render, Railway, Azure Container Apps, or another Docker host.
- Assets: Supabase Storage or another signed media bucket for uploaded images and 3D assets.
- Search: Algolia for instant search, local fallback for development.
- AI: OpenAI API for recommendations, semantic search, quiz, and comparison summaries.

## Required Production Environment

Set these in Vercel for the web project:

```bash
NEXT_PUBLIC_APP_URL=https://www.nordicdrive.no
NEXT_PUBLIC_API_URL=https://api.nordicdrive.no
DATABASE_URL=postgresql://...
AUTH_SECRET=<openssl-rand-base64-32>
AUTH_URL=https://www.nordicdrive.no
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
ALGOLIA_APP_ID=
ALGOLIA_SEARCH_API_KEY=
ALGOLIA_CARS_INDEX_NAME=nordicdrive_cars
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-luna
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
NEXT_PUBLIC_SENTRY_DSN=
LOG_LEVEL=info
```

Set these for the NestJS API host:

```bash
NODE_ENV=production
API_PORT=4000
NEXT_PUBLIC_APP_URL=https://www.nordicdrive.no
DATABASE_URL=postgresql://...
JWT_SECRET=<long-random-secret>
JWT_ISSUER=nordicdrive
JWT_AUDIENCE=nordicdrive-api
SENTRY_DSN=
LOG_LEVEL=info
```

## Supabase Database

1. Create a Supabase project in the Norway/EU-adjacent region that best matches latency and compliance needs.
2. Copy the pooled PostgreSQL connection string into `DATABASE_URL`.
3. Run migrations from CI or a release job:

```bash
pnpm --filter @nordicdrive/database prisma:deploy
pnpm db:generate
```

4. Enable point-in-time recovery before real production traffic.
5. Create separate Supabase service keys for production and preview environments.

## Vercel Frontend

Recommended Vercel project settings:

- Root directory: repository root.
- Install command: `corepack enable && pnpm install --frozen-lockfile`.
- Build command: `pnpm --filter @nordicdrive/web build`.
- Output: Next.js default.
- Node.js: 20+.
- Framework preset: Next.js.

The app uses:

- ISR on public catalog pages via `revalidate`.
- Static params for brand and vehicle detail pages.
- `s-maxage` and `stale-while-revalidate` headers for public GET APIs.
- `no-store` headers for auth/admin/AI POST surfaces.
- Next Image Optimization with AVIF/WebP and a 30-day minimum remote cache TTL.

## Docker

Local production-style run:

```bash
docker compose up --build
```

Services:

- `postgres`: PostgreSQL 16.
- `api`: NestJS API at `http://localhost:4000/api/v1/health`.
- `web`: Next.js standalone runtime at `http://localhost:3000/api/health`.

Both web and API images run as non-root users and expose Docker health checks.

## CI/CD

`CI` workflow:

- Installs dependencies.
- Generates Prisma Client.
- Deploys migrations against a PostgreSQL service container.
- Checks formatting.
- Runs lint, typecheck, build.
- Runs Lighthouse CI against key public pages.

`Vercel Deploy` workflow:

- Runs on `main` and manual dispatch.
- Requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets.
- Pulls Vercel env, builds with Vercel CLI, and deploys the prebuilt production artifact.

## Lighthouse 95+ Checklist

- Keep hero and listing images on `next/image` with `sizes` set.
- Avoid adding large client-only libraries to server-renderable pages.
- Keep 3D viewers lazy-loaded and below the first viewport on content pages.
- Use `priority` only for first-viewport images.
- Keep animations transform/opacity-based.
- Run Lighthouse in CI before merging visual-heavy changes.

## SEO

Implemented:

- Centralized metadata builder in `apps/web/lib/seo.ts`.
- Dynamic metadata for brand and car detail pages.
- Canonical URLs.
- Open Graph and Twitter metadata.
- Generated Open Graph image.
- `robots.ts` and `sitemap.ts`.
- JSON-LD for organization, website search action, vehicle lists, breadcrumbs, and car detail pages.
- Admin routes are marked `noindex`.

## Monitoring

Implemented:

- Web Vitals reporter using `useReportWebVitals`.
- `/api/monitoring/web-vitals` ingestion route with validation and `no-store`.
- Route and global error boundaries.
- NestJS exception logging with sanitized production responses.

Recommended production integrations:

- Vercel Analytics and Speed Insights for frontend performance.
- Sentry or Datadog for frontend and API exception aggregation.
- Supabase database metrics and slow query logs.
- Uptime monitor against `/api/health` and `/api/v1/health`.

## Security

Implemented:

- Strict transport security, frame, referrer, content-type, permissions, DNS prefetch, and CSP headers.
- `poweredByHeader` disabled.
- NestJS Helmet enabled with HSTS.
- CORS restricted to the configured web origin.
- Validation pipes with whitelist and non-whitelisted rejection.
- Admin metadata `noindex`.
- AI POST endpoints marked `no-store`.

Before launch:

- Rotate all placeholder secrets.
- Use separate production, preview, and local Supabase projects or schemas.
- Restrict Supabase service-role keys to server-only environments.
- Configure Vercel environment scopes carefully.
- Add WAF/rate limiting for AI and admin endpoints if public traffic grows.
- Review CSP violation reports after enabling analytics and third-party vendors.
