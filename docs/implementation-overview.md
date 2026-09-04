# NordicDrive Implementation Overview

This document explains what has been built for NordicDrive so far, how the codebase is organized, and what still needs to be completed before a real public production launch.

## 1. Product Scope

NordicDrive is a premium electric-car comparison platform for Norway. The implementation is inspired by Tesla, Porsche, Apple-style product pages, and a Scandinavian luxury interface.

The current platform includes:

- A monorepo foundation.
- A Next.js frontend.
- A NestJS backend scaffold.
- PostgreSQL and Prisma setup.
- A large EV catalog for the Norwegian market.
- Premium homepage and listing pages.
- Car detail pages with 3D viewer scaffolding.
- Comparison engine.
- AI recommendation API scaffolding.
- Admin dashboard scaffolding.
- Auth.js authentication and RBAC foundation.
- English and Norwegian language support.
- SEO, sitemap, metadata, and structured data foundation.
- Docker, CI/CD, and deployment documentation.

The site is currently best described as **preview/demo ready**, not fully public-production ready.

## 2. Monorepo Structure

The project is organized as a pnpm workspace.

```txt
nordicdrive/
  apps/
    web/                 Next.js frontend
    api/                 NestJS backend
  packages/
    database/            Prisma schema, migrations, seed scripts
    types/               Shared TypeScript types
    config/              Shared ESLint and TypeScript configs
  docs/
    architecture.md
    production-deployment.md
    implementation-overview.md
  docker-compose.yml
  pnpm-workspace.yaml
  turbo.json
```

This structure allows the frontend, backend, database layer, and shared types to evolve independently while still being managed from one repository.

## 3. Frontend

The frontend lives in:

```txt
apps/web/
```

It uses:

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- ShadCN-style UI primitives
- Lucide icons
- React Three Fiber and Drei
- Auth.js

Important frontend areas:

```txt
apps/web/app/                         App Router pages and API routes
apps/web/components/ui/               Reusable UI primitives
apps/web/components/design-system/    Premium visual system components
apps/web/components/i18n/             Language switcher
apps/web/components/seo/              JSON-LD helpers
apps/web/features/home/               Homepage data and UI
apps/web/features/cars/               Car catalog, listing, detail, search, compare
apps/web/lib/                         Auth, SEO, i18n, RBAC, utilities
```

## 4. Design System

The design system includes:

- Premium light visual direction.
- Glassmorphism cards.
- Cinematic gradients.
- Motion utilities.
- Floating particles.
- Reusable buttons, cards, dialogs, skeletons, navigation, and layout components.

Key files:

```txt
apps/web/tailwind.config.ts
apps/web/app/globals.css
apps/web/components/ui/button.tsx
apps/web/components/ui/card.tsx
apps/web/components/ui/dialog.tsx
apps/web/components/design-system/premium-nav.tsx
apps/web/components/design-system/floating-particles.tsx
apps/web/components/design-system/animated-gradient.tsx
apps/web/components/design-system/hero-framework.tsx
```

## 5. Homepage

The homepage is built in:

```txt
apps/web/app/page.tsx
apps/web/features/home/components/home-page-view.tsx
apps/web/features/home/components/home-search.tsx
apps/web/features/home/components/interactive-vehicle.tsx
apps/web/features/home/data/home-data.ts
```

It includes:

- Cinematic hero section.
- Interactive vehicle visual.
- Instant homepage search.
- Featured EV cards.
- Latest launches.
- Trending comparisons.
- Brand showcase.
- News and insights.
- AI recommendation CTA.

The homepage is now bilingual and renders different text for English and Norwegian.

## 6. Car Catalog and Listing Pages

The EV catalog is currently stored in code:

```txt
apps/web/features/cars/data/nordic-cars.ts
```

The listing system includes:

```txt
apps/web/app/cars/page.tsx
apps/web/app/electric-cars/page.tsx
apps/web/app/brands/[brand]/page.tsx
apps/web/features/cars/listing/car-listing-view.tsx
apps/web/features/cars/listing/filter-panel.tsx
apps/web/features/cars/listing/listing-card.tsx
apps/web/features/cars/search/algolia-car-search.ts
```

Implemented listing features:

- Instant search.
- Brand filter.
- Body type filter.
- Minimum range filter.
- Maximum price filter.
- Sorting.
- Pagination.
- Sticky desktop filters.
- Mobile filter drawer.
- Algolia-ready search abstraction with local fallback.
- English and Norwegian UI labels.

## 7. Car Images and Media

The project originally tested Wikimedia images, but that strategy was removed because the images were old and not premium enough.

The current implementation uses an official/licensed media registry:

```txt
apps/web/features/cars/data/official-car-media.ts
```

Current behavior:

- If a vehicle has a licensed media URL, it displays that.
- If no licensed media exists yet, the UI falls back to a local premium placeholder.
- Cards show an `Add CMS media` label when real media is missing.
- Next.js image configuration only allows approved media hosts and Supabase.

Key component:

```txt
apps/web/features/cars/components/vehicle-image.tsx
```

Recommended production direction:

- Upload licensed OEM/dealer images into Supabase Storage.
- Store media metadata in PostgreSQL.
- Manage media from the admin dashboard.
- Avoid scraping or depending on stale third-party image sources.

## 8. Car Detail and 3D Pages

Car detail pages live under:

```txt
apps/web/app/cars/[brandSlug]/[modelSlug]/
apps/web/features/cars/detail/
apps/web/features/cars/three/
```

The implementation includes scaffolding for:

- Hero section.
- 3D viewer.
- Specs.
- Variants.
- Gallery.
- Reviews.
- AI summary.
- Similar vehicles.
- Comparison CTA.

React Three Fiber and Drei are included for GLTF-ready 3D vehicle rendering. For production, real optimized GLB/GLTF assets still need to be licensed, compressed, and added through a proper asset pipeline.

## 9. Comparison Engine

The comparison feature includes:

```txt
apps/web/app/compare/page.tsx
apps/web/app/api/compare/route.ts
apps/web/features/cars/compare/
```

Implemented or scaffolded comparison capabilities:

- Compare multiple vehicles.
- Price, range, battery, horsepower, charging, safety, interior, dimensions, warranty, and performance comparison concepts.
- Highlighting best values.
- Responsive comparison UI.
- AI summary integration point.

## 10. AI Features

AI-related routes and UI live in:

```txt
apps/web/app/ai/page.tsx
apps/web/app/api/ai/recommendations/route.ts
apps/web/app/api/ai/search/route.ts
apps/web/app/api/ai/comparison-summary/route.ts
apps/web/app/api/ai/quiz/route.ts
```

Implemented/scaffolded features:

- AI car recommendations.
- Natural language search route.
- AI comparison summaries.
- EV recommendation quiz.
- OpenAI API integration structure.
- Prompt and recommendation engine foundation.

Production requirement:

- Add rate limiting.
- Add request logging.
- Add prompt safety checks.
- Add cost controls.
- Add vector database or PostgreSQL pgvector when real semantic search is needed.

## 11. Authentication and Admin

Authentication is built with Auth.js:

```txt
apps/web/lib/auth.ts
apps/web/app/api/auth/[...nextauth]/route.ts
apps/web/types/next-auth.d.ts
```

RBAC is defined in:

```txt
apps/web/lib/rbac.ts
apps/web/middleware.ts
```

Admin routes live in:

```txt
apps/web/app/admin/
apps/web/components/admin/
apps/web/app/api/admin/
```

Admin dashboard areas include:

- Cars.
- Brands.
- Launches.
- Articles.
- Media.
- Users.
- Analytics cards and tables.

Roles planned:

- Super Admin.
- Editor.
- Content Manager.

Before production, the auth system needs real OAuth credentials, session QA, permission testing, upload permissions, and audit logging.

## 12. Database and Prisma

Database code lives in:

```txt
packages/database/
```

Important files:

```txt
packages/database/prisma/schema.prisma
packages/database/prisma/seed.ts
packages/database/prisma/migrations/
packages/database/prisma/example-queries.ts
```

The Prisma schema includes models for:

- User
- Role
- Brand
- Car
- Variant
- Specification
- Feature
- Review
- Comparison
- SavedComparison
- Media
- Launch
- Article
- Dealer
- EVCharging
- Wishlist

The schema includes:

- Slugs.
- SEO fields.
- Timestamps.
- Soft delete support.
- Relations.
- Indexes.
- Role permissions.

## 13. Backend API

The NestJS backend lives in:

```txt
apps/api/
```

Implemented backend foundation:

```txt
apps/api/src/main.ts
apps/api/src/app.module.ts
apps/api/src/modules/health/
apps/api/src/modules/cars/
apps/api/src/modules/auth/
apps/api/src/modules/prisma/
apps/api/src/common/
```

It includes:

- NestJS app setup.
- Configuration module.
- Prisma service.
- Health controller.
- Cars controller/service.
- JWT strategy scaffold.
- Roles guard.
- Response envelope interceptor.
- Global exception filter.
- Dockerfile.

At the moment, many product-facing APIs are implemented in Next.js API routes. The NestJS backend is ready to become the dedicated API service as the platform grows.

## 14. Internationalization

The platform now supports:

- English: `/en`
- Norwegian: `/no`

The root path redirects:

```txt
/ -> /en
```

i18n files:

```txt
apps/web/lib/i18n/config.ts
apps/web/lib/i18n/dictionaries.ts
apps/web/lib/i18n/server.ts
apps/web/components/i18n/language-switcher.tsx
```

Middleware handles locale-prefixed URLs:

```txt
apps/web/middleware.ts
```

Currently translated:

- Public navigation.
- Homepage.
- Homepage search.
- Listing pages.
- Filters.
- Listing card labels.
- Localized metadata.
- Localized sitemap entries.

Still to translate:

- Admin dashboard.
- AI page.
- Compare page.
- Car detail page body copy.
- Error pages.
- Login page.

## 15. SEO and Metadata

SEO utilities live in:

```txt
apps/web/lib/seo.ts
apps/web/components/seo/json-ld.tsx
apps/web/app/sitemap.ts
apps/web/app/robots.ts
apps/web/app/opengraph-image.tsx
```

Implemented SEO features:

- Page metadata helper.
- Localized canonical URLs.
- `alternates.languages` for English and Norwegian.
- JSON-LD organization schema.
- JSON-LD website schema.
- JSON-LD car and car list schema.
- Sitemap generation for both languages.
- Robots route.
- Open Graph image route.

## 16. Performance and Production Optimization

Implemented performance foundations:

- Next.js Image optimization.
- Remote image host allowlist.
- Static/ISR-friendly routes where possible.
- Cache headers for selected API routes.
- Compression enabled.
- Web vitals reporter.
- Reduced public asset host surface.
- Tailwind utility-driven styling.
- Lazy-friendly component architecture.

Current tradeoff:

- Locale middleware and request-locale reading make some pages dynamic.
- If maximum static generation is required, the next step should be a full `[locale]` route-tree migration instead of middleware rewrite compatibility.

## 17. Security

Implemented security foundations:

- Auth.js setup.
- JWT session strategy.
- RBAC helpers.
- Admin route protection.
- Content Security Policy.
- Permissions Policy.
- Referrer Policy.
- HSTS header.
- X-Content-Type-Options.
- X-Frame-Options.
- Restricted Next Image remote patterns.

Still needed before public launch:

- Rate limiting.
- CSRF review for mutations.
- Upload validation.
- File type scanning.
- Audit logs for admin actions.
- Abuse protection for AI endpoints.
- Production secret rotation.
- Security review of all admin APIs.

## 18. Deployment

Deployment files include:

```txt
Dockerfile files in apps/web and apps/api
docker-compose.yml
.github/workflows/ci.yml
.github/workflows/vercel-deploy.yml
docs/production-deployment.md
```

Recommended hosting plan:

- Frontend: Vercel.
- Database: Supabase Postgres.
- Media: Supabase Storage.
- Backend: initially Next.js API routes, later NestJS on Railway, Render, Fly.io, or Docker.
- Monitoring: Vercel Analytics, Sentry or similar, API logs.

## 19. How to Run Locally

Install dependencies:

```bash
pnpm install
```

Start the frontend:

```bash
pnpm --filter @nordicdrive/web dev
```

Open:

```txt
http://localhost:3000/en
http://localhost:3000/no
```

Run checks:

```bash
pnpm --filter @nordicdrive/web typecheck
pnpm --filter @nordicdrive/web lint
pnpm --filter @nordicdrive/web build
```

## 20. Current Readiness

Ready for:

- Local demo.
- Private preview.
- Product walkthrough.
- Design review.
- Investor-style prototype.

Not ready yet for:

- Full public launch.
- Real customer accounts.
- High-volume traffic.
- Production media operations.
- Paid AI usage at scale.

## 21. Recommended Next Phase

The next phase should focus on production hardening:

1. Move car catalog data fully into PostgreSQL.
2. Build real admin CRUD flows backed by Prisma.
3. Add licensed vehicle media upload and management through Supabase Storage.
4. Finish Norwegian translation for car detail, compare, AI, auth, and admin pages.
5. Add rate limiting and monitoring.
6. Run Lighthouse, accessibility, and mobile QA.
7. Deploy preview to Vercel with Supabase production environment variables.
8. Test auth, RBAC, uploads, API errors, and SEO output on a real preview domain.

