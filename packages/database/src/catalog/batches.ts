import { officialNorwayBatch } from "./batch-no-2026-09-11.js";
import { officialNorwaySeptember12Batch } from "./batch-no-2026-09-12.js";
import { officialNorwayFollowupBatch } from "./batch-no-2026-09-12-b.js";
import { prepareImport, summarizeBatch } from "./plan.js";
import type { EvidenceBatch } from "./types.js";

const batches: readonly EvidenceBatch[] = [officialNorwayBatch, officialNorwaySeptember12Batch, officialNorwayFollowupBatch];

export function selectBatches(id = "all"): readonly EvidenceBatch[] {
  if (id === "all") return batches;
  const batch = batches.find((entry) => entry.id === id);
  if (!batch)
    throw new Error(`Unknown batch. Use all or: ${batches.map((entry) => entry.id).join(", ")}`);
  return [batch];
}

export function prepareBatches(selected: readonly EvidenceBatch[]) {
  if (!selected.length || new Set(selected.map((batch) => batch.id)).size !== selected.length) {
    throw new Error("Select at least one batch, with no duplicate batch IDs.");
  }
  const rows = selected.flatMap(prepareImport);
  return [...new Map(rows.map((row) => [row.contentHash, row])).values()];
}

export function summarizeBatches(selected: readonly EvidenceBatch[]) {
  const rows = prepareBatches(selected);
  const summaries = selected.map(summarizeBatch);
  const sources = new Map(
    selected.flatMap((batch) => batch.sources).map((source) => [source.slug, source]),
  );
  const brandsWithFacts = new Set(
    selected.flatMap((batch) =>
      batch.records.filter((record) => record.facts.length).map((record) => record.brandSlug),
    ),
  );
  return {
    completeness: "PARTIAL",
    batches: summaries,
    evidenceRows: rows.length,
    uniqueBrands: sources.size,
    brandsWithFacts: brandsWithFacts.size,
    brandsWithoutFacts: [...sources.values()]
      .filter((source) => !brandsWithFacts.has(source.slug))
      .map((source) => source.name),
    facts: summaries.reduce((count, summary) => count + summary.facts, 0),
    mediaCandidates: summaries.reduce((count, summary) => count + summary.mediaCandidates, 0),
    imagesApproved: 0,
    publicCatalogueChanges: 0,
  };
}
