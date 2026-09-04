import type { Metadata } from "next";

import { InformationalPage } from "@/components/informational/informational-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const copy = dictionary.informational.disclaimer;

  return createPageMetadata({
    description: copy.description,
    locale,
    path: "/disclaimer",
    title: locale === "no" ? "Ansvarsfraskrivelse" : "Disclaimer",
  });
}

export default async function DisclaimerPage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const copy = dictionary.informational.disclaimer;

  return (
    <InformationalPage
      ctaLabel={dictionary.nav.compare}
      ctaPath="/compare"
      description={copy.description}
      eyebrow={copy.eyebrow}
      locale={locale}
      sections={copy.sections}
      title={copy.title}
    />
  );
}
