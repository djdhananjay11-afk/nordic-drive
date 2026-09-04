export const locales = ["en", "no"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  no: "Norsk",
};

export const htmlLangByLocale: Record<Locale, string> = {
  en: "en-NO",
  no: "nb-NO",
};

export const openGraphLocaleByLocale: Record<Locale, string> = {
  en: "en_NO",
  no: "nb_NO",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale | undefined {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : undefined;
}

export function stripLocaleFromPathname(pathname: string) {
  const locale = getLocaleFromPathname(pathname);

  if (!locale) {
    return pathname || "/";
  }

  const stripped = pathname.slice(locale.length + 1);
  return stripped || "/";
}

export function localizePath(locale: Locale, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${stripLocaleFromPathname(normalizedPath)}`;
}
