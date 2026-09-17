# Starter catalogue release

## Scope and limitations

This document describes the optional curated release. The default is now the
full application (`NORDICDRIVE_RELEASE_MODE=full`), with the broader provisional
catalogue and AI navigation restored. Source-reviewed database records remain
available separately at `/no/verified-cars` and `/en/verified-cars`.
See [completion status](completion-status.md) for current launch limitations.

The curated release is a small source-backed catalogue, not the legacy demo.
It contains Polestar 2 Long range Single motor and Hongqi EHS5 Exclusive 4WD,
checked against their official Norwegian pages on 12 September 2026.
These are manufacturer claims, not independently tested cars. Model years,
winter tests, full warranty terms and independent safety assessments are not
confirmed. Missing facts are omitted and shown as unknown, never guessed.

The homepage, `/cars`, `/electric-cars`, brand pages, detail pages, comparison,
`/api/catalogue` and sitemap use the same release records. Norwegian and English
are supported. Comparison starts empty, accepts up to four distinct released
configurations and preserves selections when browsing for another car.

AI, launches and other demo pages redirect to the catalogue in curated mode.
Legacy public data APIs return 503. Admin, login and authentication retain their
existing protections. The legacy implementation is preserved, not deleted.

**No new image is licensed for publication.** The pages link to the real
manufacturer galleries and show an honest missing-photo state. They do not
draw substitute cars, use generated SVGs, hotlink unapproved photos or claim
the image work is finished. Before adding an image, obtain reuse permission,
store an approved asset locally or on your controlled media host, record the
permission reference, verify the variant/model year and inspect it at mobile
and desktop sizes. Do not assume a manufacturer URL grants reuse permission.

## Run without a database

From the repository root:

```powershell
pnpm install --frozen-lockfile
pnpm --filter @nordicdrive/database build
pnpm --filter @nordicdrive/web dev
```

Explicit settings for the optional offline curated release:

```dotenv
NORDICDRIVE_RELEASE_MODE=curated
NORDICDRIVE_CATALOGUE_SOURCE=snapshot
```

Open `/no/cars`, select cars, then compare. Try English with the language
switcher. Snapshot mode deliberately serves checked-in facts and requires no
database connection for public catalogue browsing. It does not mean anything
was inserted into PostgreSQL. Authentication/admin still need their own setup.
Set `NORDICDRIVE_RELEASE_MODE=full` to restore the full application. Its older
catalogue is provisional and must not be presented as completely verified.

On Windows, standalone packaging may require privileges to create symbolic
links. The existing Vercel-compatible build option avoids standalone output:

```powershell
$env:NEXT_OUTPUT_STANDALONE = "false"
pnpm --filter @nordicdrive/web build
```

Vercel already selects non-standalone output automatically. Docker packaging
remains unchanged when this option is not set.

## Staging publication

1. Configure real staging `DATABASE_URL` and `DIRECT_URL` in
   `packages/database/.env`. Never post credentials in chat or commit them.
2. Check migration history and take a backup. Do **not** blindly apply all old
   migrations to an existing database: the historical phase-3 migration drops
   tables. The additive CatalogEvidence migration must exist before publication.
3. Validate without connecting:

```powershell
pnpm catalog:release
pnpm catalog:test
pnpm catalog:test-web
```

4. Publish only to an explicitly confirmed staging identity:

```powershell
pnpm catalog:release --apply --environment staging --target "USER@HOST:PORT/DATABASE"
```

The target is the exact non-secret username/host/port/database identity checked
by the existing importer guard. It cannot prove which environment a host is:
independently confirm the project is staging. The command rejects other
environment labels, uses TLS for remote databases and never logs credentials.
It creates approved, versioned CatalogEvidence read-model rows idempotently.
It does not overwrite the legacy Car/Variant tables or turn missing booleans
into false. Existing rejected/deleted rows are not automatically reapproved.

5. Configure the staging web deployment with its own `DATABASE_URL` and
   `NORDICDRIVE_CATALOGUE_SOURCE=database`. The repository only publishes exact
   known revision hashes whose rows are APPROVED and not soft-deleted. An empty
   database yields an empty catalogue, not demo fallback. An outage fails closed.

CatalogEvidence is a versioned publication read model for this small release,
not a substitute for a complete editorial CMS. Changing a fact requires source
review, a new dated release revision, tests and publication. Raw research batches
remain PENDING and cannot appear on the public site. No new migration is needed
if the existing CatalogEvidence migration is already installed.

## Launch gates still open

- Staging connection, migration-history review and an actual import/read-back.
- Authorized real photographs and visual QA of those assets.
- Editorial approval of the limited coverage and price freshness policy.
- Full production build, accessibility/mobile checks, deployed preview checks,
  auth/security audit and operational monitoring before a production claim.
- Database-source testing against staging; local snapshot success is not proof.

No production database changes or deployment are performed by these commands.
Vercel must use the same two catalogue environment settings as local testing.

## Local verification, 15 September 2026

- Non-standalone Next.js production build passed, including frontend lint and
  TypeScript validation. Standalone packaging encountered Windows symlink
  permissions; the Vercel-compatible option above passed.
- Database lint and TypeScript checks passed.
- 22 catalogue tests and 3 web policy/SEO tests passed.
- Five production-server HTTP smoke tests passed: Norwegian root redirect;
  both locales and every starter detail/brand page; the public API and disabled
  legacy endpoints; unauthorized admin requests; health, social image and sitemap.
- Browser checks covered instant search, retaining selections while browsing,
  adding a second car, language switching, and opening a detail page. At a
  390px viewport the comparison scrolls inside its own region, including with
  the keyboard, without horizontal page overflow. Desktop was also inspected.
- The checks caught and fixed static-rendering failures on localized detail
  pages and a localized homepage redirect loop. Explicit role checks were added
  inside the Auth.js handler because this installed beta can execute custom
  handlers even when its authorization callback returns false.

Run `pnpm catalog:test-http` while the snapshot-mode production server is
listening on localhost:3000 to repeat the HTTP checks. These checks are read-only.
They do not verify a real authenticated editor session or a staging database.

Staging credentials remained absent during verification. No database rows were
inserted, no photographs were licensed, and no production deployment was made.
This is a tested limited preview, not a certification that the entire platform
is production-ready.
