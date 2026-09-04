import { headers } from "next/headers";

import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  const locale = headerStore.get("x-nordicdrive-locale") ?? undefined;

  return isLocale(locale) ? locale : defaultLocale;
}
