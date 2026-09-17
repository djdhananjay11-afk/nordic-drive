# Staging database initialization

## Executed on 2026-09-15

The user-configured Supabase database had an empty `public` schema. The guarded
initializer created the current Prisma data model directly, without executing the
historical Phase 3 reset SQL. Prisma's `migrate resolve --applied` recorded the
existing migration history against that equivalent current baseline.

Verified after initialization:

- 25 application tables, plus Prisma's migration-history table.
- All four migrations recorded as complete.
- `prisma migrate diff` reports no difference from the current Prisma data model.
- RLS enabled on every application table and on `_prisma_migrations`.
- No SELECT/INSERT/UPDATE/DELETE/TRUNCATE grants for Supabase's `anon` or
  `authenticated` roles on those tables. Application access uses server-side Prisma
  and application RBAC, not the browser Data API.
- 189 `PENDING` catalogue evidence records, covering the 50-brand source registry.
- Two `APPROVED` existing reviewed vehicle configurations, with partial
  specifications and no approved image assets.
- 22 catalogue validation/release tests passed; database package typecheck and
  initializer lint passed.

The 189 pending records comprise source and model observations, not 189 complete
cars. The existing batches contain 361 collected facts across 48 brands. The two
approved configurations live in the `CatalogEvidence` publication read model.
`Car`, `Variant`, `Brand`, `Media`, user and role tables remain empty: no demo seed,
invented variants, default admin account or unlicensed images were inserted.

This operation did not deploy Vercel, change the public catalogue mode, or make the
whole website launch-ready. Verified per-variant normalization and publication of
the wider catalogue remain separate work.

## Six-page scraper batch still pending import

The six observations under `tools/catalogue-scraper/runs/live-smoke` pass offline
validation. Python's `sslmode=verify-full` connection rejected the certificate chain
with both system and standard public roots. Those six rows were **not** imported.
No TLS-verification bypass was added.

Download the database CA certificate from the Supabase project's Database Settings
SSL Configuration section to `packages/database/supabase-ca.crt`, and set
`PGSSLROOTCERT` to its absolute path when using the Python importer. Keep
`SCRAPER_DATABASE_URL` server-side, use the session/direct endpoint, and retain
`sslmode=verify-full`. The Prisma initialization used the existing configured
`sslmode=require`; this encrypts the connection but is not a claim of CA/hostname
verification. Harden production connection settings separately with the provider CA.

Official reference: [Supabase SSL enforcement](https://supabase.com/docs/guides/platform/ssl-enforcement).

## Initializer safeguards

```powershell
pnpm --filter @nordicdrive/database catalog:initialize-staging
```

The default invocation is an offline dry run. Actual initialization requires all of
`--apply`, `--environment staging` and a matching `--target user@host:port/database`.
It reads `packages/database/.env` and never prints passwords or raw Prisma output.

Do not run initialization on this populated database again. Both a read-only check
and an in-transaction check reject nonempty schemas. The script also refuses an
unrecognized migration list; future migrations require review of the bootstrap.

Schema creation, custom evidence constraints and RLS commit together. Migration
history recording is a subsequent operation; if it fails, repair missing baseline
entries with Prisma's official resolve workflow after verifying schema equivalence.
Never use reset, drop tables or rerun historical destructive migrations to recover.

Use the normal insert-only evidence import for later batches. Review/publication
must retain exact source dates, variant identity, units, charging windows, battery
basis and photo rights. Do not mass-approve raw scraped records.

## Inspect in Supabase SQL Editor

```sql
SELECT "reviewStatus", count(*)
FROM public."CatalogEvidence"
GROUP BY "reviewStatus";

SELECT "brandSlug", "modelName", "variantName", "reviewStatus", "observedOn", "sourceUrl"
FROM public."CatalogEvidence"
ORDER BY "brandSlug", "modelName", "observedOn" DESC;
```

The local `.env` remains ignored by Git. This document intentionally omits database
hostnames, project identifiers and credentials.
