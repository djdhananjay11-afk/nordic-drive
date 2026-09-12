import assert from "node:assert/strict";
import test from "node:test";
import { nordicCars } from "@/features/cars/data/nordic-cars";
import { catalogueNotice } from "@/features/cars/data/catalogue-status";
import { carJsonLd, carListJsonLd, createCarMetadata } from "./seo";

test("informational catalogue never implies live stock or verified commercial offers", () => {
  for (const car of nordicCars) {
    const schema = carJsonLd(car);
    assert.equal("offers" in schema, false);
    assert.equal("aggregateRating" in schema, false);
    assert.equal("vehicleSeatingCapacity" in schema, false);
    assert.equal(schema.name, `${car.brand} ${car.model}`);
    const description = createCarMetadata(car).description ?? "";
    assert.ok(!description.includes(String(car.winterRangeKm)));
    assert.ok(!description.includes(String(car.priceNok)));
  }
  assert.equal(carListJsonLd().name, "Electric vehicle catalogue for Norway");
});

test("catalogue warning exists in both supported languages", () => {
  assert.ok(catalogueNotice.no.includes("ikke ferdig verifisert"));
  assert.ok(catalogueNotice.en.includes("not yet verified"));
});
