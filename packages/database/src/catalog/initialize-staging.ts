import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { PrismaClient, type Prisma } from "@prisma/client";
import { canonicalJson, requireDatabaseTarget } from "./plan.js";
import { prepareBatches, selectBatches } from "./batches.js";
import { releaseRows } from "./release-plan.js";

const root = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(import.meta.url);
const prismaCli = require.resolve("prisma/build/index.js");
const schema = "prisma/schema.prisma";
const securityFile = `${root}prisma/migrations/20260915000000_server_only_rls/migration.sql`;
const baselineMigrations = [
  "20260531000000_init",
  "20260729000000_phase3_nordicdrive_schema",
  "20260911000000_catalog_evidence",
  "20260915000000_server_only_rls",
];

function prisma(args: string[], input?: string): string {
  const result = spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: root,
    input,
    env: { ...process.env, DATABASE_URL: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 8 * 1024 * 1024,
  });
  // Prisma output can contain connection identifiers; never echo it to logs.
  if (result.status !== 0) throw new Error(`Prisma ${args.slice(0, 2).join(" ")} failed.`);
  return result.stdout;
}

async function main() {
  const { values } = parseArgs({
    options: {
      apply: { type: "boolean", default: false },
      environment: { type: "string" },
      target: { type: "string" },
    },
    strict: true,
  });
  const observations = prepareBatches(selectBatches());
  const reviewed = releaseRows();
  const migrationNames = readdirSync(`${root}prisma/migrations`, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (JSON.stringify(migrationNames) !== JSON.stringify(baselineMigrations)) {
    throw new Error("Migration history changed; review this baseline before initialization.");
  }
  console.log(
    JSON.stringify({ evidenceRows: observations.length, reviewedConfigurations: reviewed.length }),
  );
  if (!values.apply) return console.log("DRY RUN: no database connection or writes.");
  if (values.environment !== "staging") throw new Error("Only staging is supported.");
  process.loadEnvFile(`${root}.env`);
  const connection = process.env.DIRECT_URL;
  if (!connection) throw new Error("DIRECT_URL is required.");
  requireDatabaseTarget(connection, values.target);
  const db = new PrismaClient({ datasources: { db: { url: connection } }, log: [] });
  try {
    const relations = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'S')
    `;
    if (Number(relations[0]?.count) !== 0) {
      throw new Error(
        "Initialization requires an empty public schema. Existing databases are never reset.",
      );
    }
    const ddl = prisma([
      "migrate",
      "diff",
      "--from-empty",
      "--to-schema-datamodel",
      schema,
      "--script",
    ]);
    if (/^\s*(DROP|TRUNCATE|DELETE)\b/im.test(ddl))
      throw new Error("Non-additive baseline rejected.");
    const security = readFileSync(securityFile, "utf8");
    const guardedDdl = `BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';
SELECT pg_advisory_xact_lock(734629101);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','S')) THEN
    RAISE EXCEPTION 'Refusing to initialize a nonempty schema';
  END IF;
END $$;
${ddl}
ALTER TABLE "CatalogEvidence" ADD CONSTRAINT "CatalogEvidence_market_check" CHECK ("market" = 'NO');
ALTER TABLE "CatalogEvidence" ADD CONSTRAINT "CatalogEvidence_hash_check" CHECK ("contentHash" ~ '^[a-f0-9]{64}$');
${security}
COMMIT;`;
    prisma(["db", "execute", "--stdin", "--schema", schema], guardedDdl);
    console.log(
      "Current schema created atomically with RLS. Historical reset SQL was not executed.",
    );

    for (const migration of baselineMigrations) {
      prisma(["migrate", "resolve", "--applied", migration, "--schema", schema]);
      console.log(`Baselined: ${migration}`);
    }
    // The migration-history table is created by Prisma resolve after the first transaction.
    prisma(["db", "execute", "--stdin", "--schema", schema], security);
    const imported = await db.$transaction(
      async (tx) => {
        const pending = await tx.catalogEvidence.createMany({
          data: observations.map((row) => ({
            ...row,
            observedOn: new Date(`${row.observedOn}T00:00:00Z`),
            payload: JSON.parse(canonicalJson(row.payload)) as Prisma.InputJsonValue,
            reviewStatus: "PENDING",
          })),
          skipDuplicates: true,
        });
        const approved = await tx.catalogEvidence.createMany({
          data: reviewed.map((row) => ({
            ...row,
            payload: row.payload as Prisma.InputJsonValue,
            reviewStatus: "APPROVED",
            reviewedAt: new Date(),
            reviewNotes:
              "Existing reviewed source snapshot, checked 2026-09-12. Partial specifications; no licensed images.",
          })),
          skipDuplicates: true,
        });
        return { pending: pending.count, approved: approved.count };
      },
      { timeout: 30_000 },
    );
    console.log(JSON.stringify({ imported }));
    console.log("No demo seeds, user accounts, speculative car variants or images were inserted.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  // A failed post-create baseline must be repaired, never retried using a reset.
  console.error(
    error instanceof Error && error.message.startsWith("Prisma ")
      ? error.message
      : "Staging initialization failed. Check connectivity, empty-schema guard and migration history. Credentials suppressed.",
  );
  process.exitCode = 1;
});
