import {
  buildComparison,
  resolveComparisonVehicles,
  type ComparisonResult,
} from "@/features/cars/comparison/comparison-engine";
import { generateOpenAIJson } from "@/features/ai/server/openai-client";

export type AIComparisonSummary = {
  title: string;
  summary: string;
  bestFor: Array<{
    label: string;
    car: string;
    reason: string;
  }>;
};

export async function summarizeComparison(input: {
  vehicles?: string | string[] | null | undefined;
  add?: string | string[] | null | undefined;
}) {
  const comparison = buildComparison(resolveComparisonVehicles(input));
  const fallback = createFallbackComparisonSummary(comparison);

  return generateOpenAIJson<AIComparisonSummary>(
    {
      maxOutputTokens: 700,
      system:
        "You are NordicDrive AI. Summarize EV comparisons for Norwegian buyers. Be concise, specific, and balanced. Return JSON only.",
      user: `Comparison data: ${JSON.stringify({
        vehicles: comparison.vehicles.map((car) => ({
          batteryKwh: car.batteryKwh,
          brand: car.brand,
          chargingMinutes: car.chargingMinutes,
          fastChargingKw: car.fastChargingKw,
          model: car.model,
          priceNok: car.priceNok,
          safetyScore: car.safetyScore,
          winterRangeKm: car.winterRangeKm,
        })),
        scores: comparison.scores,
      })}\nReturn JSON with title, summary, bestFor array of {label, car, reason}.`,
    },
    fallback,
  );
}

function createFallbackComparisonSummary(comparison: ComparisonResult): AIComparisonSummary {
  const scoreLeader = comparison.scores[0];
  const winner = comparison.vehicles.find((car) => car.key === scoreLeader?.carKey) ?? comparison.vehicles[0];
  const rangeLeader = findBest(comparison, "winterRangeKm");
  const chargingLeader = findBest(comparison, "chargingMinutes");
  const valueLeader = [...comparison.vehicles].sort(
    (left, right) => right.winterRangeKm / right.priceNok - left.winterRangeKm / left.priceNok,
  )[0];

  return {
    bestFor: [
      {
        car: rangeLeader ? `${rangeLeader.brand} ${rangeLeader.model}` : "No vehicle",
        label: "Long winter trips",
        reason: rangeLeader ? `${rangeLeader.winterRangeKm} km estimated winter range.` : "Add vehicles to compare.",
      },
      {
        car: chargingLeader ? `${chargingLeader.brand} ${chargingLeader.model}` : "No vehicle",
        label: "Fast charging",
        reason: chargingLeader ? `${chargingLeader.chargingMinutes} minute 10-80% charging.` : "Add vehicles to compare.",
      },
      {
        car: valueLeader ? `${valueLeader.brand} ${valueLeader.model}` : "No vehicle",
        label: "Value",
        reason: valueLeader ? "Strong winter range per krone." : "Add vehicles to compare.",
      },
    ],
    summary: winner
      ? `${winner.brand} ${winner.model} is the strongest all-rounder in this set based on NordicDrive scoring.`
      : "Add vehicles to generate a comparison summary.",
    title: winner ? `${winner.brand} ${winner.model} leads` : "Comparison summary",
  };
}

function findBest(comparison: ComparisonResult, metricId: string) {
  const row = comparison.rows.find((candidate) => candidate.id === metricId);
  const cell = row?.cells.find((candidate) => candidate.isBest);
  return comparison.vehicles.find((car) => car.key === cell?.carKey);
}
