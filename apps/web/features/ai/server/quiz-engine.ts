import { recommendVehicles, type AIRecommendationResult } from "@/features/ai/server/recommendation-engine";

export type QuizAnswers = {
  budget?: string | undefined;
  seats?: string | undefined;
  driving?: string | undefined;
  priority?: string | undefined;
  charging?: string | undefined;
  towing?: boolean | undefined;
};

export async function recommendFromQuiz(answers: QuizAnswers): Promise<AIRecommendationResult> {
  const query = [
    answers.budget ? `Budget ${answers.budget}.` : "",
    answers.seats ? `Needs ${answers.seats}.` : "",
    answers.driving ? `Driving pattern: ${answers.driving}.` : "",
    answers.priority ? `Priority: ${answers.priority}.` : "",
    answers.charging ? `Charging need: ${answers.charging}.` : "",
    answers.towing ? "Needs towing for cabin or trailer." : "",
    "Recommend the best EVs for Norway.",
  ]
    .filter(Boolean)
    .join(" ");

  return recommendVehicles(query, 4);
}
