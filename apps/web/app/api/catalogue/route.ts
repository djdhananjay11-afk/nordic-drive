import { NextResponse } from "next/server";
import { getCatalogue } from "@/features/catalogue/repository";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return NextResponse.json(
      { vehicles: await getCatalogue() },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=60" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Catalogue temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
