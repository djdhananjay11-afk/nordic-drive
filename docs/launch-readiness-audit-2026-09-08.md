# NordicDrive launch-readiness audit

Date: 2026-09-08. Verdict: not ready for an unrestricted public launch.

## Scope and evidence

Reviewed the current working tree, including uncommitted changes, public catalogue/search/comparison, AI request paths, authentication, admin services/uploads, metadata, and deployment workflows. No application fixes or external mutations were performed for this audit.

Executed web ESLint and TypeScript checks: both passed. Inspected the running local browser at /no and /no/compare. Clicking Meny produced no change. The Norwegian comparison page rendered English headings, controls, and summary. The homepage exposed missing-photo placeholders and English catalogue descriptions.

Deployed preview inspection is pending: no deployed URL was supplied, and the only available browser tab was localhost:3000. Local behavior does not establish deployed behavior. No fresh production build, Lighthouse score, dependency advisory scan, database migration/restore, authenticated role test, full viewport matrix, or paid AI integration test was completed. Prior build results are not treated as current launch certification.

## Findings

### 1. P1: Comparison presents calculated specifications as vehicle facts

Evidence: apps/web/features/cars/comparison/comparison-engine.ts:790. createFallbackSpec derives horsepower from battery capacity, safety score from seat count, dimensions from body type, and assigns common warranty values. enrichCar uses these when a vehicle has no supplemental specification. These values feed comparison tables, rankings, and AI vehicle documents.

Impact: users can make decisions from unsupported safety, performance, and warranty claims. Replace with verified model/variant-specific data, or explicit unknown values excluded from scoring. Acceptance: no unsourced fallback enters a factual comparison row or recommendation explanation.

### 2. P1: Mobile navigation is nonfunctional

Evidence: apps/web/components/design-system/premium-nav.tsx:43 hides navigation below lg; line 81 renders a menu button without an action. Confirmed locally by clicking Meny with no resulting menu.

Fix: implement an accessible drawer with links, focus management, Escape dismissal, and route-change closure. Verify at 320, 375, 390, 768 and desktop widths, including keyboard navigation.

### 3. P1: Paid AI endpoints have uncontrolled request amplification

Evidence: apps/web/app/api/ai/recommendations/route.ts:11 exposes recommendations without an application rate limiter. apps/web/features/ai/server/vector-search.ts:43 embeds every catalogue document on each semantic search with Promise.all. The assistant calls both search and recommendation endpoints. openai-client.ts has no request deadline and trusts parsed JSON through a type assertion.

Impact: repeated anonymous requests can multiply cost and upstream traffic; malformed output/network failures can fail requests. Platform-level protections were not verified. Precompute/store document embeddings; limit requests and concurrency; enforce deadlines, validated output schemas, and fallback behavior. Acceptance: bounded per-request work and verified 429/timeout/provider-error behavior. Keep paid AI disabled until this is verified.

### 4. P1: Admin edits do not update the public catalogue

Evidence: apps/web/lib/admin/services.ts writes Prisma entities, while public car detail pages, comparison, local search and AI documents read nordic-cars.ts. No publication bridge was found in these paths.

Impact: corrections made in admin do not reach public detail/comparison/AI data. Choose an explicit launch source of truth: a verified code-managed catalogue with admin hidden, or database-backed reads and cache/index publication. Acceptance: one edited price/image is reflected consistently across all public surfaces.

### 5. P1: Admin uploads are incompatible with the intended hosting model

Evidence: apps/web/app/api/admin/uploads/route.ts:45 writes public/uploads/admin in the running function and stores a relative URL. It does not use Supabase Storage. Validation also accepts filename extensions without verifying content.

Fix: durable object storage, verified file content and size, association with the correct car, and cleanup on failed database writes. Test persistence across deployments. Vercel recommends object storage for writes: https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions

### 6. P1: Soft-deleted admins retain role authorization

Evidence: apps/web/lib/auth.ts:40 looks up users by email and reads the role slug without checking user.deletedAt or role.deletedAt. The resulting slug determines admin permissions.

Impact: soft deletion does not revoke an existing administrator's access. Reject deleted users/roles and clear authorization. Acceptance: a deleted administrator's existing session cannot access admin pages or mutation endpoints. This is a source-level finding; no accounts were changed to test it.

### 7. P1: Deployment workflow is not a dependable release gate

Evidence: .github/workflows/vercel-deploy.yml references secrets directly in a job-level if, which GitHub does not support. It also triggers independently of the CI workflow, without a validation dependency. Database migration deployment appears in CI, but not the production deploy workflow.

Fix the conditional, require successful validation before deployment, and document a controlled production migration step. Verify Vercel Git deployment settings separately. GitHub reference: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets

### 8. P1: Norwegian-first routing is not complete Norwegian translation

Evidence: /no/compare rendered English locally; comparison-page-view.tsx hardcodes its copy. Homepage catalogue descriptions and hero annotations also remain English. Changing defaultLocale only changes routing and dictionary fallbacks.

Acceptance: Norwegian public journeys, car copy, controls, empty/error states, and AI responses consistently use Norwegian; English remains available without losing selected cars or search context.

### 9. P2: English detail/comparison canonical metadata points to Norwegian

Evidence: apps/web/lib/seo.ts:115 creates car metadata without passing request locale, and createPageMetadata defaults to the now-Norwegian defaultLocale. apps/web/app/compare/page.tsx exports static metadata the same way. English variants therefore receive Norwegian canonicals by code path.

Fix locale-aware metadata generation and inspect rendered canonical/hreflang tags on both language variants. Also remove unconditional InStock offer assertions unless availability is verified (seo.ts:163).

### 10. P2: Listing requests can race and discard pagination

Evidence: car-listing-view.tsx:56 starts a page-one fetch on mount/filter changes, has no cancellation/stale-response guard, and does not check response.ok before assigning payload.data. Pagination requests share the same mutable result.

Impact: older requests can replace newer filters; reopening a paginated URL returns to page one; failed API responses can break rendering. Acceptance: latest request wins, page URLs survive reload, and errors preserve usable results with retry.

### 11. P2: Algolia mode ignores sorting

Evidence: features/cars/search/algolia-car-search.ts uses one index and never applies params.sort, while local-car-search.ts does.

Acceptance: price/range/charging ordering works across all pages with Algolia configured, using appropriate indices or supported ranking configuration.

### 12. P2: Featured comparisons open an empty comparison

Evidence: home-page-view.tsx:269 sends every named comparison to /compare without vehicle keys. Locally, Model Y versus iX and other named pairs exposed the same empty URL.

Acceptance: each named pair opens exactly those vehicles in the chosen language.

### 13. P2: Real photo coverage remains incomplete

Evidence: official-car-media.ts has a limited explicit mapping; getCarImageAsset falls back to vehicle SVGs. The local homepage displayed Add CMS media for Volvo EX30, Hyundai Ioniq 5 and Porsche Macan.

Acceptance: each published vehicle has a correct model/year photo with documented usage permission, or is intentionally shown without a misleading substitute. Manufacturer hosting alone does not establish publication permission.

### 14. P2: AI constraints are preferences rather than requirements

Evidence: recommendation-engine.ts applies fixed penalties for exceeding budget or missing range/seats, then selects by score. It can still recommend mismatches. Tradeoffs do not consistently identify missing range/seats.

Acceptance: strict user constraints filter candidates; no-match results are honest; alternatives outside constraints are explicitly separated and explained.

### 15. P2: Operational readiness is not demonstrated

Evidence: health route returns unconditional ok; web-vitals endpoint logs to console; admin analytics chart is hardcoded in services.ts. No end-to-end test suite was found in the searched project files. Deployed alerting, backups, restore, secret configuration and successful admin login remain unverified.

Acceptance: distinguish liveness from dependency readiness, configure actionable error alerts, label/remove sample analytics, and prove critical browser journeys plus backup restoration in staging. Verify OAuth callback, database connectivity and role assignment without publishing credentials.

## Recommended launch gates

1. Public experience: fix menu, Norwegian copy, named comparison links, request races and images. Verify mobile/keyboard flows.
2. Data trust: remove fabricated fallback facts; document model-specific sources, verification dates, price basis and image rights.
3. Exposure decision: hide unfinished admin/paid AI for an informational launch, or complete their authorization, publication, storage and cost controls.
4. Deployment: fix release gating; validate migration procedure, preview secrets, canonical origin, security headers and durable storage.
5. Preview sign-off: inspect the actual Vercel URL at mobile/desktop sizes; test images, language changes, filters, comparison additions/removals, AI failure cases, login and unauthorized API access. Measure production Lighthouse and record results rather than assuming 95+.

The public informational launch can be smaller than the full planned platform, but data accuracy and functional navigation should not be deferred.
