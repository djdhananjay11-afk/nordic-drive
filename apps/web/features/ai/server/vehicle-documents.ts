import { enrichCar, type ComparisonVehicle } from "@/features/cars/comparison/comparison-engine";
import { getEfficiencyScore, nordicCars } from "@/features/cars/data/nordic-cars";

export type VehicleDocument = {
  id: string;
  title: string;
  car: ComparisonVehicle;
  text: string;
  tags: string[];
};

export function getVehicleDocuments(): VehicleDocument[] {
  return nordicCars.map((car) => {
    const enrichedCar = enrichCar(car);
    const tags = [
      car.brand,
      car.segment,
      car.drivetrain,
      car.seats >= 7 ? "seven seats family" : "five seats",
      car.priceNok <= 600000 ? "under 600000 NOK affordable value" : "premium luxury",
      car.rangeWltpKm >= 550 ? "long range" : "balanced range",
      car.chargingMinutes <= 22 ? "fast charging road trip" : "standard charging",
      car.towingKg >= 2000 ? "high towing" : "light towing",
      car.heatPump ? "heat pump winter" : "no heat pump",
      ...car.highlights,
    ];

    return {
      id: enrichedCar.key,
      title: `${car.brand} ${car.model}`,
      car: enrichedCar,
      tags,
      text: [
        `${car.brand} ${car.model}.`,
        car.tagline,
        `${car.segment} EV with ${car.seats} seats, ${car.drivetrain}, ${car.rangeWltpKm} km WLTP range, ${car.winterRangeKm} km winter range, ${car.batteryKwh} kWh battery, ${car.fastChargingKw} kW fast charging, 10-80 percent in ${car.chargingMinutes} minutes.`,
        `Norway price ${car.priceNok} NOK, monthly estimate ${car.monthlyNok} NOK, winter efficiency ${getEfficiencyScore(car)} km/kWh.`,
        `Power ${enrichedCar.horsepower} hp, safety score ${enrichedCar.safetyScore}, interior score ${enrichedCar.interiorScore}, boot ${enrichedCar.bootLiters} liters, towing ${car.towingKg} kg.`,
        `Warranty ${enrichedCar.warrantyYears} years and battery warranty ${enrichedCar.batteryWarrantyYears} years.`,
        tags.join(", "),
      ].join(" "),
    };
  });
}
