import { createHash } from "node:crypto";
import { fieldUnits } from "./fields.js";
import type { EvidenceBatch, EvidenceRecord, Fact } from "./types.js";

function requireCondition(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

function validateUrl(value: string): void {
  const url = new URL(value);
  requireCondition(
    url.protocol === "https:" && !url.username && !url.password,
    "Sources must use credential-free HTTPS URLs.",
  );
  requireCondition(
    url.hostname.includes(".") && url.hostname !== "127.0.0.1",
    "Sources must use public hostnames.",
  );
}

function validateDate(value: string, today: string): void {
  requireCondition(/^\d{4}-\d{2}-\d{2}$/.test(value), "Invalid observation date.");
  const date = new Date(`${value}T00:00:00.000Z`);
  requireCondition(
    !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value),
    "Invalid observation date.",
  );
  requireCondition(value <= today, "Observation date cannot be in the future.");
}

function validateFact(fact: Fact, record: EvidenceRecord): void {
  requireCondition(Object.hasOwn(fieldUnits, fact.field), `Unknown field: ${fact.field}`);
  requireCondition(fact.unit === fieldUnits[fact.field], `Wrong unit for ${fact.field}`);
  requireCondition(["MODEL", "VARIANT"].includes(fact.scope), "Invalid fact scope.");
  requireCondition(
    ["STATED", "FROM", "UP_TO", "PRELIMINARY"].includes(fact.basis),
    "Invalid measurement basis.",
  );
  requireCondition(
    fact.qualification.trim().length > 0,
    "Every fact needs its measurement/offer qualification.",
  );
  requireCondition(
    fact.scope !== "VARIANT" || record.variantName?.trim(),
    "Variant-scoped facts require a named variant.",
  );
  if (fact.unit === "boolean") {
    requireCondition(
      typeof fact.value === "boolean",
      "Feature availability must be boolean, not a guess/string.",
    );
  } else if (fact.unit === "enum") {
    const allowed =
      fact.field === "drivetrain" ? ["AWD", "FWD", "RWD"] : ["CCS", "TYPE_2", "CHADEMO", "NACS"];
    requireCondition(
      typeof fact.value === "string" && allowed.includes(fact.value),
      "Invalid enumerated fact.",
    );
  } else {
    requireCondition(
      typeof fact.value === "number" && Number.isFinite(fact.value) && fact.value > 0,
      "Numeric facts must be finite and positive; omit unknowns.",
    );
    if (["NOK", "mm", "count", "year"].includes(fact.unit)) {
      requireCondition(Number.isInteger(fact.value), "This field requires an integer.");
    }
    if (fact.field === "priceFromNok") {
      requireCondition(
        fact.value >= 10000 && fact.basis === "FROM",
        "Car starting price must not be a monthly payment.",
      );
    }
    if (fact.field.startsWith("rangeWltp"))
      requireCondition(fact.value <= 2000, "Implausible passenger-car range.");
    if (fact.field.startsWith("battery") && fact.unit === "kWh")
      requireCondition(fact.value <= 500, "Implausible passenger-car battery capacity.");
    if (fact.unit === "%") requireCondition(fact.value <= 100, "Invalid percentage.");
  }
}

export function validateBatch(
  batch: EvidenceBatch,
  today = new Date().toISOString().slice(0, 10),
): void {
  requireCondition(
    batch.schemaVersion === 1 && batch.market === "NO",
    "Unsupported schema version or market.",
  );
  requireCondition(
    batch.completeness === "PARTIAL",
    "This import cannot certify catalogue completeness.",
  );
  requireCondition(/^[a-z0-9-]+$/.test(batch.id), "Invalid batch ID.");
  validateDate(batch.observedOn, today);
  const brands = new Map(batch.sources.map((item) => [item.slug, item]));
  requireCondition(
    brands.size === batch.sources.length && brands.size > 0,
    "Duplicate or missing source entries.",
  );
  for (const entry of batch.sources) {
    requireCondition(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug), "Invalid brand slug.");
    requireCondition(
      entry.name.trim() && entry.notes.trim(),
      "Source needs name and coverage notes.",
    );
    requireCondition(
      ["CONTENT_READ", "EXTRACTION_BLOCKED", "NORWAY_UNCONFIRMED"].includes(entry.status),
      "Invalid source status.",
    );
    validateUrl(entry.url);
  }
  const keys = new Set<string>();
  for (const record of batch.records) {
    requireCondition(!keys.has(record.key), `Duplicate record: ${record.key}`);
    keys.add(record.key);
    requireCondition(
      record.key.startsWith(`${record.brandSlug}/`) && !record.key.endsWith("/source"),
      "Invalid record key.",
    );
    requireCondition(
      brands.get(record.brandSlug)?.status === "CONTENT_READ",
      "Facts require a read official source.",
    );
    requireCondition(record.modelName?.trim(), "Model observations require a model name.");
    requireCondition(
      record.facts.length > 0 || record.media.length > 0,
      "Empty model observation.",
    );
    validateDate(record.observedOn, today);
    validateUrl(record.sourceUrl);
    const fields = new Set<string>();
    for (const fact of record.facts) {
      requireCondition(!fields.has(fact.field), `Conflicting duplicate field: ${fact.field}`);
      fields.add(fact.field);
      validateFact(fact, record);
    }
    for (const media of record.media) {
      validateUrl(media.url);
      validateUrl(media.sourceUrl);
      requireCondition(media.subject.trim(), "Media needs a subject for subsequent visual review.");
      requireCondition(
        media.rightsStatus === "UNVERIFIED" && media.visualStatus === "NOT_INSPECTED",
        "This collector cannot approve images for publication.",
      );
      requireCondition(
        ["NOT_CHECKED", "FETCH_FAILED"].includes(media.availability),
        "Invalid media availability.",
      );
    }
  }
}

// Object-key order cannot produce duplicate evidence; array order remains meaningful.
export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "number") {
    requireCondition(Number.isFinite(value), "Cannot hash non-finite numbers.");
    return JSON.stringify(value);
  }
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  requireCondition(
    typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype,
    "Only plain JSON can be imported.",
  );
  return `{${Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
    .join(",")}}`;
}

export function prepareImport(batch: EvidenceBatch) {
  validateBatch(batch);
  const sources = batch.sources.map((entry) => ({
    recordKey: `${entry.slug}/source`,
    brandSlug: entry.slug,
    modelName: null,
    variantName: null,
    observedOn: batch.observedOn,
    sourceUrl: entry.url,
    payload: { schemaVersion: batch.schemaVersion, kind: "SOURCE", source: entry },
  }));
  const records = batch.records.map((record) => ({
    recordKey: record.key,
    brandSlug: record.brandSlug,
    modelName: record.modelName ?? null,
    variantName: record.variantName ?? null,
    observedOn: record.observedOn,
    sourceUrl: record.sourceUrl,
    payload: { schemaVersion: batch.schemaVersion, kind: "MODEL_OBSERVATION", record },
  }));
  return [...sources, ...records].map((row) => ({
    ...row,
    batchId: batch.id,
    market: batch.market,
    contentHash: createHash("sha256")
      .update(canonicalJson({ ...row, market: batch.market }))
      .digest("hex"),
  }));
}

export function summarizeBatch(batch: EvidenceBatch) {
  validateBatch(batch);
  return {
    batch: batch.id,
    completeness: batch.completeness,
    sources: batch.sources.length,
    sourcesWithReadableContent: batch.sources.filter((item) => item.status === "CONTENT_READ")
      .length,
    sourcesBlockedOrUnconfirmed: batch.sources
      .filter((item) => item.status !== "CONTENT_READ")
      .map((item) => item.name),
    modelObservations: batch.records.length,
    brandsWithModelObservations: new Set(batch.records.map((item) => item.brandSlug)).size,
    facts: batch.records.reduce((count, item) => count + item.facts.length, 0),
    mediaCandidates: batch.records.reduce((count, item) => count + item.media.length, 0),
    imagesApproved: 0,
    publicCatalogueChanges: 0,
  };
}

export function requireDatabaseTarget(
  connection: string | undefined,
  expected: string | undefined,
): string {
  requireCondition(connection, "DATABASE_URL is not configured. No database changes made.");
  const url = new URL(connection);
  requireCondition(
    ["postgresql:", "postgres:"].includes(url.protocol),
    "A PostgreSQL connection is required.",
  );
  requireCondition(
    url.username && url.pathname.length > 1,
    "Database username and database name are required.",
  );
  const label = `${decodeURIComponent(url.username)}@${url.hostname}:${url.port || "5432"}${url.pathname}`;
  requireCondition(
    expected === label,
    "Target confirmation is missing or mismatched. Use --target username@hostname:port/database (never include the password).",
  );
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    requireCondition(
      ["require", "verify-ca", "verify-full"].includes(url.searchParams.get("sslmode") ?? ""),
      "Remote database imports require TLS (sslmode=require or stronger).",
    );
  }
  return label;
}
