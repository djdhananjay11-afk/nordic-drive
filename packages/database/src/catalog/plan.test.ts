import assert from "node:assert/strict";
import test from "node:test";
import { officialNorwayBatch } from "./batch-no-2026-09-11.js";
import {
  canonicalJson,
  prepareImport,
  requireDatabaseTarget,
  summarizeBatch,
  validateBatch,
} from "./plan.js";

const sample = () => structuredClone(officialNorwayBatch);
const first = <T>(values: T[]): T => {
  const value = values[0];
  assert.ok(value);
  return value;
};

test("batch covers 50 source entries without claiming full specifications", () => {
  const summary = summarizeBatch(sample());
  assert.equal(summary.sources, 50);
  assert.equal(summary.completeness, "PARTIAL");
  assert.equal(summary.imagesApproved, 0);
  assert.equal(summary.publicCatalogueChanges, 0);
  assert.ok(summary.brandsWithModelObservations < summary.sources);
});

test("repeated runs have identical identities and preserve original observations", () => {
  const batch = sample();
  const before = structuredClone(batch);
  const rows = prepareImport(batch);
  assert.deepEqual(rows, prepareImport(batch));
  assert.deepEqual(batch, before);
  assert.equal(new Set(rows.map((row) => row.contentHash)).size, rows.length);
  assert.equal(rows.length, batch.sources.length + batch.records.length);
  assert.equal("reviewStatus" in first(rows), false);
});

test("hash is independent of batch label, but changes when an observation changes", () => {
  const batch = sample();
  const original = prepareImport(batch);
  batch.id = "renamed-batch";
  assert.deepEqual(
    prepareImport(batch).map((row) => row.contentHash),
    original.map((row) => row.contentHash),
  );
  const observation = first(batch.records);
  first(observation.facts).value = 300000;
  assert.notEqual(
    prepareImport(batch).find((row) => row.recordKey === observation.key)?.contentHash,
    original.find((row) => row.recordKey === observation.key)?.contentHash,
  );
});

test("canonical hashing sorts nested object properties", () => {
  assert.equal(
    canonicalJson({ b: { z: 1, a: 2 }, a: 0 }),
    canonicalJson({ a: 0, b: { a: 2, z: 1 } }),
  );
  assert.throws(() => canonicalJson(Number.NaN));
});

test("duplicate observations, brands and fields are rejected", () => {
  const batch = sample();
  batch.records.push(first(batch.records));
  assert.throws(() => validateBatch(batch), /Duplicate record/);
  const duplicateBrand = sample();
  duplicateBrand.sources.push(first(duplicateBrand.sources));
  assert.throws(() => validateBatch(duplicateBrand), /Duplicate or missing source/);
  const duplicateFact = sample();
  const observation = first(duplicateFact.records);
  observation.facts.push(first(observation.facts));
  assert.throws(() => validateBatch(duplicateFact), /duplicate field/);
});

test("wrong units, monthly payments and missing variant scope are rejected", () => {
  const batch = sample();
  first(first(batch.records).facts).unit = "EUR";
  assert.throws(() => validateBatch(batch), /Wrong unit/);
  const payment = sample();
  first(first(payment.records).facts).value = 4990;
  assert.throws(() => validateBatch(payment), /monthly payment/);
  const scope = sample();
  first(first(scope.records).facts).scope = "VARIANT";
  assert.throws(() => validateBatch(scope), /named variant/);
});

test("unknown values cannot masquerade as zero or non-finite numbers", () => {
  for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    const batch = sample();
    first(first(batch.records).facts).value = value;
    assert.throws(() => validateBatch(batch), /finite and positive/);
  }
});

test("source dates and source credentials are validated", () => {
  const batch = sample();
  first(batch.records).observedOn = "2026-02-30";
  assert.throws(() => validateBatch(batch), /Invalid observation date/);
  first(batch.records).observedOn = "2999-01-01";
  assert.throws(() => validateBatch(batch), /future/);
  const secret = sample();
  first(secret.sources).url = "https://user:password@example.com/";
  assert.throws(() => validateBatch(secret), /credential-free/);
});

test("failed extraction cannot supply accepted facts", () => {
  const batch = sample();
  const brand = first(batch.records).brandSlug;
  const source = batch.sources.find((entry) => entry.slug === brand);
  assert.ok(source);
  source.status = "EXTRACTION_BLOCKED";
  assert.throws(() => validateBatch(batch), /read official source/);
});

test("ambiguous fields stay absent and city range stays separate", () => {
  const kgm = officialNorwayBatch.records.find(
    (item) => item.key === "kgm/torres-evx-specifications",
  );
  assert.ok(kgm);
  assert.equal(kgm.facts.find((item) => item.field === "rangeWltpCombinedKm")?.value, 503);
  assert.equal(kgm.facts.find((item) => item.field === "rangeWltpCityKm")?.value, 664);
  assert.equal(
    kgm.facts.some((item) => item.field === "bootSeatsUpLitres"),
    false,
  );
  assert.equal(
    kgm.facts.some((item) => item.field === "heatPump"),
    false,
  );
});

test("media stays unapproved and preliminary figures stay labelled", () => {
  const allMedia = officialNorwayBatch.records.flatMap((item) => item.media);
  assert.ok(allMedia.length > 0);
  assert.ok(
    allMedia.every(
      (item) => item.rightsStatus === "UNVERIFIED" && item.visualStatus === "NOT_INSPECTED",
    ),
  );
  const volvo = officialNorwayBatch.records.find(
    (item) => item.key === "volvo/ex60-p12-preliminary",
  );
  assert.equal(
    volvo?.facts.find((item) => item.field === "rangeWltpCombinedKm")?.basis,
    "PRELIMINARY",
  );
});

test("database writes require an explicit matching project identity and TLS", () => {
  const url = "postgresql://postgres.project:SECRET@pool.example.com:6543/postgres?sslmode=require";
  const target = "postgres.project@pool.example.com:6543/postgres";
  assert.equal(requireDatabaseTarget(url, target), target);
  assert.throws(() => requireDatabaseTarget(undefined, target), /not configured/);
  assert.throws(() => requireDatabaseTarget(url, undefined), /confirmation/);
  assert.throws(
    () => requireDatabaseTarget(url, "postgres.other@pool.example.com:6543/postgres"),
    /mismatched/,
  );
  assert.throws(
    () => requireDatabaseTarget(url.replace("sslmode=require", "sslmode=disable"), target),
    /TLS/,
  );
  assert.equal(
    requireDatabaseTarget(
      "postgresql://dev:SECRET@localhost:5432/nordicdrive",
      "dev@localhost:5432/nordicdrive",
    ),
    "dev@localhost:5432/nordicdrive",
  );
});
