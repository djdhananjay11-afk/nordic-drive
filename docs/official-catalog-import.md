# Official Norwegian EV catalogue import

Research observed on 2026-09-11 and 2026-09-12. These are **partial evidence batches**, not a complete, certified catalogue and not a completed database import. Staging is the user-approved target; production is not authorized for this import.

## What is saved

- 50 distinct brands in the source register, with coverage notes and extraction status.
- September 11: 75 model/variant observations across 27 brands, containing 212 facts.
- September 12: 21 additional observations across 10 more brands, containing 67 facts.
- Combined: 96 observations across 37 brands, 279 facts, and 156 evidence rows including dated source observations. These are not 96 complete cars.
- 12 official-site image URL candidates. None is approved for publication, verified as a current real photograph, downloaded or uploaded to storage.
- Source URLs, observation dates, units, variant scope, starting-price/maximum/preliminary labels and unresolved conflicts.
- An additive Prisma `CatalogEvidence` table, migration, dry-run validator, explicit database import command and regression tests.

Observations are not unique models: a vehicle can have separate variant, warranty and price-document observations. Some records contain only a price or a warranty. Homepage extraction is not complete specification verification. Some web results may be cached; `observedOn` means the date the source was consulted, not a guarantee the manufacturer updated it that day.

No PostgreSQL credentials were configured when this work was performed. **No migration or database insert was executed. No customer-facing catalogue or images changed.**

## Files

| Path from repository root                                                           | Purpose                                                 |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `packages/database/src/catalog/sources-no.ts`                                       | 50-source coverage register                             |
| `packages/database/src/catalog/batch-no-2026-09-11.ts`                              | Source-linked factual observations and media candidates |
| `packages/database/src/catalog/batch-no-2026-09-12.ts`                              | Second dated research batch, covering 10 more brands    |
| `packages/database/src/catalog/batches.ts`                                          | Batch selection and distinct-brand coverage reporting   |
| `packages/database/src/catalog/fields.ts`                                           | Measurement fields and units                            |
| `packages/database/src/catalog/plan.ts`                                             | Validation, canonical hashes and target protection      |
| `packages/database/src/catalog/import-official.ts`                                  | Offline dry run or explicit Prisma write                |
| `packages/database/src/catalog/plan.test.ts`                                        | Regression tests                                        |
| `packages/database/prisma/schema.prisma`                                            | Evidence table and existing domain schema               |
| `packages/database/prisma/migrations/20260911000000_catalog_evidence/migration.sql` | Additive PostgreSQL migration                           |
| `packages/database/.env.example`                                                    | Server-side connection examples                         |

## Why evidence is separate

The current `Variant` schema requires battery capacity, price and WLTP range. A source that omits any of these cannot become a valid variant without inventing a value. Boolean defaults, such as `heatPump: false`, also must not stand in for unknown equipment.

`CatalogEvidence` stores partial, structured observations without creating public `Brand`, `Car`, `Variant` or `Media` rows. Brand slugs deliberately are not foreign keys: researching a brand must not automatically publish it. The JSON payload is versioned and validated by the importer. `PENDING` is the database default; repeated imports never reset approval, rejection or soft deletion. Changed observations create new hash identities, preserving earlier evidence.

Supabase RLS is enabled on the new table, without browser-client policies. Read and import through a trusted server-side database role; do not expose the table using an anonymous client. An `APPROVED` status alone does not publish anything: a catalogue promotion workflow is still required.

## Inspect without a database

From the repository root:

```powershell
pnpm catalog:check
pnpm catalog:check --batch norway-official-2026-09-12-v1
pnpm catalog:test
pnpm --filter @nordicdrive/database typecheck
```

Dry runs do not read credentials, connect to PostgreSQL, fetch websites, download files or modify public data. The dataset was manually extracted from official sources; the CLI is an evidence importer, **not an autonomous web crawler**.

The default `--batch all` validates both batches. A full batch ID selects just that batch; unknown IDs fail before reading credentials. Each batch retains its own observation dates and original hashes. Coverage reporting counts distinct brands and lists brands without factual observations, not only extraction successes. CI now runs the dry run and regression tests.

## Configure the intended database

Use the **staging** Supabase project selected by the user. Put its `DATABASE_URL` and `DIRECT_URL` in `packages/database/.env`, following the local example. That file is ignored by Git. Do not put database passwords in chat, committed files, command-line arguments or `NEXT_PUBLIC_*` variables. Do not substitute a production URL. The target check verifies connection identity, not whether a project is staging; confirm the project in Supabase first.

The import loads only `packages/database/.env`, or uses an already exported `DATABASE_URL`. Existing process environment values take precedence. It does not load `apps/web/.env.local`. Automatic environment-file loading requires Node 20.12+; this workspace uses Node 20.20.2. Remote imports require `sslmode=require` or stronger.

## Migration safety gate

**Do not run the full migration history blindly on a populated database.** The earlier `20260729000000_phase3_nordicdrive_schema` migration contains `DROP TABLE ... CASCADE`. The new evidence migration itself is additive, but that does not make unapplied older migrations safe.

1. Back up the intended database and verify that it can be restored.
2. Inspect `_prisma_migrations` and run `prisma migrate status` using the intended migration connection. Reconcile existing schema/history on staging first. Do not mark a migration applied unless its actual schema changes are present.
3. Confirm that only the new evidence migration is pending before deploying to an existing populated database.
4. Generate the client and apply the reviewed migration through the existing deployment process.

```powershell
pnpm --filter @nordicdrive/database exec prisma migrate status --schema prisma/schema.prisma
pnpm db:generate
# Only after the history/backup checks above:
pnpm db:deploy
```

Prisma client generation can fail on Windows if the running Next.js server holds `query_engine-windows.dll.node`. Stop this project's development server, run `pnpm db:generate`, then restart it. Do not terminate unrelated Node applications. In this work session, full engine regeneration hit that lock; TypeScript checks still passed. Migration execution and real PostgreSQL import remain untested.

## Import reviewed source observations

The target argument is the **username, hostname, port and database from DATABASE_URL**, without a password. Include the project-qualified username when using a shared Supabase pooler, so another project on the same pooler host cannot be selected accidentally.

```powershell
pnpm catalog:import --target "postgres.PROJECT@YOUR_POOLER_HOST:6543/postgres"
# Or just the second batch, using the same confirmed staging identity:
pnpm catalog:import --batch norway-official-2026-09-12-v1 --target "postgres.PROJECT@YOUR_POOLER_HOST:6543/postgres"
```

After successful migration, both batches prepare 156 evidence rows: 60 dated source observations and 96 model/variant observations. The second batch alone prepares 31 rows. `createMany` with a unique content hash skips unchanged duplicates. The console reports inserted and skipped counts; it never displays the connection string. All new rows remain pending. The command performs no `Car`/`Variant` updates, deletion, media copying, migration or demo seeding.

Do not run `pnpm db:seed` as a substitute: the existing seed contains example data, not this verified-source collection.

## Important source findings

- [Polestar's Norwegian specifications](https://www.polestar.com/no/polestar-2/specifications) identify three Long range variants with distinct prices, output and range. Do not bring a global-market Standard range variant into Norway without a local offer.
- [Tesla Norway's warranty page](https://www.tesla.com/no_NO/support/vehicle-warranty) distinguishes battery mileage limits by variant. The Model Y product page did not yield usable current configuration specifications in this pass.
- [KGM Torres EVX](https://kgm-auto.no/modeller/torres-evx) presents conflicting luggage-volume values. The batch withholds this field rather than choosing one. Its [linked Norwegian price list](https://cdn.sanity.io/files/mcx434c9/production/c5a4af0f67e40bfa81ed3e415a6733b196f0091e.pdf) is recorded separately from the specification page.
- [Suzuki e VITARA](https://suzuki.no/modeller/evitara) has ambiguous charging/consumption labels and differing displayed prices. These fields remain absent pending brochure confirmation.
- [JAC E30X](https://jacmotors.no/modeller/e30x) contains conflicting weights, dimensions and battery wording. A page being official does not make every number internally consistent.
- [Kia's Norwegian importer](https://www.kia.no/) has a more current model lineup than the global `/no/` landing page retrieved. Its [EV9 page](https://www.kia.no/bil/ev9) contains differing RWD horsepower values, which are withheld.
- [Volvo EX60](https://www.volvocars.com/no/cars/ex60-electric/) explicitly qualifies some figures as preliminary. The batch retains that status rather than treating them as final certified WLTP values.
- [Volkswagen's terms](https://www.volkswagen.no/no/om-oss/bruksvilkar.html) do not grant reuse rights to website imagery. No Volkswagen images were added for publication.

Maserati and Mazda did not yield usable content. GWM/ORA Norwegian model availability remains unconfirmed; `gwm.no` is an unrelated business and Swedish-market prices must not be substituted. The 12 new-entry/status brands in the earlier checklist are outside this first batch.

### September 12 follow-up

Additional observations cover Citroen, CUPRA, firefly, Ford, MG, Opel, Peugeot, Renault, Toyota and XPENG. Key checks:

- [Citroen e-C3](https://www.citroen.no/modeller/e-c3.html) and the [Peugeot E-3008 price/specification PDF](https://www.peugeot.no/content/dam/peugeot/norway/prislister-og-brosjyrer/personbiler/Kundeprisliste_E-3008_2026.pdf) report 20-80% charging. The dedicated `charging20To80Minutes` field prevents comparison with a different charging window.
- [Opel's homepage](https://www.opel.no/) still displayed August-expired offers. No Opel starting price was collected in this batch; FWD and AWD cargo figures from the model page stay separate.
- [Ford Mustang Mach-E](https://www.ford.no/biler/mustang-mach-e) yielded zero-valued animation counters. Those are not specifications. Its image candidate depicts GT, not the priced RWD version, and must not be used as that trim's photo.
- [XPENG G6](https://www.xpeng.com/no/model/g6) and its linked Norwegian specification sheet disagree on AWD range. The batch withholds range and preserves the conflict for review.
- [MG MGS5](https://www.mgmotor.eu/nn-NO/model/mgs5) provides usable Comfort cash-price and warranty footnotes, but most dynamic specifications were unavailable.

Still without factual observations: Dongfeng, DS Automobiles, GWM/ORA, Hongqi, Jeep, Lexus, Maserati, Maxus, Mazda, Mercedes-Benz, MINI, Subaru and Voyah. Additional models and variants remain missing even for brands with observations.

Local verification: 17 regression tests and the two-batch dry run passed. PostgreSQL migration execution, persisted idempotence and RLS integration remain unverified until staging credentials are configured.

## Norwegian customer data contract

Complete this checklist for each exact Norwegian configuration, with per-field sources and dates. Unknowns stay absent and should eventually display as unavailable, never zero/false.

| Category               | Required editorial checks                                                                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity               | Brand, model, generation, model year, variant, drivetrain, body style, Norwegian availability and order/delivery dates                                                             |
| Price                  | Cash purchase in NOK, applicable VAT/fees, delivery location/cost, options, winter wheels, battery ownership, separate subscription cost, campaign expiry                          |
| Range                  | Combined WLTP, wheel/configuration basis; urban WLTP separately; independent winter/summer tests labelled separately, never invented winter estimates                              |
| Battery                | Usable and gross capacities separately, chemistry, preconditioning and heat-pump standard/optional status                                                                          |
| Charging               | AC power and phase support, compatibility with Norwegian 230V IT/400V TN supplies, DC peak, charging window/time and conditions, connector, V2L and Plug & Charge                  |
| Family/practicality    | Seats, ISOFIX positions, boot measurement/seat position, frunk, payload, braked/unbraked towing, roof load, ground clearance                                                       |
| Dimensions/performance | Length, width with/without mirrors, height, wheelbase, kW, metric horsepower basis, torque, acceleration and test/boost conditions                                                 |
| Safety                 | Euro NCAP test year/protocol and applicable variant/equipment; standard versus optional driver assistance                                                                          |
| Ownership              | Vehicle and battery warranty duration/mileage/retention/exclusions, service conditions, local dealer/service coverage                                                              |
| Media                  | Exact subject/generation, real photo versus render, source asset, rights holder, permission/licence evidence, attribution, territory, expiry and allowed editorial/advertising use |

`fields.ts` covers the numeric/feature subset collected so far, not this entire future contract. Additional fields require explicit units, validation and tests. Manufacturer sites cannot supply an independent winter test or third-party safety verification where they do not publish one; obtain the relevant primary test source separately.

## Publication work still required

1. Finish model/variant and brochure extraction for every brand. These batches cover only 37 brands with factual observations, and do not contain every model for those brands.
2. Resolve the flagged source conflicts, offers, option packages, exact model years and freshness. Obtain permitted structured feeds or manufacturer/importer confirmation where website extraction fails.
3. Obtain documented editorial image permissions or a suitable licence. Inspect that each asset is a real photograph of the right generation/trim, then place approved files in durable storage/CDN. Public accessibility of an image URL is not approval; do not hotlink these candidates into cards.
4. Build a reviewed promotion service mapping evidence to domain entities, supporting nullable unknowns and retaining provenance. Do not automatically derive one variant from unrelated model maxima/minima.
5. Connect the public catalogue/search/comparison/AI data source to approved database records. The existing public frontend still uses a static catalogue, so writing Prisma records alone will not update the visible pages.
6. Verify inserts, RLS, rollback/restore, media delivery and Norwegian/English displays on staging before production.

No background scraping job, automatic publication, deployment, or ongoing monitoring was created.
