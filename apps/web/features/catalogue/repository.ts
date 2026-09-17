import "server-only";
import { cache } from "react";
import { releaseVehicles, type CatalogueVehicle } from "@nordicdrive/database/catalogue";
import { parsePublication } from "./validate-publication";

export const getCatalogue = cache(async () => {
  const mode =
    process.env.NORDICDRIVE_CATALOGUE_SOURCE ??
    (process.env.DATABASE_URL ? "database" : "snapshot");
  if (mode === "snapshot") return releaseVehicles;
  if (mode !== "database") throw new Error("Invalid catalogue source configuration.");
  if (!process.env.DATABASE_URL) throw new Error("Database catalogue mode requires DATABASE_URL.");
  const { prisma } = await import("@/lib/db");
  const vehicles = new Map<string, CatalogueVehicle>();
  let cursor: string | undefined;
  for (let page = 0; page < 20; page++) {
    const approved = await prisma.catalogEvidence.findMany({
      where: { market: "NO", reviewStatus: "APPROVED", reviewedAt: { not: null }, deletedAt: null },
      select: { id: true, recordKey: true, payload: true },
      orderBy: [{ observedOn: "desc" }, { updatedAt: "desc" }, { id: "asc" }],
      take: 500,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    for (const row of approved) {
      const vehicle = parsePublication(row.payload, row.recordKey);
      if (vehicle && !vehicles.has(vehicle.id)) vehicles.set(vehicle.id, vehicle);
    }
    if (approved.length < 500) return [...vehicles.values()];
    cursor = approved.at(-1)!.id;
  }
  // Fail visibly rather than silently returning an incomplete publication set.
  throw new Error("Reviewed catalogue exceeds the configured read limit.");
});
