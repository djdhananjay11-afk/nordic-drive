import { z } from "zod";

import { generateOpenAIJson } from "@/features/ai/server/openai-client";

export const searchIntentSchema = z.object({
  budgetMaxNok: z.number().int().positive().optional(),
  minRangeKm: z.number().int().positive().optional(),
  minSeats: z.number().int().positive().optional(),
  bodyType: z.enum(["SUV", "Sedan", "Crossover", "Wagon"]).optional(),
  preferFastCharging: z.boolean().default(false),
  preferLongRange: z.boolean().default(false),
  preferFamily: z.boolean().default(false),
  preferLuxury: z.boolean().default(false),
  preferPerformance: z.boolean().default(false),
  preferTowing: z.boolean().default(false),
  preferValue: z.boolean().default(false),
  preferWinter: z.boolean().default(true),
  query: z.string(),
});

export type SearchIntent = z.infer<typeof searchIntentSchema>;

export async function parseSearchIntent(query: string): Promise<SearchIntent> {
  const fallback = parseSearchIntentLocally(query);

  return generateOpenAIJson<SearchIntent>(
    {
      maxOutputTokens: 500,
      system:
        "You parse Norwegian EV shopping requests into strict JSON filters. Extract explicit constraints only. Keep booleans true when intent is strongly implied. Treat best offer, deal, value, cheap, affordable, monthly payment, kampanje, tilbud, billig, prisgunstig as preferValue.",
      user: `Parse this NordicDrive EV request: ${query}\nSchema keys: budgetMaxNok, minRangeKm, minSeats, bodyType, preferFastCharging, preferLongRange, preferFamily, preferLuxury, preferPerformance, preferTowing, preferValue, preferWinter, query.`,
    },
    fallback,
  ).then((intent) => searchIntentSchema.catch(fallback).parse({ ...fallback, ...intent, query }));
}

function parseSearchIntentLocally(query: string): SearchIntent {
  const normalizedQuery = query.toLowerCase();
  const budgetMaxNok = extractBudget(normalizedQuery);
  const minRangeKm = extractRange(normalizedQuery);
  const preferFamily = /family|familie|children|kids|barn|7 seat|seven seat|sju/.test(
    normalizedQuery,
  );
  const preferPerformance = /performance|fast|quick|sport|acceleration|rask/.test(normalizedQuery);
  const preferLuxury = /luxury|premium|luksus|comfort|komfort|quiet/.test(normalizedQuery);
  const preferTowing = /tow|towing|trailer|henger|cabin|hytta|hytte/.test(normalizedQuery);
  const preferValue =
    /best offer|offer|deal|value|cheap|affordable|lowest price|monthly|lease|campaign|tilbud|kampanje|billig|rimelig|prisgunstig|lavest pris/.test(
      normalizedQuery,
    );
  const preferFastCharging = /fast charg|charging|hurtiglad|lade|road trip|langtur/.test(
    normalizedQuery,
  );
  const preferLongRange = /long range|range|rekkevidde|lang rekkevidde/.test(normalizedQuery);
  const bodyType = extractBodyType(normalizedQuery);
  const explicitSeats = normalizedQuery.match(/(\d)\s*(seat|seats|seter)/);
  const minSeats = explicitSeats?.[1] ? Number(explicitSeats[1]) : preferFamily ? 5 : undefined;

  return {
    budgetMaxNok,
    bodyType,
    minRangeKm,
    minSeats,
    preferFamily,
    preferFastCharging,
    preferLongRange,
    preferLuxury,
    preferPerformance,
    preferTowing,
    preferValue,
    preferWinter: !/summer only|sommer/.test(normalizedQuery),
    query,
  };
}

function extractBudget(query: string) {
  const underMatch = query.match(
    /(?:under|below|max|budget|less than|under|budsjett|maks|under)\s*(\d[\d\s.]*)\s*(?:nok|kr|k)?/,
  );
  const nokMatch = query.match(/(\d[\d\s.]*)\s*(?:nok|kr)/);
  const raw = underMatch?.[1] ?? nokMatch?.[1];

  if (!raw) {
    return undefined;
  }

  const value = Number(raw.replace(/[\s.]/g, ""));
  if (!Number.isFinite(value)) {
    return undefined;
  }

  return value < 10000 ? value * 1000 : value;
}

function extractRange(query: string) {
  const match = query.match(/(\d{3,4})\s*(?:km|kilometer)/);
  return match?.[1] ? Number(match[1]) : undefined;
}

function extractBodyType(query: string): SearchIntent["bodyType"] {
  if (query.includes("suv")) return "SUV";
  if (query.includes("sedan")) return "Sedan";
  if (query.includes("crossover")) return "Crossover";
  if (query.includes("wagon") || query.includes("estate") || query.includes("stasjonsvogn"))
    return "Wagon";
  return undefined;
}
