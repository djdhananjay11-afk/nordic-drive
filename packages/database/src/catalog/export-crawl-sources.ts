import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { sources } from "./sources-no.js";
import { selectBatches } from "./batches.js";

const directory = new URL("../../../../tools/catalogue-scraper/", import.meta.url);
const records = selectBatches().flatMap((batch) => batch.records);
const manifest = sources.map((source) => {
  const host = new URL(source.url).hostname;
  const seeds = [
    source.url,
    ...records
      .filter((record) => record.brandSlug === source.slug)
      .map((record) => record.sourceUrl),
  ];
  // A source citation must not silently expand the crawler's network allowlist.
  const seedUrls = [...new Set(seeds)].filter((url) => new URL(url).hostname === host);
  const locale = new URL(source.url).pathname.match(
    /^\/(no_NO|nn-NO|nb-NO|nb-no|no|norway)(?=\/|$)/,
  )?.[0];
  return {
    slug: source.slug,
    name: source.name,
    enabled: source.status !== "NORWAY_UNCONFIRMED",
    allowedHosts: [host],
    pathPrefixes: locale ? [locale] : ["/"],
    seedUrls,
    notes: source.notes,
  };
});
await mkdir(directory, { recursive: true });
await writeFile(new URL("sources.json", directory), JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `Exported ${manifest.length} source entries to ${fileURLToPath(directory)}sources.json`,
);
