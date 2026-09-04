import { semanticVehicleSearch } from "@/features/ai/server/vector-search";
import { getVehicleDocuments } from "@/features/ai/server/vehicle-documents";
import { parseSearchIntent, type SearchIntent } from "@/features/ai/server/search-parser";
import { generateOpenAIJson } from "@/features/ai/server/openai-client";
import { formatNok, getEfficiencyScore } from "@/features/cars/data/nordic-cars";

export type AIRecommendation = {
  key: string;
  brand: string;
  model: string;
  href: string;
  score: number;
  priceNok: number;
  rangeWltpKm: number;
  winterRangeKm: number;
  chargingMinutes: number;
  reasons: string[];
  tradeoffs: string[];
};

export type AIRecommendationResult = {
  query: string;
  intent: SearchIntent;
  recommendations: AIRecommendation[];
  summary: string;
  poweredBy: "openai" | "local";
};

export async function recommendVehicles(query: string, limit = 4): Promise<AIRecommendationResult> {
  const intent = await parseSearchIntent(query);
  const semanticResults = await semanticVehicleSearch(query, 8);
  const documents = getVehicleDocuments();
  const semanticScoreByKey = new Map(semanticResults.map((result) => [result.document.id, result.score]));

  const recommendations = documents
    .map((document) => {
      const car = document.car;
      const constraintPenalty = getConstraintPenalty(intent, car);
      const preferenceScore = getPreferenceScore(intent, car);
      const semanticScore = semanticScoreByKey.get(document.id) ?? 0;
      const score = Math.max(0, Math.min(100, Math.round(semanticScore * 34 + preferenceScore - constraintPenalty)));

      return {
        brand: car.brand,
        chargingMinutes: car.chargingMinutes,
        href: `/cars/${car.brandSlug}/${car.modelSlug}`,
        key: car.key,
        model: car.model,
        priceNok: car.priceNok,
        rangeWltpKm: car.rangeWltpKm,
        reasons: createReasons(intent, car),
        score,
        tradeoffs: createTradeoffs(intent, car),
        winterRangeKm: car.winterRangeKm,
      };
    })
    .filter((recommendation) => recommendation.score > 20)
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.min(limit, 4));

  const fallbackSummary = createLocalSummary(query, recommendations);
  const summaryResponse = await generateOpenAIJson<{ summary: string }>(
    {
      maxOutputTokens: 500,
      system:
        "You are NordicDrive AI, an expert Norway EV recommendation assistant. Be concise, premium, practical, and honest about tradeoffs.",
      user: `User request: ${query}\nRecommendations: ${JSON.stringify(recommendations)}\nWrite one short recommendation summary in JSON with key summary.`,
    },
    { summary: fallbackSummary },
  );

  return {
    intent,
    poweredBy: process.env.OPENAI_API_KEY ? "openai" : "local",
    query,
    recommendations,
    summary: summaryResponse.summary || fallbackSummary,
  };
}

function getConstraintPenalty(intent: SearchIntent, car: ReturnType<typeof getVehicleDocuments>[number]["car"]) {
  let penalty = 0;

  if (intent.budgetMaxNok && car.priceNok > intent.budgetMaxNok) penalty += 34;
  if (intent.minRangeKm && car.rangeWltpKm < intent.minRangeKm) penalty += 18;
  if (intent.minSeats && car.seats < intent.minSeats) penalty += 26;
  if (intent.bodyType && car.segment !== intent.bodyType) penalty += 16;

  return penalty;
}

function getPreferenceScore(intent: SearchIntent, car: ReturnType<typeof getVehicleDocuments>[number]["car"]) {
  let score = 42;

  if (intent.budgetMaxNok && car.priceNok <= intent.budgetMaxNok) score += 12;
  if (intent.preferLongRange) score += car.winterRangeKm >= 420 ? 16 : car.winterRangeKm >= 380 ? 9 : 3;
  if (intent.preferFastCharging) score += car.chargingMinutes <= 22 ? 14 : car.fastChargingKw >= 220 ? 10 : 4;
  if (intent.preferFamily) score += car.seats >= 7 ? 14 : car.segment === "SUV" ? 10 : 4;
  if (intent.preferLuxury) score += car.interiorScore >= 9 ? 13 : car.priceNok >= 700000 ? 8 : 3;
  if (intent.preferPerformance) score += car.accelerationSeconds <= 4 ? 13 : car.horsepower >= 400 ? 8 : 3;
  if (intent.preferTowing) score += car.towingKg >= 2000 ? 14 : car.towingKg >= 1500 ? 8 : 2;
  if (intent.preferWinter) score += car.heatPump ? 7 : 0;

  score += Math.min(10, getEfficiencyScore(car) * 1.6);

  return score;
}

function createReasons(intent: SearchIntent, car: ReturnType<typeof getVehicleDocuments>[number]["car"]) {
  const reasons = [
    `${car.winterRangeKm} km estimated winter range`,
    `${formatNok(car.priceNok)} Norwegian starting price`,
  ];

  if (intent.preferFastCharging || car.chargingMinutes <= 22) {
    reasons.push(`${car.chargingMinutes} minute 10-80% charging window`);
  }
  if (intent.preferFamily) {
    reasons.push(`${car.seats} seats with ${car.bootLiters} L boot space`);
  }
  if (intent.preferTowing) {
    reasons.push(`${car.towingKg} kg towing capacity`);
  }

  return reasons.slice(0, 4);
}

function createTradeoffs(intent: SearchIntent, car: ReturnType<typeof getVehicleDocuments>[number]["car"]) {
  const tradeoffs: string[] = [];

  if (intent.budgetMaxNok && car.priceNok > intent.budgetMaxNok) {
    tradeoffs.push(`Above ${formatNok(intent.budgetMaxNok)} budget`);
  }
  if (intent.preferFastCharging && car.chargingMinutes > 28) {
    tradeoffs.push("Charging stop is longer than the fastest rivals");
  }
  if (intent.preferFamily && car.seats < 7) {
    tradeoffs.push("Five-seat cabin rather than seven seats");
  }
  if (intent.preferTowing && car.towingKg < 1800) {
    tradeoffs.push("Limited towing for cabin and trailer use");
  }

  return tradeoffs.length > 0 ? tradeoffs : ["No major mismatch for the stated request"];
}

function createLocalSummary(query: string, recommendations: AIRecommendation[]) {
  const winner = recommendations[0];
  if (!winner) {
    return `I could not find a strong match for "${query}". Try relaxing the budget, range, or seating constraints.`;
  }

  return `${winner.brand} ${winner.model} is the strongest match for "${query}" because it balances ${winner.winterRangeKm} km winter range, ${formatNok(winner.priceNok)} pricing, and practical charging.`;
}
