import assert from "node:assert/strict";
import test from "node:test";
import { filterVehicles, releaseVehicles, selectVehicles, vehiclePath } from "./release.js";
import { releaseRows } from "./release-plan.js";

test("starter catalogue has unique, variant-specific, sourced facts and no invented unknowns", () => {
  assert.equal(new Set(releaseVehicles.map((v) => v.id)).size, 2);
  for (const vehicle of releaseVehicles) {
    assert.ok(vehicle.variant);
    assert.match(vehiclePath(vehicle), /^\/cars\/[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.equal(vehicle.image, null);
    assert.equal(vehicle.facts.winter, undefined);
    assert.equal(vehicle.facts.safety, undefined);
    assert.equal(vehicle.facts.warranty, undefined);
    for (const fact of Object.values(vehicle.facts)) {
      assert.ok(vehicle.sources[fact.source]);
      assert.equal(new URL(vehicle.sources[fact.source]!.url).protocol, "https:");
      if (typeof fact.value === "number") assert.ok(Number.isFinite(fact.value) && fact.value > 0);
    }
  }
});

test("search, price and range filters operate on the same release records", () => {
  assert.equal(filterVehicles(releaseVehicles, " EHS5 ", "").length, 1);
  assert.equal(filterVehicles(releaseVehicles, "", "", 500000)[0]?.brand, "Hongqi");
  assert.equal(filterVehicles(releaseVehicles, "", "", undefined, 600)[0]?.brand, "Polestar");
  assert.equal(filterVehicles(releaseVehicles, "", "tesla").length, 0);
  const unknown = { ...releaseVehicles[0]!, facts: {} };
  assert.equal(filterVehicles([unknown], "", "", 999999).length, 0);
});

test("comparison starts empty, deduplicates and ignores stale demo IDs", () => {
  assert.deepEqual(selectVehicles(releaseVehicles, []), []);
  const id = releaseVehicles[0]!.id;
  assert.equal(selectVehicles(releaseVehicles, [id, id, "tesla-model-y-long-range"]).length, 1);
  const expanded = Array.from({ length: 5 }, (_, i) => ({ ...releaseVehicles[0]!, id: `v-${i}` }));
  assert.equal(
    selectVehicles(
      expanded,
      expanded.map((v) => v.id),
    ).length,
    4,
  );
});

test("publication hashes are stable and track the exact visible payload", () => {
  assert.deepEqual(releaseRows(), releaseRows());
  const rows = releaseRows();
  assert.equal(new Set(rows.map((r) => r.contentHash)).size, 2);
  assert.deepEqual(rows[0]?.payload, releaseVehicles[0]);
});
