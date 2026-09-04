import { NextResponse } from "next/server";
import { z } from "zod";

import { recommendVehicles } from "@/features/ai/server/recommendation-engine";

const recommendationRequestSchema = z.object({
  limit: z.number().int().min(1).max(4).optional(),
  query: z.string().min(3).max(500),
});

export async function POST(request: Request) {
  const parsed = recommendationRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid recommendation request" },
      {
        headers: { "Cache-Control": "no-store" },
        status: 422,
      },
    );
  }

  return NextResponse.json(await recommendVehicles(parsed.data.query, parsed.data.limit ?? 4), {
    headers: { "Cache-Control": "no-store" },
  });
}
