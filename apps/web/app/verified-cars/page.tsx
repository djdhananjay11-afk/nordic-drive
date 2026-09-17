import { CatalogueLanding } from "@/features/catalogue/pages";
import { getRequestLocale } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const locale = await getRequestLocale();
  return createPageMetadata({
    locale,
    path: "/verified-cars",
    title: locale === "no" ? "Kildekontrollerte biler" : "Source-reviewed cars",
    description:
      locale === "no"
        ? "Spesifikasjoner med kilder og kontrollert dato."
        : "Specifications with sources and review dates.",
  });
}
export default async function VerifiedCars({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CatalogueLanding params={await searchParams} />;
}
