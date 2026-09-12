import type { Locale } from "@/lib/i18n/config";

// Remove the warning only after the public data source uses approved, sourced records.
export const catalogueNotice: Record<Locale, string> = {
  no: "Katalogen kvalitetssikres. Priser, spesifikasjoner og estimater er ikke ferdig verifisert. Bekreft opplysningene hos produsenten eller forhandleren.",
  en: "Catalogue verification is in progress. Prices, specifications and estimates are not yet verified. Confirm details with the manufacturer or dealer.",
};
