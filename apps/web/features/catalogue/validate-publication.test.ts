import test from "node:test";
import assert from "node:assert/strict";
import { releaseVehicles } from "@nordicdrive/database/catalogue";
import { parsePublication } from "./validate-publication";
import { isCuratedRelease } from "./config";

test("full application is default; curated mode is explicit", () => {
  const original = process.env.NORDICDRIVE_RELEASE_MODE;
  try {
    delete process.env.NORDICDRIVE_RELEASE_MODE;
    assert.equal(isCuratedRelease(), false);
    process.env.NORDICDRIVE_RELEASE_MODE = "full";
    assert.equal(isCuratedRelease(), false);
    process.env.NORDICDRIVE_RELEASE_MODE = "curated";
    assert.equal(isCuratedRelease(), true);
  } finally {
    if (original === undefined) delete process.env.NORDICDRIVE_RELEASE_MODE;
    else process.env.NORDICDRIVE_RELEASE_MODE = original;
  }
});

test("reviewed payloads are validated without a two-record ID allowlist", () => {
  for (const vehicle of releaseVehicles) assert.ok(parsePublication(vehicle, vehicle.id));
  const vehicle = {
    ...releaseVehicles[0]!,
    id: "new-reviewed-vehicle",
    slug: "new-reviewed-vehicle",
  };
  assert.ok(parsePublication(vehicle, vehicle.id));
  assert.equal(parsePublication(vehicle, "different-record"), null);
});

test("raw scraped records and unsafe publication fields fail closed", () => {
  assert.equal(parsePublication({ kind: "SCRAPED_PAGE_OBSERVATION" }, "scraped"), null);
  const vehicle = releaseVehicles[0]!;
  for (const patch of [
    { galleryUrl: "javascript:alert(1)" },
    { checkedOn: "2026-02-30" },
    { checkedOn: "2999-01-01" },
    { facts: { range: { value: 600, unit: "km", source: 99 } } },
    { facts: { invented: { value: 600, unit: "km", source: 0 } } },
    {
      image: {
        path: "//evil.example/car.jpg",
        alt: { no: "Bil", en: "Car" },
        checkedOn: "2026-01-01",
        permissionReference: "test",
      },
    },
  ])
    assert.equal(parsePublication({ ...vehicle, ...patch }, vehicle.id), null);
});
