import { fieldUnits, type FactField } from "./fields.js";
import type { BrandSource, EvidenceBatch, EvidenceRecord, Fact } from "./types.js";

const observedOn = "2026-09-12";
const sources: BrandSource[] = [
  {
    slug: "citroen",
    name: "Citroen",
    url: "https://www.citroen.no/modeller/e-c3.html",
    status: "CONTENT_READ",
    notes: "e-C3 model facts and two trim prices; charging window is 20-80%.",
  },
  {
    slug: "cupra",
    name: "CUPRA",
    url: "https://www.cupraofficial.no/elbiler/tavascan",
    status: "CONTENT_READ",
    notes:
      "Tavascan VZ Adrenaline; conflicting range wording, dimensions pending brochure. Brochure fetch failed.",
  },
  {
    slug: "firefly",
    name: "firefly",
    url: "https://www.firefly.world/no_NO/firefly",
    status: "CONTENT_READ",
    notes: "Norwegian product page; regional equipment disclaimer retained.",
  },
  {
    slug: "ford",
    name: "Ford",
    url: "https://www.ford.no/biler/mustang-mach-e",
    status: "CONTENT_READ",
    notes: "Mach-E price only; dynamic performance counters extracted as zero and excluded.",
  },
  {
    slug: "mg",
    name: "MG",
    url: "https://www.mgmotor.eu/nn-NO/model/mgs5",
    status: "CONTENT_READ",
    notes:
      "MGS5 Comfort financing footnote supplies cash price, consumption and warranty; dynamic specs unavailable.",
  },
  {
    slug: "opel",
    name: "Opel",
    url: "https://www.opel.no/personbil/grandland-modeller/grandland-electric/grandland-electric.html",
    status: "CONTENT_READ",
    notes:
      "Grandland FWD/AWD facts separated. Homepage offers expired August 31; no price imported.",
  },
  {
    slug: "peugeot",
    name: "Peugeot",
    url: "https://www.peugeot.no/nyttige-lenker/last-ned-prislister.html",
    status: "CONTENT_READ",
    notes:
      "Linked E-3008 Norwegian price/specification PDF consulted; regular price distinct from campaigns.",
  },
  {
    slug: "renault",
    name: "Renault",
    url: "https://www.renault.no/personbil",
    status: "CONTENT_READ",
    notes: "Four current model listings, model-level only. Upcoming 2027 cars excluded.",
  },
  {
    slug: "toyota",
    name: "Toyota",
    url: "https://www.toyota.no/nybil/bz4x",
    status: "CONTENT_READ",
    notes:
      "Five electric passenger models have navigation prices; bZ4X battery/range qualification separate.",
  },
  {
    slug: "xpeng",
    name: "XPENG",
    url: "https://www.xpeng.com/no/model/g6",
    status: "CONTENT_READ",
    notes:
      "G6 AWD page and linked Norwegian PDF disagree on range: 510 versus 470 km. Withheld pending confirmation.",
  },
];

function fact(
  field: FactField,
  value: Fact["value"],
  qualification: string,
  basis: Fact["basis"] = "STATED",
  scope: Fact["scope"] = "MODEL",
): Fact {
  return { field, value, unit: fieldUnits[field], scope, basis, qualification };
}

function record(
  brandSlug: string,
  key: string,
  modelName: string,
  facts: Fact[],
  options: Partial<Pick<EvidenceRecord, "variantName" | "sourceUrl" | "warnings" | "media">> = {},
): EvidenceRecord {
  const source = sources.find((entry) => entry.slug === brandSlug);
  if (!source) throw new Error(`Missing source: ${brandSlug}`);
  return {
    key: `${brandSlug}/${key}`,
    brandSlug,
    modelName,
    observedOn,
    sourceUrl: source.url,
    facts,
    media: [],
    warnings: [
      "Partial observation; exact model year, equipment, order status and offer validity need editorial review.",
    ],
    ...options,
  };
}

const records: EvidenceRecord[] = [
  record("citroen", "e-c3-specifications", "e-C3", [
    fact("rangeWltpCombinedKm", 320, "Combined WLTP maximum.", "UP_TO"),
    fact("batteryCapacityKwh", 44, "Gross/usable basis not stated."),
    fact("powerPs", 113, "Norwegian page uses hk."),
    fact(
      "charging20To80Minutes",
      26,
      "DC 20-80%; conditions affect time, not comparable with 10-80%.",
    ),
  ]),
  ...(
    [
      ["you", "YOU", 234900],
      ["max", "MAX", 264900],
    ] as const
  ).map(([key, variantName, price]) =>
    record(
      "citroen",
      `e-c3-${key}-price`,
      "e-C3",
      [
        fact(
          "priceFromNok",
          price,
          "Trim starting price including Oslo delivery and scrappage; local freight/options extra.",
          "FROM",
          "VARIANT",
        ),
      ],
      { variantName },
    ),
  ),
  record(
    "cupra",
    "tavascan-vz-adrenaline",
    "Tavascan",
    [
      fact(
        "priceFromNok",
        499900,
        "Purchase offer; Norwegian delivery included. Confirm validity separately from financing.",
        "FROM",
        "VARIANT",
      ),
      fact("powerKw", 250, "VZ Adrenaline listing.", "STATED", "VARIANT"),
      fact("drivetrain", "AWD", "VZ Adrenaline four-wheel drive.", "STATED", "VARIANT"),
    ],
    {
      variantName: "VZ Adrenaline",
      warnings: [
        "Range 510/515 km conflicts; withheld. Dimensions and 28-minute charging window need brochure verification. No equipment inferred from illustrations.",
      ],
    },
  ),
  record(
    "firefly",
    "firefly-specifications",
    "firefly",
    [
      fact(
        "priceFromNok",
        231900,
        "Headline starting price; battery ownership, fees and trim must be confirmed.",
        "FROM",
      ),
      fact("rangeWltpCombinedKm", 330, "Combined WLTP per footnote.", "UP_TO"),
      fact("consumptionWltpKwhPer100Km", 14.5, "Combined WLTP."),
      fact("drivetrain", "RWD", "Product description."),
      fact("frunkLitres", 92, "Front storage."),
      fact("bootSeatsUpLitres", 404, "Rear storage; measurement standard unspecified."),
      fact("bootSeatsDownLitres", 1253, "Rear seats folded.", "UP_TO"),
      fact("chargingDcPeakKw", 100, "Peak DC, not average.", "UP_TO"),
      fact(
        "charging10To80Minutes",
        29,
        "Manufacturer claim; charger and temperatures affect time.",
      ),
    ],
    {
      warnings: [
        "AC options and V2L require Norwegian trim confirmation. Designed-for safety rating is not an independently verified crash-test result. Illustrations may differ from production cars.",
      ],
    },
  ),
  record(
    "ford",
    "mustang-mach-e-rwd-standard-price",
    "Mustang Mach-E",
    [
      fact(
        "priceFromNok",
        554000,
        "Listed RWD Standard Range cash price; delivery and options require price-list check.",
        "FROM",
        "VARIANT",
      ),
    ],
    {
      variantName: "RWD Standard Range",
      warnings: [
        "Zero-valued animated range, acceleration and charging counters excluded. 593 L combines front and rear storage; not rear boot capacity.",
      ],
      media: [
        {
          url: "https://www.ford.no/content/dam/guxeu/rhd/central/cars/2019-cx727/my26-dse/small-cards/ford-mustang_mach_e-eu-CX727_56579_1000x1000.jpg",
          sourceUrl: "https://www.ford.no/biler/mustang-mach-e",
          subject:
            "Page describes a blue Mustang Mach-E GT on a mountain road; NOT the priced RWD trim.",
          rightsStatus: "UNVERIFIED",
          visualStatus: "NOT_INSPECTED",
          availability: "FETCH_FAILED",
        },
      ],
    },
  ),
  record(
    "mg",
    "mgs5-comfort-footnote",
    "MGS5 EV",
    [
      fact(
        "priceFromNok",
        294900,
        "Cash price in Comfort offer, delivered Moss; local delivery extra. Offer ends 2026-09-30.",
        "FROM",
        "VARIANT",
      ),
      fact(
        "consumptionWltpKwhPer100Km",
        16.6,
        "Comfort combined WLTP footnote.",
        "STATED",
        "VARIANT",
      ),
      fact(
        "warrantyYears",
        7,
        "Earlier of duration/mileage; exclusions pending.",
        "STATED",
        "VARIANT",
      ),
      fact("warrantyKm", 150000, "Paired with seven-year duration.", "STATED", "VARIANT"),
    ],
    {
      variantName: "Comfort",
      warnings: [
        "Most dynamic specification fields did not render. Battery, range and trim model year remain unknown; finance payment is not vehicle price.",
      ],
    },
  ),
  record(
    "opel",
    "grandland-fwd-specifications",
    "Grandland Electric",
    [
      fact("drivetrain", "FWD", "FWD footnote.", "STATED", "VARIANT"),
      fact(
        "rangeWltpCombinedKm",
        523,
        "FWD maximum; wheel configuration pending.",
        "UP_TO",
        "VARIANT",
      ),
      fact("bootSeatsUpLitres", 550, "FWD rear storage.", "STATED", "VARIANT"),
      fact("bootSeatsDownLitres", 1645, "FWD rear seats folded.", "UP_TO", "VARIANT"),
    ],
    {
      variantName: "FWD (trim unspecified)",
      warnings: ["Expired homepage offer omitted; charging time lacks starting state of charge."],
    },
  ),
  record(
    "opel",
    "grandland-awd-specifications",
    "Grandland Electric",
    [
      fact("drivetrain", "AWD", "4x4 specification.", "STATED", "VARIANT"),
      fact(
        "rangeWltpCombinedKm",
        501,
        "4x4 maximum; wheel configuration pending.",
        "UP_TO",
        "VARIANT",
      ),
      fact("bootSeatsUpLitres", 485, "4x4 rear storage.", "STATED", "VARIANT"),
      fact("bootSeatsDownLitres", 1580, "4x4 rear seats folded.", "UP_TO", "VARIANT"),
      fact("powerPs", 325, "4x4 hk claim.", "STATED", "VARIANT"),
      fact("torqueNm", 509, "4x4 claim.", "STATED", "VARIANT"),
      fact("acceleration0To100Seconds", 6.1, "4x4 manufacturer claim.", "STATED", "VARIANT"),
    ],
    {
      variantName: "4x4 (trim unspecified)",
      warnings: [
        "Expired homepage offer omitted. FWD luggage capacity must not be assigned to AWD.",
      ],
    },
  ),
  record(
    "peugeot",
    "e-3008-allure-210-regular",
    "E-3008",
    [
      fact(
        "priceFromNok",
        469900,
        "Regular price, PDF page 1, effective 2026-03-01; VAT/delivery south of Nordland included. Not campaign price.",
        "FROM",
        "VARIANT",
      ),
      fact("rangeWltpCombinedKm", 526, "Allure 210 row, page 1.", "UP_TO", "VARIANT"),
      fact("batteryUsableKwh", 73, "Net capacity, 210 hp column page 5.", "STATED", "VARIANT"),
      fact("drivetrain", "FWD", "210 hp column page 5.", "STATED", "VARIANT"),
      fact("chargingAcKw", 11, "Three-phase 400 V; page 5.", "STATED", "VARIANT"),
      fact("chargingDcPeakKw", 160, "Page 5 maximum.", "UP_TO", "VARIANT"),
      fact(
        "charging20To80Minutes",
        30,
        "Approximate DC time at 20 C battery temperature, page 5.",
        "STATED",
        "VARIANT",
      ),
    ],
    {
      variantName: "Allure 210 hk 2WD",
      sourceUrl:
        "https://www.peugeot.no/content/dam/peugeot/norway/prislister-og-brosjyrer/personbiler/Kundeprisliste_E-3008_2026.pdf",
      warnings: [
        "March price list still linked in September; reconfirm cash offer before publication. Long Range rows promise 2027 delivery and are not this configuration.",
      ],
    },
  ),
  ...(
    [
      ["5", "5 E-Tech electric", 269900, 326],
      ["4", "4 E-Tech electric", 299900, 420],
      ["megane", "Megane E-Tech electric", 339900, 440],
      ["scenic", "Scenic E-Tech electric", 345900, 545],
    ] as const
  ).map(([key, modelName, price, boot]) =>
    record(
      "renault",
      `${key}-model-listing`,
      modelName,
      [
        fact(
          "priceFromNok",
          price,
          "Model campaign starting price; exact variant and expiry unconfirmed.",
          "FROM",
        ),
        fact("bootSeatsUpLitres", boot, "Model listing; trim/measurement basis pending."),
        fact("seats", 5, "Model listing."),
      ],
      {
        warnings: [
          "Model-level facts, not one purchasable configuration. Range/battery combination requires brochure. Upcoming 2027 version excluded.",
        ],
      },
    ),
  ),
  ...(
    [
      ["bz4x", "bZ4X", 458100],
      ["bz4x-touring", "bZ4X Touring", 539100],
      ["urban-cruiser", "Urban Cruiser", 330100],
      ["c-hr-plus", "C-HR+", 446500],
      ["proace-verso-electric", "Proace Verso Electric", 678900],
    ] as const
  ).map(([key, modelName, price]) =>
    record("toyota", `${key}-navigation-price`, modelName, [
      fact(
        "priceFromNok",
        price,
        "Norwegian navigation price including VAT; delivery and exact configuration need confirmation.",
        "FROM",
      ),
    ]),
  ),
  record(
    "toyota",
    "bz4x-73-battery-range",
    "bZ4X",
    [
      fact(
        "batteryGrossKwh",
        73.1,
        "Gross capacity explicitly identified in range footnote.",
        "STATED",
        "VARIANT",
      ),
      fact(
        "rangeWltpCombinedKm",
        569,
        "Expected combined WLTP, 73.1 kWh and 18-inch wheels; drivetrain not identified.",
        "PRELIMINARY",
        "VARIANT",
      ),
    ],
    {
      variantName: "73.1 kWh / 18-inch (drivetrain unspecified)",
      warnings: [
        "Do not combine model starting price with this battery/range configuration. Conditional battery-care programme is not an unconditional warranty.",
      ],
    },
  ),
  record(
    "xpeng",
    "g6-awd-page-specifications",
    "G6",
    [
      fact("drivetrain", "AWD", "Selected AWD Performance table.", "STATED", "VARIANT"),
      fact(
        "chargingDcPeakKw",
        451,
        "Page maximum, subject to type approval and operating conditions.",
        "PRELIMINARY",
        "VARIANT",
      ),
      fact(
        "acceleration0To100Seconds",
        4.13,
        "Manufacturer internal test; subject to type approval.",
        "PRELIMINARY",
        "VARIANT",
      ),
      fact("lengthMm", 4758, "Table, subject to type approval.", "PRELIMINARY", "VARIANT"),
      fact("widthMm", 1920, "Table; mirror basis pending.", "PRELIMINARY", "VARIANT"),
      fact("heightMm", 1650, "Table, subject to type approval.", "PRELIMINARY", "VARIANT"),
      fact("wheelbaseMm", 2890, "Table, subject to type approval.", "PRELIMINARY", "VARIANT"),
    ],
    {
      variantName: "AWD Performance",
      warnings: [
        "Range withheld: page 510 km versus linked Norwegian PDF 470 km for AWD R20. PDF https://s-cdn.xpeng.com/commoncms/prod/2026-04-01/df6e1ee88e0940bca2c2718198b564ac.pdf?name=G6+specsheet+NO. Production month and homologation require confirmation.",
      ],
    },
  ),
];

export const officialNorwaySeptember12Batch: EvidenceBatch = {
  schemaVersion: 1,
  id: "norway-official-2026-09-12-v1",
  observedOn,
  market: "NO",
  completeness: "PARTIAL",
  sources,
  records,
};
