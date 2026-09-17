# NordicDrive official-source scraper

Python 3.12+ command-line collector for the existing Norwegian brand registry.
This is a **collection and staging-import tool**, not a claim that every Norwegian
EV model, variant or specification has been verified. It does not change the web
UI, publish car records, remove catalogue entries, or disable AI pages.

## Setup (PowerShell, repository root)

```powershell
py -3.12 -m venv tools/catalogue-scraper/.venv
tools/catalogue-scraper/.venv/Scripts/python.exe -m pip install -r tools/catalogue-scraper/requirements.lock.txt
pnpm catalog:scraper-sources
Set-Location tools/catalogue-scraper
.venv/Scripts/python.exe -m scraper list
```

If `py` cannot find Python, install Python 3.12 or later first. On Linux/macOS use
`python3 -m venv .venv` and `.venv/bin/python`. The local Windows virtual environment
created during implementation is ignored by Git and does not deploy to Vercel.

`sources.json` is generated from `packages/database/src/catalog/sources-no.ts`
and the existing evidence batches, using a TypeScript exporter rather than parsing
TypeScript with regular expressions. It contains 50 brand entries; GWM is disabled
because Norwegian availability was not confirmed. This is the project's current
registry, not a guarantee of complete market coverage. Change the registry and
regenerate to add brands. Source citations provide initial model/specification URLs.

## Collect

Start with a small check; substitute a real contact email or project contact URL:

```powershell
.venv/Scripts/python.exe -m scraper crawl --brand polestar --contact https://nordic-drive-web.vercel.app/ --max-pages 3 --max-sitemaps 0 --output runs/smoke
```

Run every enabled configured brand, including linked PDF price/specification files:

```powershell
.venv/Scripts/python.exe -m scraper crawl --contact https://nordic-drive-web.vercel.app/ --max-pages 80 --max-depth 4 --pdf --output runs/norway
```

This can take hours. Requests are sequential, separated by at least three seconds
plus jitter and any larger robots crawl-delay/request-rate interval. Each source
has exact hostname and Norwegian path restrictions. Explicit source citations may
include PDFs outside the locale path. Redirects cannot silently expand that scope.
Sitemap discovery is bounded; unvisited URLs and extraction failures are reported.
Use `--brand` repeatedly to run subsets. Re-running is safe: content/date hashes
deduplicate observations. A restart recrawls pages, it does not skip previously
visited pages. Completed observations survive interruption; reports are checkpointed.

The tool identifies itself as `NordicDriveCatalogBot`, not as a human. It does not
use stealth browsers, rotating proxies, account credentials, CAPTCHA solvers, or
private endpoints. Robots disallow rules are honored. Unreadable robots files fail
closed except a genuine 404/410. A 401/403/429/503 or detected challenge stops that
host for the run; do not immediately rerun a rate-limited host. No automatic retry
attempts to get around a restriction. Website terms must also permit the activity;
robots access alone does not establish permission to reproduce content.

## What is extracted

- Vehicle JSON-LD, specification tables with variant column headings, labelled
  definition lists, and candidate specification snippets.
- Range, batteries, charging, dimensions, towing, power/performance, equipment,
  warranty, pricing and other labels are retained **as stated**, not guessed.
- Monthly prices are not converted into vehicle prices; 20-80% charging is not
  relabelled 10-80%; gross and usable batteries are not merged. Model-wide maxima
  and variant-specific figures remain distinct in the source context.
- PDF candidate lines retain page numbers. PDF parsing runs in a separate process
  with a 30-second deadline and a 40-page limit. Scanned PDFs require separate OCR
  review. Tables spanning PDF lines/pages need a model-specific adapter or review.
- Image URLs and alt text are collected as **UNVERIFIED / NOT_INSPECTED** candidates.
  No image files are downloaded or published; a URL is not a reuse licence.

Output: `runs/<name>/records/*.json`, per-brand reports, and `report.json`.
`completeness` is always `PARTIAL`. A successful exit means at least one observation
was collected, not that every brand succeeded. Inspect every brand report and
`queuedRemaining`. Exit 2 means no specification observations were obtained.
JavaScript-only configurators, query URLs, external CDNs, blocked sites and missing
tables need explicit adapters or official data feeds. This first version does not
render JavaScript, normalize all specifications, resolve exact variants, verify
Norwegian BEV availability, or approve content automatically.

## Insert into the existing staging database

First validate the collected records without opening a database connection:

```powershell
.venv/Scripts/python.exe -m scraper import --input runs/norway
```

Set `SCRAPER_DATABASE_URL` through your local secret manager/environment; never put
it in source control, command arguments, screenshots or chat. It is deliberately
separate from the frontend's `DATABASE_URL`. The importer does not read `.env` files
automatically. For remote PostgreSQL use `sslmode=verify-full` and, when necessary,
set `PGSSLROOTCERT` to the provider's CA certificate. Only `schema=public` is supported.

```powershell
.venv/Scripts/python.exe -m scraper import --input runs/norway --apply --environment staging --target 'USER@HOST:5432/DATABASE'
```

Replace the target with the exact identity in the staging connection URL, without
its password. A flag cannot prove a server is staging: use a dedicated staging
credential with no production access. Production imports are not enabled.

The existing `CatalogEvidence` table must already exist. This tool never runs
migrations or seeds. Do **not** blindly replay the project's historical destructive
schema migration against an existing database. Have the DB owner check the current
migration state and apply only the reviewed required migration.

Imports are parameterized, transactional, insert-only and idempotent on
`contentHash`. All new observations are `PENDING`, with source URL, date, response
hash, extractor version and raw structured evidence. Existing review decisions and
published `Car`, `Variant`, `Specification`, `EVCharging` and `Media` rows are not
modified. `kind: SCRAPED_PAGE_OBSERVATION` intentionally differs from the manually
validated `MODEL_OBSERVATION` contract; consumers must discriminate on `kind`.
Model/variant identifiers remain null until reviewed rather than inferred from URLs.

For least privilege, ask the DB owner to issue a dedicated role with only schema
USAGE and the INSERT/SELECT permissions needed for `CatalogEvidence`, with a matching
staging RLS INSERT policy restricted to PENDING scraped observations. Do not use a
Supabase anon key or weaken public RLS policies. A production publication pipeline
must separately validate variant mapping, dates, units, Norway availability and
image licences before applying approved field-level changes.

## Tests and operations

```powershell
.venv/Scripts/python.exe -m unittest discover -s tests -v
```

Offline tests cover extraction, variant context, robot denial, redirect restrictions,
private-address rejection, rate limiting, source registry, import validation, dry
runs and parameterized SQL. An optional PostgreSQL integration test runs only when
`SCRAPER_TEST_DATABASE_URL` is set to a disposable CI database; CI supplies it after
creating the existing schema. No public crawling happens in CI.

Keep this job outside Vercel request handlers. Use a dedicated worker/manual job
with a network egress policy that blocks private addresses (DNS validation is not
a substitute for network isolation), resource limits for third-party PDF parsing,
restricted secrets and retained reports. Review dependency updates and rerun tests
before updating the pinned lock file. No recurring crawl is scheduled by this change.

Implementation references: [Python robots parsing](https://docs.python.org/3/library/urllib.robotparser.html)
and [Psycopg transactions](https://www.psycopg.org/psycopg3/docs/basic/transactions.html).
