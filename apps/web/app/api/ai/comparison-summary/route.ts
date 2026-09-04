import { NextResponse } from "next/server";
import { z } from "zod";

import { summarizeComparison } from "@/features/ai/server/comparison-summary";

const comparisonSummaryRequestSchema = z.object({
  add: z.union([z.string(), z.array(z.string())]).nullish(),
  vehicles: z.union([z.string(), z.array(z.string())]).nullish(),
});

export async function POST(request: Request) {
  const parsed = comparisonSummaryRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid comparison summary request" },
      {
        headers: { "Cache-Control": "no-store" },
        status: 422,
      },
    );
  }

  return NextResponse.json(await summarizeComparison(parsed.data), {
    headers: { "Cache-Control": "no-store" },
  });
}
