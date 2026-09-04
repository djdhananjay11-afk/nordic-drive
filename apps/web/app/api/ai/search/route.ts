import { NextResponse } from "next/server";
import { z } from "zod";

import { parseSearchIntent } from "@/features/ai/server/search-parser";
import { semanticVehicleSearch } from "@/features/ai/server/vector-search";

const searchRequestSchema = z.object({
  limit: z.number().int().min(1).max(8).optional(),
  query: z.string().min(2).max(500),
});

export async function POST(request: Request) {
  const parsed = searchRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search request" },
      {
        headers: { "Cache-Control": "no-store" },
        status: 422,
      },
    );
  }

  const [intent, results] = await Promise.all([
    parseSearchIntent(parsed.data.query),
    semanticVehicleSearch(parsed.data.query, parsed.data.limit ?? 5),
  ]);

  return NextResponse.json(
    {
      intent,
      query: parsed.data.query,
      results: results.map((result) => ({
        car: {
          brand: result.document.car.brand,
          href: `/cars/${result.document.car.brandSlug}/${result.document.car.modelSlug}`,
          key: result.document.car.key,
          model: result.document.car.model,
          priceNok: result.document.car.priceNok,
          rangeWltpKm: result.document.car.rangeWltpKm,
          winterRangeKm: result.document.car.winterRangeKm,
        },
        reason: result.reason,
        score: result.score,
      })),
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
