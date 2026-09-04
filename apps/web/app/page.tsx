import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HomePageView } from "@/features/home/components/home-page-view";
import { getHomeData } from "@/features/home/data/home-data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/server";
import { carListJsonLd, createPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return createPageMetadata({
    description: dictionary.metadata.homeDescription,
    locale,
    path: "/",
    title: dictionary.metadata.homeTitle,
  });
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const data = getHomeData(locale);

  return (
    <>
      <JsonLd data={carListJsonLd(data.featuredCars)} id="nordicdrive-home-cars-schema" />
      <HomePageView {...data} copy={dictionary.home} locale={locale} />
    </>
  );
}
