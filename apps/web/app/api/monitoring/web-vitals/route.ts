import { NextResponse } from "next/server";
import { z } from "zod";

const webVitalsSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  startTime: z.number().finite().nonnegative(),
  value: z.number().finite().nonnegative(),
});

export async function POST(request: Request) {
  const parsed = webVitalsSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false },
      {
        headers: { "Cache-Control": "no-store" },
        status: 422,
      },
    );
  }

  if (process.env.NODE_ENV === "production") {
    console.info("web-vital", parsed.data);
  }

  return NextResponse.json(
    { ok: true },
    {
      headers: { "Cache-Control": "no-store" },
      status: 202,
    },
  );
}
