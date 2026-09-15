import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import HomePage from "../page";

export { generateMetadata } from "../page";
export const dynamic = "force-dynamic";

export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) {
  if (!isLocale((await params).locale)) notFound();
  return <HomePage />;
}
