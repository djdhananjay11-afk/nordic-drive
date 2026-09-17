# Completion status

Last updated: 2026-09-17. This is a staging preview, not a production sign-off.

## Working paths

- Full catalogue, comparisons, AI navigation and launch routes are restored by
  default. Set `NORDICDRIVE_RELEASE_MODE=curated` only for the restricted release.
- `/no/verified-cars` and `/en/verified-cars` read approved publications from
  `CatalogEvidence`; `/verified-compare` compares these independently of the
  older provisional catalogue. New valid approved records no longer require
  changing a two-ID code allowlist.
- Database publications have validated slugs, dates, sources, metric keys and
  image permission metadata. Raw scraper output is not a published vehicle.
- Explicit database mode fails visibly on a connection error; it does not
  silently replace reviewed records with demo data.
- AI recommendations and semantic search share budget, range, seat and body
  type constraints. Monthly budgets are separate from purchase budgets and
  filter provisional monthly estimates, not verified finance offers. The
  candidate data still needs source verification.
- Missing car photos have a neutral, localized empty state. The IONIQ 9 photo
  has a recorded manufacturer editorial-use permission; see the asset README.
  Decorative overlays that obscured the lower portion of photos were removed.
- Detail-page AI and comparison links work and preserve the selected language.
  Fake playable video tiles and gradient gallery placeholders are no longer shown.

## Staging database

At the last import, staging contained 191 evidence records: 189 pending and two
approved vehicle publications. This does not mean 191 cars were published.
`Car`, `Variant`, `Brand` and `Media` tables have not been populated by that import.
Application tables are protected from direct anonymous Supabase access with RLS
and revoked client grants. The server uses private database credentials.

## Required before public launch

1. Complete official Norwegian model and trim coverage. Verify price dates,
   delivery costs, WLTP configuration, battery basis, charging conditions,
   dimensions, towing, warranty and market availability. Leave unknowns null.
   The full legacy catalogue still contains estimates and synthetic detail data.
2. Review each publication before approval. Add approved photos with the exact
   model/year/trim, reuse terms, source and credit. Existing remote images have
   not all had reuse rights or trim matches cleared. One manufacturer's license
   does not cover other manufacturers or paid advertisements.
3. Supply the Supabase CA certificate for the Python importer's verify-full
   connection. Six scraped observations remain local, not imported. Do not
   disable certificate validation to force an import.
4. Configure and test Auth.js provider credentials, admin roles, storage upload
   restrictions, secrets and backups in the deployment environment.
5. Add shared rate limiting and spending controls before enabling paid AI APIs.
   Do not treat generated suggestions as verified offers or guaranteed advice.
6. Finish Norwegian translations, remove or clearly qualify remaining demo
   detail content, and verify actual licensed 3D assets before advertising 3D
   accuracy. The generic fallback is not a manufacturer's model.
7. Run mobile accessibility, production URL, security, broken-image, end-to-end
   and performance checks. Set correct canonical URLs and monitoring in Vercel.
   A successful build alone is not a Lighthouse or launch-readiness result.

## Environment

Configure private `DATABASE_URL` and `DIRECT_URL` in the runtime environment,
not in `NEXT_PUBLIC_*` variables. Use `NORDICDRIVE_CATALOGUE_SOURCE=database`
for staging and `snapshot` only for explicitly offline previews.

Verification commands from the repository root:

```powershell
pnpm catalog:test-publications
pnpm catalog:test-web
pnpm --filter @nordicdrive/web lint
$env:NEXT_OUTPUT_STANDALONE = "false"
pnpm --filter @nordicdrive/web build
# With the production server running at localhost:3000:
pnpm catalog:test-http
```
