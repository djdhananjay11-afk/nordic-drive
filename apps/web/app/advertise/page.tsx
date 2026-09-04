import type { Metadata } from "next";

import { InformationalPage } from "@/components/informational/informational-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const copy = dictionary.informational.advertise;

  return createPageMetadata({
    description: copy.description,
    locale,
    path: "/advertise",
    title: locale === "no" ? "Annonser på NordicDrive" : "Advertise With NordicDrive",
  });
}

export default async function AdvertisePage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const copy = dictionary.informational.advertise;

  return (
    <InformationalPage
      ctaLabel={dictionary.nav.disclaimer}
      ctaPath="/disclaimer"
      description={copy.description}
      eyebrow={copy.eyebrow}
      locale={locale}
      sections={copy.sections}
      title={copy.title}
    />
  );
}
