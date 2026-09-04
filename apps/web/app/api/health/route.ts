import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      service: "nordicdrive-web",
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
