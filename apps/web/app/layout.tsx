import type { Metadata } from "next";
import type * as React from "react";
import { Geist, Geist_Mono } from "next/font/google";

import { PremiumNav } from "@/components/design-system/premium-nav";
import { WebVitalsReporter } from "@/components/monitoring/web-vitals-reporter";
import { JsonLd } from "@/components/seo/json-ld";
import { htmlLangByLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/server";
import { organizationJsonLd, siteConfig, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "NordicDrive",
    template: "%s | NordicDrive",
  },
  applicationName: siteConfig.name,
  authors: [{ name: "NordicDrive" }],
  category: "Automotive",
  creator: "NordicDrive",
  description: siteConfig.description,
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.url),
  publisher: "NordicDrive",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <html lang={htmlLangByLocale[locale]}>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} id="nordicdrive-root-schema" />
        <WebVitalsReporter />
        <PremiumNav dictionary={dictionary.nav} locale={locale} />
        {children}
      </body>
    </html>
  );
}
