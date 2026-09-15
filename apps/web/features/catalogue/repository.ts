import "server-only";
import { cache } from "react";
import { releaseId, releaseVehicles } from "@nordicdrive/database/catalogue";
import { releaseRows } from "@nordicdrive/database/catalogue-plan";

export const getCatalogue = cache(async () => {
  const mode = process.env.NORDICDRIVE_CATALOGUE_SOURCE ?? "snapshot";
  if (mode === "snapshot") return releaseVehicles;
  if (mode !== "database") throw new Error("Invalid catalogue source configuration.");
  if (!process.env.DATABASE_URL) throw new Error("Database catalogue mode requires DATABASE_URL.");
  const { prisma } = await import("@/lib/db");
  const rows = releaseRows();
  const approved = await prisma.catalogEvidence.findMany({
    where: {
      batchId: releaseId,
      market: "NO",
      reviewStatus: "APPROVED",
      deletedAt: null,
      contentHash: { in: rows.map((row) => row.contentHash) },
    },
    select: { contentHash: true },
    take: rows.length,
  });
  const hashes = new Set(approved.map((row) => row.contentHash));
  // Only exact reviewed revisions are publishable. An outage never resurrects demo data.
  return releaseVehicles.filter((vehicle) =>
    rows.some((row) => row.recordKey === vehicle.id && hashes.has(row.contentHash)),
  );
});
