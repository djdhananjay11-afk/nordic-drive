import type { Metadata } from "next";

import { InformationalPage } from "@/components/informational/informational-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const copy = dictionary.informational.about;

  return createPageMetadata({
    description: copy.description,
    locale,
    path: "/about",
    title: locale === "no" ? "Om NordicDrive" : "About NordicDrive",
  });
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const copy = dictionary.informational.about;

  return (
    <InformationalPage
      ctaLabel={dictionary.nav.cars}
      ctaPath="/cars"
      description={copy.description}
      eyebrow={copy.eyebrow}
      locale={locale}
      sections={copy.sections}
      title={copy.title}
    />
  );
}
