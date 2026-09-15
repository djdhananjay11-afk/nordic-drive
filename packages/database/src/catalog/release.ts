// Public facts are variant-specific. Missing facts must never become zero or false.
export type CatalogueLocale = "no" | "en";
export type LocalizedText = Record<CatalogueLocale, string>;
export const releaseId = "norway-starter-2026-09-12";
export const metricLabels = {
  price: { no: "Fra-pris", en: "Starting price" },
  range: { no: "Rekkevidde, WLTP kombinert", en: "Range, combined WLTP" },
  battery: { no: "Batterikapasitet", en: "Battery capacity" },
  dc: { no: "Maksimal DC-lading", en: "Peak DC charging" },
  ac: { no: "AC-lading", en: "AC charging" },
  charging: { no: "Lading 10–80 %", en: "Charging 10–80%" },
  drive: { no: "Drivlinje", en: "Drivetrain" },
  acceleration: { no: "0–100 km/t", en: "0–100 km/h" },
  towing: { no: "Tilhengervekt, opptil", en: "Towing capacity, up to" },
  boot: { no: "Bagasjerom, seter oppe", en: "Boot, seats upright" },
  frunk: { no: "Frunk", en: "Frunk" },
  length: { no: "Lengde", en: "Length" },
  width: { no: "Bredde", en: "Width" },
  height: { no: "Høyde", en: "Height" },
  wheelbase: { no: "Akselavstand", en: "Wheelbase" },
  winter: { no: "Testet vinterrekkevidde", en: "Tested winter range" },
  warranty: { no: "Garantivilkår", en: "Warranty terms" },
  safety: { no: "Uavhengig sikkerhetstest", en: "Independent safety test" },
} satisfies Record<string, LocalizedText>;
export type Metric = keyof typeof metricLabels;
export type CatalogueFact = {
  value: number | string;
  unit: string;
  source: number;
  note?: LocalizedText;
};
export type CatalogueVehicle = {
  id: string;
  brand: string;
  brandSlug: string;
  model: string;
  slug: string;
  variant: string;
  checkedOn: string;
  sources: { title: string; url: string }[];
  galleryUrl: string;
  facts: Partial<Record<Metric, CatalogueFact>>;
  image: null | {
    path: string;
    alt: LocalizedText;
    permissionReference: string;
    checkedOn: string;
  };
};

const f = (
  value: number | string,
  unit: string,
  source = 0,
  note?: LocalizedText,
): CatalogueFact => ({ value, unit, source, ...(note ? { note } : {}) });
export const releaseVehicles: CatalogueVehicle[] = [
  {
    id: "polestar-2-long-range-single-motor",
    brand: "Polestar",
    brandSlug: "polestar",
    model: "2",
    slug: "2-long-range-single-motor",
    variant: "Long range Single motor",
    checkedOn: "2026-09-12",
    sources: [
      { title: "Polestar Norge", url: "https://www.polestar.com/no/polestar-2/specifications/" },
    ],
    galleryUrl: "https://www.polestar.com/no/polestar-2/",
    image: null,
    facts: {
      price: f(539900, "NOK", 0, {
        no: "Oppgitt fra-pris. Bekreft totalpris, levering og utstyr hos produsenten.",
        en: "Advertised starting price. Confirm total price, delivery and equipment with the manufacturer.",
      }),
      range: f(659, "km"),
      battery: f(82, "kWh", 0, {
        no: "Kilden angir ikke om kapasiteten er brutto eller netto.",
        en: "The source does not identify gross or usable capacity.",
      }),
      dc: f(205, "kW"),
      ac: f(11, "kW"),
      charging: f(28, "min"),
      drive: f("RWD", ""),
      acceleration: f(6.2, "s"),
      towing: f(1500, "kg"),
      boot: f(407, "l", 0, {
        no: "Inkludert rom under gulvet.",
        en: "Includes underfloor storage.",
      }),
      frunk: f(41, "l"),
      length: f(4606, "mm"),
      width: f(1859, "mm", 0, { no: "Uten sidespeil.", en: "Excluding mirrors." }),
      height: f(1479, "mm"),
      wheelbase: f(2735, "mm"),
    },
  },
  {
    id: "hongqi-ehs5-exclusive-4wd",
    brand: "Hongqi",
    brandSlug: "hongqi",
    model: "EHS5",
    slug: "ehs5-exclusive-4wd",
    variant: "Exclusive 4WD",
    checkedOn: "2026-09-12",
    sources: [
      { title: "Hongqi Norge: EHS5", url: "https://hongqi.no/" },
      {
        title: "Hongqi Norge: spesifikasjoner",
        url: "https://hongqi.no/biler/ehs5/spesifikasjoner/",
      },
    ],
    galleryUrl: "https://hongqi.no/",
    image: null,
    facts: {
      price: f(439900, "NOK", 0, {
        no: "Inkludert frakt og levering til forhandler. Bekreft endelig tilbud og avgifter.",
        en: "Includes transport and dealer delivery. Confirm the final quote and taxes.",
      }),
      range: f(522, "km"),
      battery: f(85, "kWh", 0, { no: "Bruttokapasitet, LFP.", en: "Gross capacity, LFP." }),
      dc: f(265, "kW", 1),
      ac: f(11, "kW", 1),
      charging: f(20, "min", 1, {
        no: "Oppgitt som opptil 20 minutter under egnede ladeforhold.",
        en: "Stated as at most 20 minutes under suitable charging conditions.",
      }),
      drive: f("AWD", ""),
      acceleration: f(4, "s", 1),
      towing: f(1500, "kg", 1),
      boot: f(462, "l", 1),
      frunk: f(48, "l", 1),
      length: f(4750, "mm", 1),
      width: f(1900, "mm", 1, {
        no: "Kilden presiserer ikke om sidespeil er inkludert.",
        en: "The source does not specify whether mirrors are included.",
      }),
      height: f(1640, "mm", 1),
      wheelbase: f(2900, "mm", 1),
    },
  },
];

export function vehiclePath(vehicle: CatalogueVehicle) {
  return `/cars/${vehicle.brandSlug}/${vehicle.slug}`;
}

export function selectVehicles(vehicles: CatalogueVehicle[], ids: string[]) {
  return [...new Set(ids)].slice(0, 4).flatMap((id) => {
    const vehicle = vehicles.find((item) => item.id === id);
    return vehicle ? [vehicle] : [];
  });
}

export function filterVehicles(
  vehicles: CatalogueVehicle[],
  query: string,
  brand: string,
  maxPrice?: number,
  minRange?: number,
) {
  const term = query.trim().toLocaleLowerCase("nb-NO");
  return vehicles.filter((v) => {
    const price = v.facts.price?.value;
    const range = v.facts.range?.value;
    return (
      (!brand || v.brandSlug === brand) &&
      `${v.brand} ${v.model} ${v.variant}`.toLocaleLowerCase("nb-NO").includes(term) &&
      (maxPrice === undefined || (typeof price === "number" && price <= maxPrice)) &&
      (minRange === undefined || (typeof range === "number" && range >= minRange))
    );
  });
}
