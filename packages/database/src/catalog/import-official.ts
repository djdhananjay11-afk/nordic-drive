import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import type { Prisma } from "@prisma/client";
import { officialNorwayBatch } from "./batch-no-2026-09-11.js";
import { canonicalJson, prepareImport, requireDatabaseTarget, summarizeBatch } from "./plan.js";

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      apply: { type: "boolean", default: false },
      target: { type: "string" },
    },
    strict: true,
    allowPositionals: false,
  });
  const batch = officialNorwayBatch;
  const rows = prepareImport(batch);
  console.log(JSON.stringify(summarizeBatch(batch), null, 2));
  if (!values.apply) {
    console.log(
      `DRY RUN: ${rows.length} review rows validated. No database connection, downloads or public changes.`,
    );
    return;
  }

  // Dry runs never read credentials. Ignore the web app's environment and preview DBs.
  const envFile = fileURLToPath(new URL("../../.env", import.meta.url));
  if (existsSync(envFile)) {
    if (typeof process.loadEnvFile !== "function") {
      throw new Error(
        "Loading packages/database/.env requires Node 20.12+. Alternatively export DATABASE_URL in your shell.",
      );
    }
    process.loadEnvFile(envFile);
  }
  const target = requireDatabaseTarget(process.env.DATABASE_URL, values.target);
  const { PrismaClient } = await import("@prisma/client");
  const db = new PrismaClient({ log: [] });
  try {
    const result = await db.catalogEvidence.createMany({
      data: rows.map((row) => ({
        ...row,
        observedOn: new Date(`${row.observedOn}T00:00:00.000Z`),
        payload: JSON.parse(canonicalJson(row.payload)) as Prisma.InputJsonValue,
      })),
      skipDuplicates: true,
    });
    console.log(
      `Inserted ${result.count}; existing ${rows.length - result.count}. Target: ${target}. All new rows PENDING; published cars and images unchanged.`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  // Prisma error text may contain connection details. Do not log it or environment values.
  if (error instanceof Error && !error.name.startsWith("Prisma")) {
    console.error(error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted database URL]"));
  } else {
    console.error(
      "Database import failed. Check connection, TLS, migration status and trusted-role permissions. No public catalogue writes were attempted.",
    );
  }
  process.exitCode = 1;
});
