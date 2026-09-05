import type { Metadata } from "next";

import {
  formatNok,
  getCarImageUrl,
  nordicCars,
  type NordicCar,
} from "@/features/cars/data/nordic-cars";
import {
  defaultLocale,
  locales,
  localizePath,
  openGraphLocaleByLocale,
  type Locale,
} from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";

function resolveSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const rawUrl = configuredUrl || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");
  const urlWithProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  try {
    return new URL(urlWithProtocol).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export const siteConfig = {
  name: "NordicDrive",
  description: dictionaries.en.metadata.siteDescription,
  locale: "en_NO",
  url: resolveSiteUrl(),
};

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}

export function createPageMetadata({
  description = siteConfig.description,
  image = "/opengraph-image",
  locale = defaultLocale,
  noIndex = false,
  path = "/",
  title,
}: {
  description?: string;
  image?: string;
  locale?: Locale;
  noIndex?: boolean;
  path?: string;
  title: string;
}): Metadata {
  const localizedPath = localizePath(locale, path);
  const url = absoluteUrl(localizedPath);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    title,
    description,
    alternates: {
      languages: Object.fromEntries(
        locales.map((supportedLocale) => [
          supportedLocale,
          absoluteUrl(localizePath(supportedLocale, path)),
        ]),
      ),
      canonical: url,
    },
    robots: noIndex
      ? {
          follow: false,
          index: false,
        }
      : {
          follow: true,
          googleBot: {
            follow: true,
            index: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
          index: true,
        },
    openGraph: {
      description,
      images: [
        {
          alt: `${siteConfig.name} electric car comparison platform`,
          height: 630,
          url: imageUrl,
          width: 1200,
        },
      ],
      locale: openGraphLocaleByLocale[locale],
      siteName: siteConfig.name,
      title,
      type: "website",
      url,
    },
    twitter: {
      card: "summary_large_image",
      description,
      images: [imageUrl],
      title,
    },
  };
}

export function createCarMetadata(car: NordicCar): Metadata {
  return createPageMetadata({
    description: `${car.tagline} Compare ${formatNok(car.priceNok)}, ${car.rangeWltpKm} km WLTP range, ${car.winterRangeKm} km winter estimate, charging, variants, and similar EVs in Norway.`,
    image: getCarImageUrl(car),
    path: `/cars/${car.brandSlug}/${car.modelSlug}`,
    title: `${car.brand} ${car.model} 3D Review`,
  });
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    description: siteConfig.description,
    name: siteConfig.name,
    url: siteConfig.url,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: siteConfig.description,
    name: siteConfig.name,
    potentialAction: {
      "@type": "SearchAction",
      "query-input": "required name=search_term_string",
      target: `${absoluteUrl("/cars")}?q={search_term_string}`,
    },
    url: siteConfig.url,
  };
}

export function carJsonLd(car: NordicCar) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    brand: {
      "@type": "Brand",
      name: car.brand,
    },
    description: car.tagline,
    fuelType: "Electric",
    image: getCarImageUrl(car),
    name: `${car.brand} ${car.model}`,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: car.priceNok,
      priceCurrency: "NOK",
      url: absoluteUrl(`/cars/${car.brandSlug}/${car.modelSlug}`),
    },
    url: absoluteUrl(`/cars/${car.brandSlug}/${car.modelSlug}`),
    vehicleSeatingCapacity: car.seats,
  };
}

export function carListJsonLd(cars = nordicCars) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: cars.map((car, index) => ({
      "@type": "ListItem",
      item: {
        "@type": "Car",
        name: `${car.brand} ${car.model}`,
        url: absoluteUrl(`/cars/${car.brandSlug}/${car.modelSlug}`),
      },
      position: index + 1,
    })),
    name: "Electric cars available in Norway",
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}
