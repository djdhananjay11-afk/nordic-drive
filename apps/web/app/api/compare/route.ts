import { NextResponse } from "next/server";

import { createComparisonFromParams } from "@/features/cars/comparison/comparison-engine";

export function GET(request: Request) {
  const url = new URL(request.url);

  return NextResponse.json(
    createComparisonFromParams({
      vehicles: url.searchParams.getAll("vehicles"),
      add: url.searchParams.getAll("add"),
    }),
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
      },
    },
  );
}
