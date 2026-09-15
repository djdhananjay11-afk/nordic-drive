import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import type { Prisma } from "@prisma/client";
import { requireDatabaseTarget } from "./plan.js";
import { releaseRows } from "./release-plan.js";

async function main() {
  const { values } = parseArgs({
    options: {
      apply: { type: "boolean", default: false },
      target: { type: "string" },
      environment: { type: "string" },
    },
    strict: true,
  });
  const rows = releaseRows();
  console.log(
    `Starter catalogue: ${rows.length} sourced configurations; 0 licensed images. Unknown specifications remain absent.`,
  );
  if (!values.apply) return console.log("DRY RUN: no database connection or changes.");
  if (values.environment !== "staging")
    throw new Error(
      "Only --environment staging is supported. Production publishing requires a separate approval.",
    );
  const envFile = fileURLToPath(new URL("../../.env", import.meta.url));
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  requireDatabaseTarget(process.env.DATABASE_URL, values.target);
  const { PrismaClient } = await import("@prisma/client");
  const db = new PrismaClient({ log: [] });
  try {
    const result = await db.catalogEvidence.createMany({
      data: rows.map((row) => ({
        ...row,
        payload: row.payload as Prisma.InputJsonValue,
        reviewStatus: "APPROVED",
        reviewedAt: new Date(),
        reviewNotes:
          "Starter publication: listed facts checked against official Norwegian sources on 2026-09-12. Partial specifications; no image rights approval or independent testing implied.",
      })),
      skipDuplicates: true,
    });
    console.log(
      `Published ${result.count} new staging read-model records. Existing rows, demo cars and images were not modified.`,
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error(
    "Publication failed. Check staging target, credentials and CatalogEvidence migration. Database details are not logged.",
  );
  process.exitCode = 1;
});
