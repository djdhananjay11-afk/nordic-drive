import assert from "node:assert/strict";
import test from "node:test";
import { nordicCars } from "@/features/cars/data/nordic-cars";
import { parseSearchIntentLocally } from "./search-parser";
import { matchesSearchConstraints } from "./search-constraints";

test("purchase budgets preserve explicit NOK amounts and k shorthand", () => {
  for (const query of [
    "EV under 400000 NOK",
    "EV under 400 000 kr",
    "EV under 400,000 NOK",
    "EV under 400k",
  ]) {
    assert.equal(parseSearchIntentLocally(query).budgetMaxNok, 400000, query);
  }
  assert.equal(parseSearchIntentLocally("under 5000 NOK").budgetMaxNok, 5000);
});

test("monthly budgets are not inflated or used as purchase budgets", () => {
  for (const query of [
    "Best monthly offer under 5000 NOK",
    "Under 5,000 NOK per month",
    "Elbil under 5000 kr per mnd",
  ]) {
    const intent = parseSearchIntentLocally(query);
    assert.equal(intent.budgetMaxNok, undefined, query);
    assert.equal(intent.budgetMonthlyMaxNok, 5000, query);
    assert.ok(
      nordicCars
        .filter((car) => matchesSearchConstraints(intent, car))
        .every((car) => car.monthlyNok <= 5000),
    );
  }
});

test("all search candidates satisfy explicit constraints and impossible budgets return no cars", () => {
  const intent = parseSearchIntentLocally("SUV under 600000 NOK with 450 km range and 5 seats");
  const matches = nordicCars.filter((car) => matchesSearchConstraints(intent, car));
  assert.ok(matches.length > 0);
  assert.ok(
    matches.every(
      (car) =>
        car.priceNok <= 600000 && car.rangeWltpKm >= 450 && car.seats >= 5 && car.segment === "SUV",
    ),
  );
  assert.equal(
    nordicCars.filter((car) =>
      matchesSearchConstraints(parseSearchIntentLocally("under 100 NOK"), car),
    ).length,
    0,
  );
});
