import type { NordicCar } from "@/features/cars/data/nordic-cars";
import type { SearchIntent } from "./search-parser";

export function matchesSearchConstraints(intent: SearchIntent, car: NordicCar): boolean {
  return (
    (intent.budgetMaxNok === undefined || car.priceNok <= intent.budgetMaxNok) &&
    (intent.budgetMonthlyMaxNok === undefined || car.monthlyNok <= intent.budgetMonthlyMaxNok) &&
    (intent.minRangeKm === undefined || car.rangeWltpKm >= intent.minRangeKm) &&
    (intent.minSeats === undefined || car.seats >= intent.minSeats) &&
    (intent.bodyType === undefined || car.segment === intent.bodyType)
  );
}
