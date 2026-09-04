import { NextResponse } from "next/server";
import { z } from "zod";

import { recommendFromQuiz } from "@/features/ai/server/quiz-engine";

const quizRequestSchema = z.object({
  answers: z.object({
    budget: z.string().optional(),
    charging: z.string().optional(),
    driving: z.string().optional(),
    priority: z.string().optional(),
    seats: z.string().optional(),
    towing: z.boolean().optional(),
  }),
});

export async function POST(request: Request) {
  const parsed = quizRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid quiz request" },
      {
        headers: { "Cache-Control": "no-store" },
        status: 422,
      },
    );
  }

  return NextResponse.json(await recommendFromQuiz(parsed.data.answers), {
    headers: { "Cache-Control": "no-store" },
  });
}
