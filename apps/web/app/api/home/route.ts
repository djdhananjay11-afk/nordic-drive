import { NextResponse } from "next/server";

import { getHomeData } from "@/features/home/data/home-data";

export const revalidate = 300;

export function GET() {
  return NextResponse.json(
    {
      data: getHomeData(),
      meta: {
        revalidate,
        source: "nordicdrive-home-api",
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
