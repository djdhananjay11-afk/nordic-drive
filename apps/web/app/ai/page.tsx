import type { Metadata } from "next";

import { AIAssistantView } from "@/features/ai/components/ai-assistant-view";
import { getRequestLocale } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  description:
    "Ask NordicDrive AI for electric car recommendations, semantic search, comparison summaries, and a Norway-focused EV buying quiz.",
  path: "/ai",
  title: "NordicDrive AI EV Recommendations",
});

export default async function AIPage() {
  const locale = await getRequestLocale();

  return <AIAssistantView locale={locale} />;
}
