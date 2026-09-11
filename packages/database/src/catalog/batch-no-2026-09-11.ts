import { fieldUnits, type FactField } from "./fields.js";
import { sources } from "./sources-no.js";
import type { EvidenceBatch, EvidenceRecord, Fact, MediaCandidate } from "./types.js";

const observedOn = "2026-09-11";
const source = (slug: string): string => {
  const entry = sources.find((item) => item.slug === slug);
  if (!entry) throw new Error(`Missing source: ${slug}`);
  return entry.url;
};

function fact(
  field: FactField,
  value: Fact["value"],
  qualification: string,
  basis: Fact["basis"] = "STATED",
  scope: Fact["scope"] = "MODEL",
): Fact {
  return { field, value, unit: fieldUnits[field], qualification, basis, scope };
}

function record(
  brandSlug: string,
  key: string,
  modelName: string,
  facts: Fact[],
  options: Partial<Pick<EvidenceRecord, "sourceUrl" | "variantName" | "warnings" | "media">> = {},
): EvidenceRecord {
  return {
    key: `${brandSlug}/${key}`,
    brandSlug,
    modelName,
    sourceUrl: source(brandSlug),
    observedOn,
    facts,
    media: [],
    warnings: [
      "Partial source observation. Model year, exact equipment and current order status require review.",
    ],
    ...options,
  };
}

function media(url: string, sourceUrl: string, subject: string, failed = true): MediaCandidate {
  return {
    url,
    sourceUrl,
    subject,
    rightsStatus: "UNVERIFIED",
    visualStatus: "NOT_INSPECTED",
    availability: failed ? "FETCH_FAILED" : "NOT_CHECKED",
  };
}

const fromPrice = (
  value: number,
  qualification = "Displayed model starting price; tax, delivery, options and offer validity require confirmation.",
): Fact => fact("priceFromNok", value, qualification, "FROM");

const records: EvidenceRecord[] = [
  record(
    "audi",
    "q6-etron",
    "Q6 e-tron",
    [
      fromPrice(
        729900,
        "Displayed NOK price includes applicable VAT, registration, scrappage fee and Oslo delivery.",
      ),
    ],
    {
      sourceUrl: "https://www.audi.no/no/bilmodeller/q6-e-tron/q6-e-tron/",
      warnings: [
        "Headline performance uses boost; do not combine with base price. Manufacturer warns images may show a different model year.",
      ],
    },
  ),
  record(
    "byd",
    "sealion7-specifications",
    "Sealion 7 4x4",
    [
      fact(
        "batteryCapacityKwh",
        91.3,
        "Gross/usable unspecified; specification table and FAQ agree.",
      ),
      fact("rangeWltpCombinedKm", 502, "Norwegian table combined WLTP.", "UP_TO"),
      fact("rangeWltpCityKm", 616, "City cycle only."),
      fact("chargingAcKw", 11, "Three-phase onboard charging."),
      fact("chargingDcPeakKw", 230, "Peak in FAQ; not average charging speed.", "UP_TO"),
      fact(
        "charging10To80Minutes",
        24,
        "Manufacturer claim; battery temperature and charger conditions pending.",
      ),
      fact("consumptionWltpKwhPer100Km", 21.9, "Converted from 219 Wh/km combined."),
      fact("drivetrain", "AWD", "4x4 table."),
      fact("powerKw", 390, "Table power."),
      fact("acceleration0To100Seconds", 4.5, "Manufacturer claim."),
      fact("lengthMm", 4830, "Specification table."),
      fact("widthMm", 1925, "Excludes mirrors; page states 2189 mm with mirrors."),
      fact("heightMm", 1620, "Specification table."),
      fact("wheelbaseMm", 2930, "Specification table."),
      fact("seats", 5, "Specification table."),
      fact("bootSeatsUpLitres", 520, "Rear compartment per FAQ; separate frunk."),
      fact("frunkLitres", 58, "Front compartment per FAQ."),
      fact("towingBrakedKg", 1500, "Braked trailer limit."),
      fact("heatPump", true, "FAQ explicitly confirms standard equipment."),
      fact("v2l", true, "Described on Norwegian page; adapter requirements pending."),
    ],
    {
      sourceUrl: "https://byd.no/modeller/sealion7",
      warnings: [
        "Exact trim/model year pending; source battery voltage/Ah values may not describe the same pack. Verify brochure before publication.",
        "Warranty page notes updated terms forthcoming and exclusions after 5 years/100000 km; warranty withheld.",
      ],
      media: [
        media(
          "https://cdn.sanity.io/images/mcx434c9/production/b1fe6b743e42ea0cab251f968edd9f42cf03ab83-7500x4219.jpg",
          "https://byd.no/modeller/sealion7",
          "Sealion 7 exterior candidate",
        ),
      ],
    },
  ),
  ...(
    [
      ["rwd", "RWD", 563],
      ["awd", "AWD", 512],
    ] as const
  ).map(([key, drivetrain, range]) =>
    record(
      "kia",
      `ev9-${key}`,
      "EV9",
      [
        fact("drivetrain", drivetrain, "Named drivetrain.", "STATED", "VARIANT"),
        fact("batteryCapacityKwh", 99.8, "Gross/usable basis unspecified.", "STATED", "VARIANT"),
        fact(
          "rangeWltpCombinedKm",
          range,
          "Powertrain-specific range; wheels/trim pending.",
          "UP_TO",
          "VARIANT",
        ),
        fact(
          "charging10To80Minutes",
          24,
          "Manufacturer best-case claim; charging conditions pending.",
        ),
        fact("chargingDcPeakKw", 210, "Advertised peak, not mean power.", "UP_TO"),
      ],
      {
        variantName: drivetrain,
        sourceUrl: "https://www.kia.no/bil/ev9",
        warnings: [
          "Page contains conflicting RWD horsepower figures; withheld. Six/seven-seat options and boot-volume seat positions must be resolved per trim.",
        ],
        media:
          key === "rwd"
            ? [
                media(
                  "https://media.crystallize.com/bos-ecom-prod/25/6/19/22/194a8032-rediger.jpg",
                  "https://www.kia.no/bil/ev9",
                  "EV9 exterior; drivetrain not visually verified",
                ),
              ]
            : [],
      },
    ),
  ),
  record(
    "nio",
    "el6-dimensions",
    "EL6",
    [
      fact("lengthMm", 4854, "Norwegian product-page dimensions."),
      fact("widthMm", 1995, "Mirror inclusion unspecified."),
      fact("heightMm", 1703, "Norwegian product-page dimensions."),
      fact("wheelbaseMm", 2915, "Norwegian product-page dimensions."),
    ],
    {
      sourceUrl: "https://www.nio.com/no_NO/el6",
      warnings: [
        "Model year pending. Marketing equipment refers to high specification and may exclude EU availability. No BaaS price treated as battery-inclusive purchase price.",
      ],
    },
  ),
  ...(
    [
      ["lr-single", "Long range Single motor", 539900, "RWD", 220, 659, 6.2],
      ["lr-dual", "Long range Dual motor", 569900, "AWD", 310, 596, 4.5],
      [
        "lr-dual-performance",
        "Long range Dual motor with Performance pack",
        619900,
        "AWD",
        350,
        568,
        4.2,
      ],
    ] as const
  ).map(([key, name, price, drivetrain, power, range, acceleration]) =>
    record(
      "polestar",
      `2-${key}`,
      "Polestar 2",
      [
        fact(
          "priceFromNok",
          price,
          "Named variant starting price; final order charges pending.",
          "FROM",
          "VARIANT",
        ),
        fact("drivetrain", drivetrain, "Named variant.", "STATED", "VARIANT"),
        fact(
          "powerKw",
          power,
          "Maximum net output, not 30-minute rated power.",
          "STATED",
          "VARIANT",
        ),
        fact(
          "rangeWltpCombinedKm",
          range,
          "WLTP maximum; wheel/equipment dependent.",
          "UP_TO",
          "VARIANT",
        ),
        fact(
          "acceleration0To100Seconds",
          acceleration,
          "Manufacturer acceleration.",
          "STATED",
          "VARIANT",
        ),
        fact(
          "batteryCapacityKwh",
          82,
          "Listed capacity; gross/usable not explicitly named.",
          "STATED",
          "VARIANT",
        ),
        fact("chargingDcPeakKw", 205, "Long range peak DC.", "UP_TO", "VARIANT"),
        fact("charging10To80Minutes", 28, "Long range best-case charge time.", "STATED", "VARIANT"),
      ],
      {
        variantName: name,
        sourceUrl: "https://www.polestar.com/no/polestar-2/specifications",
        warnings: [
          "Model year and exact order configuration pending. Starting-price and maximum-range qualifications must stay visible.",
        ],
      },
    ),
  ),
  record(
    "polestar",
    "2-dimensions",
    "Polestar 2",
    [
      fact("lengthMm", 4606, "Exterior length."),
      fact("widthMm", 1859, "Excludes extended mirrors."),
      fact("wheelbaseMm", 2735, "Exterior dimensions."),
      fact("bootSeatsUpLitres", 407, "Includes underfloor storage."),
      fact("bootSeatsDownLitres", 1097, "Includes underfloor storage."),
      fact("frunkLitres", 41, "Separate front compartment."),
    ],
    { sourceUrl: "https://www.polestar.com/no/polestar-2/specifications" },
  ),
  record(
    "porsche",
    "taycan4",
    "Taycan",
    [
      fact(
        "priceFromNok",
        1241115,
        "Taycan 4 starting price; option battery not included by assumption.",
        "FROM",
        "VARIANT",
      ),
      fact("drivetrain", "AWD", "Taycan 4 drivetrain.", "STATED", "VARIANT"),
      fact(
        "rangeWltpCombinedKm",
        645,
        "Maximum across battery and equipment configurations.",
        "UP_TO",
        "VARIANT",
      ),
      fact("acceleration0To100Seconds", 4.6, "With Launch Control.", "STATED", "VARIANT"),
      fact("heatPump", true, "Page describes heat pump as standard.", "STATED", "VARIANT"),
    ],
    {
      variantName: "4",
      sourceUrl: "https://www.porsche.com/norway/no/models/taycan/taycan-models/taycan-4/",
      warnings: [
        "Base versus Performance Battery Plus must remain separate. Model year/options pending; no battery capacity inferred from another model year.",
      ],
    },
  ),
  ...(
    [
      ["model-y-rwd", "Model Y", "RWD", 160000],
      ["model-y-lr-awd", "Model Y", "Premium LR AWD", 192000],
      ["model-3-rwd", "Model 3", "RWD", 160000],
      ["model-3-lr-awd", "Model 3", "Premium LR AWD", 192000],
      ["model-s", "Model S", "Model S warranty group", 240000],
      ["model-x", "Model X", "Model X warranty group", 240000],
    ] as const
  ).map(([key, model, variant, mileage]) =>
    record(
      "tesla",
      `${key}-warranty`,
      model,
      [
        fact("warrantyYears", 5, "Whichever occurs first with mileage cap.", "STATED", "VARIANT"),
        fact("warrantyKm", 100000, "Basic new-car coverage mileage limit.", "STATED", "VARIANT"),
        fact(
          "batteryWarrantyYears",
          8,
          "Whichever occurs first with mileage cap.",
          "STATED",
          "VARIANT",
        ),
        fact(
          "batteryWarrantyKm",
          mileage,
          "Battery/drive-unit coverage for named group.",
          "STATED",
          "VARIANT",
        ),
        fact(
          "batteryWarrantyRetentionPercent",
          70,
          "Minimum capacity retention during warranty.",
          "STATED",
          "VARIANT",
        ),
      ],
      {
        variantName: variant,
        warnings: [
          "Warranty overview only; purchase-date-specific warranty document governs. Does not establish model order availability. Product specifications remain uncollected.",
        ],
      },
    ),
  ),
  ...(
    [
      ["id-polo", "ID. Polo", 249900],
      ["id3-neo", "ID.3 Neo", 324900],
      ["id-cross", "ID. Cross", 279900],
      ["id4", "ID.4", 490900],
      ["id7-tourer", "ID.7 Tourer", 599900],
      ["id7-fastback", "ID.7 Fastback", 642600],
      ["id-buzz", "ID. Buzz", 638943],
      ["e-caravelle", "e-Caravelle", 780598],
    ] as const
  ).map(([key, name, price]) =>
    record(
      "volkswagen",
      key,
      name,
      [
        fromPrice(
          price,
          "NOK including applicable VAT, weight tax and Oslo delivery; local freight/options extra. No variant range linked.",
        ),
      ],
      {
        warnings: [
          "Delivery status and exact variant not verified.",
          "Website terms do not grant reuse rights; obtain a permitted data/media source before publication.",
        ],
      },
    ),
  ),
  record("alfa-romeo", "junior", "Junior Elettrica", [fromPrice(364900)]),
  record("alpine", "a290", "A290", [fromPrice(399900)]),
  record("alpine", "a390", "A390", [fromPrice(759900)]),
  record(
    "changan",
    "deepal-s05-awd",
    "Deepal S05",
    [
      fact(
        "priceFromNok",
        369900,
        "AWD starting offer; delivery/options and validity pending.",
        "FROM",
        "VARIANT",
      ),
      fact("drivetrain", "AWD", "Named AWD offer.", "STATED", "VARIANT"),
    ],
    {
      variantName: "AWD",
      media: [
        media(
          "https://www.changaneurope.com/Portals/5/adam/ContentBlocks/aw3G7u1eWU6Sr0fm3emHvg/Image/resize-44image.jpg?h=533&mode=crop&quality=75&scale=both&w=800",
          source("changan"),
          "Deepal S05; official Oslo scene candidate",
        ),
      ],
    },
  ),
  record("fiat", "grande-panda-electric", "Grande Panda Electric", [fromPrice(249900)]),
  record("fiat", "600e", "600e", [fromPrice(324900)]),
  record("honda", "eny1", "e:Ny1", [fromPrice(259900)]),
  record("lotus", "eletre", "Eletre", [fromPrice(1049000)], {
    media: [
      media(
        "https://wlt-p-001.sitecorecontenthub.cloud/api/public/content/b8344adfed5f426b8f88c0dac6aa8827?v=6795c6f5",
        source("lotus"),
        "Eletre BEV; website image candidate",
        false,
      ),
    ],
  }),
  record("lotus", "emeya", "Emeya", [fromPrice(1149000)]),
  ...(
    [
      ["pure", "Pure", 1009000],
      ["touring", "Touring", 1159000],
      ["grand-touring", "Grand Touring", 1369000],
      ["sapphire", "Sapphire", 2820000],
    ] as const
  ).map(([key, variant, price]) =>
    record(
      "lucid",
      `air-${key}`,
      "Air",
      [
        fact(
          "priceFromNok",
          price,
          variant === "Sapphire"
            ? "Displayed fully equipped price; final order terms pending."
            : "Named variant starting price; final order terms pending.",
          "FROM",
          "VARIANT",
        ),
      ],
      { variantName: variant },
    ),
  ),
  record("mitsubishi", "eclipse-cross-ev", "Eclipse Cross EV", [
    fromPrice(
      459900,
      "Oslo delivery basis; local freight extra. Do not match to older Eclipse Cross PHEV.",
    ),
  ]),
  record(
    "nissan",
    "leaf-new",
    "LEAF (new generation)",
    [
      fromPrice(
        349900,
        "Nissan starting-price basis includes applicable VAT and Gol delivery; local charges vary.",
      ),
      fact(
        "rangeWltpCombinedKm",
        622,
        "Headline maximum; not verified for cheapest variant.",
        "UP_TO",
      ),
      fact(
        "bootSeatsUpLitres",
        437,
        "Headline maximum; measurement method and trim pending.",
        "UP_TO",
      ),
    ],
    {
      media: [
        media(
          "https://www-europe.nissan-cdn.net/content/dam/Nissan/nissan_europe/vehicles/leaf/Leaf2025/kiosk/overview/Hero.jpg",
          source("nissan"),
          "New LEAF exterior candidate",
        ),
      ],
    },
  ),
  record(
    "nissan",
    "micra-new",
    "MICRA Electric",
    [
      fromPrice(
        259900,
        "Nissan starting-price basis includes applicable VAT and Gol delivery; local charges vary.",
      ),
      fact(
        "rangeWltpCombinedKm",
        415,
        "Headline maximum; not verified for cheapest variant.",
        "UP_TO",
      ),
      fact("bootSeatsUpLitres", 326, "Headline maximum; measurement method pending.", "UP_TO"),
    ],
    {
      media: [
        media(
          "https://www-europe.nissan-cdn.net/content/dam/Nissan/nissan_europe/NL/Home/MICRA_Homepage_Desktop_cropped.png",
          source("nissan"),
          "MICRA exterior; Norway page links a shared NL asset",
        ),
      ],
    },
  ),
  record("seres", "5", "Seres 5", [
    fact("lengthMm", 4770, "Model exterior dimensions."),
    fact("widthMm", 1930, "Mirror inclusion not specified."),
    fact("heightMm", 1625, "Model exterior dimensions."),
    fact("wheelbaseMm", 2880, "Model exterior dimensions."),
  ]),
  record(
    "suzuki",
    "e-vitara-4x4",
    "e VITARA",
    [
      fact("drivetrain", "AWD", "4x4 model table."),
      fact("batteryCapacityKwh", 61, "Gross versus usable capacity not stated."),
      fact("lengthMm", 4275, "Specification table."),
      fact("widthMm", 1800, "Mirror inclusion not specified."),
      fact("heightMm", 1635, "Specification table."),
      fact("wheelbaseMm", 2700, "Specification table."),
      fact("groundClearanceMm", 180, "Specification table; loading condition unspecified."),
      fact("powerKw", 135, "Specification table."),
      fact("acceleration0To100Seconds", 7.4, "Manufacturer figure."),
      fact("topSpeedKmh", 150, "Specification table."),
    ],
    {
      warnings: [
        "Header and trim prices differ; price withheld.",
        "Combined/city range compressed into one label; range withheld pending brochure.",
        "AC charging and consumption have ambiguous units; withheld.",
        "Model year and exact trim pending.",
      ],
      media: [
        media(
          "https://cdn.sanity.io/images/mcx434c9/production/ebfdef68f2e16cb9b9a5cdbe8e5be8f14b6d373d-3000x2001.jpg",
          source("suzuki"),
          "e VITARA exterior candidate",
        ),
      ],
    },
  ),
  record(
    "kgm",
    "torres-evx-specifications",
    "Torres EVX",
    [
      fact("drivetrain", "FWD", "Specification table."),
      fact("batteryCapacityKwh", 80.6, "Gross versus usable not stated."),
      fact("rangeWltpCombinedKm", 503, "Combined test, distinct from city range."),
      fact("rangeWltpCityKm", 664, "City test only; not combined range."),
      fact("chargingDcPeakKw", 120, "Peak charging power, not average.", "UP_TO"),
      fact("charging10To80Minutes", 29, "Manufacturer best-case; conditions pending."),
      fact("lengthMm", 4715, "Specification table."),
      fact("widthMm", 1890, "Mirror inclusion unspecified."),
      fact("heightMm", 1735, "Specification table."),
      fact("wheelbaseMm", 2680, "Specification table."),
      fact("seats", 5, "Specification table."),
      fact("towingBrakedKg", 1500, "Braked trailer."),
      fact("roofLoadKg", 75, "Specification table."),
      fact("warrantyYears", 7, "Whichever occurs first with mileage cap."),
      fact("warrantyKm", 150000, "New-car warranty mileage cap."),
      fact(
        "batteryWarrantyYears",
        10,
        "Whichever occurs first with mileage cap; exclusions/retention pending.",
      ),
      fact("batteryWarrantyKm", 1000000, "Battery warranty mileage cap."),
    ],
    {
      warnings: [
        "Boot volume conflicts: 703/793/839 L. Withheld.",
        "Payload conflicts with displayed mass difference; withheld.",
        "Exact trim/model year and homologation confirmation pending.",
      ],
      media: [
        media(
          "https://cdn.sanity.io/images/mcx434c9/production/9dea25c01de2384b305c1affb7d2a0b38bb55c6a-3000x2001.jpg",
          source("kgm"),
          "Torres EVX front exterior candidate",
        ),
      ],
    },
  ),
  record(
    "kgm",
    "torres-evx-price-pdf",
    "Torres EVX",
    [
      fact(
        "priceFromNok",
        399900,
        "2026 campaign, delivered Drammen including applicable VAT; expiry not stated.",
        "FROM",
        "VARIANT",
      ),
    ],
    {
      variantName: "Torres EVX campaign",
      sourceUrl:
        "https://cdn.sanity.io/files/mcx434c9/production/c5a4af0f67e40bfa81ed3e415a6733b196f0091e.pdf",
      warnings: [
        "Official price-list version 1.2026, page 1. Confirm campaign validity and align model year before linking specifications.",
      ],
    },
  ),
  ...(
    [
      ["pure-40", "Pure 40", 219900, 41, 281],
      ["pure-50", "Pure 50", 254900, 51.5, 374],
    ] as const
  ).map(([key, name, price, battery, range]) =>
    record(
      "jac",
      `e30x-${key}`,
      "E30X",
      [
        fact(
          "priceFromNok",
          price,
          "Named trim displayed price; delivery/tax terms pending.",
          "FROM",
          "VARIANT",
        ),
        fact(
          "batteryCapacityKwh",
          battery,
          "Table value; gross/usable unspecified.",
          "STATED",
          "VARIANT",
        ),
        fact("rangeWltpCombinedKm", range, "Combined specification table.", "STATED", "VARIANT"),
        fact("drivetrain", "FWD", "Model specification table.", "STATED", "VARIANT"),
      ],
      {
        variantName: name,
        warnings: [
          "Source contains inconsistent dimensions and weights; withheld. Nordic Edition battery conflicts with prose, so not normalized.",
        ],
        media:
          key === "pure-40"
            ? [
                media(
                  "https://cdn.sanity.io/images/mcx434c9/production/ecf0d6c490f1b83217665e619346d4f593a8cea3-3000x2001.jpg",
                  source("jac"),
                  "E30X model image; exact trim not confirmed",
                ),
              ]
            : [],
      },
    ),
  ),
  record(
    "smart",
    "5",
    "#5",
    [
      fact("drivetrain", "AWD", "Norwegian model described as AWD standard."),
      fact("heatPump", true, "Norwegian model described with heat pump."),
      fact("groundClearanceMm", 197, "Converted from 19.7 cm; loading condition unspecified."),
      fact("chargingDcPeakKw", 400, "Manufacturer advertised peak.", "UP_TO"),
      fact(
        "charging10To80Minutes",
        18,
        "Manufacturer best-case; battery/charger conditions require review.",
      ),
      fact("bootSeatsUpLitres", 630, "Rear luggage compartment, separate from frunk."),
      fact("frunkLitres", 45, "Separate front compartment."),
      fact("towingBrakedKg", 1600, "Maximum; exact trim/homologation pending.", "UP_TO"),
    ],
    {
      media: [
        media(
          "https://media.crystallize.com/bos-ecom-prod/26/7/28/eef146d9/host-kampanje-hero-2026-2.jpg",
          source("smart"),
          "smart #5 campaign scene; source describes Lofoten",
          false,
        ),
      ],
    },
  ),
  ...(
    [
      ["001", "001", 620],
      ["x", "X", 446],
      ["7x", "7X", 615],
      ["7gt", "7GT", 655],
    ] as const
  ).map(([key, name, range]) =>
    record(
      "zeekr",
      key,
      name,
      [
        fact(
          "rangeWltpCombinedKm",
          range,
          "Model headline; exact drivetrain/wheel configuration pending.",
          "UP_TO",
        ),
      ],
      {
        media:
          key === "7x"
            ? [
                media(
                  "https://www.datocms-assets.com/128969/1786023188-untitled-design-2026-08-06t153256-583.jpg?auto=format%2Ccompress%2Cenhance&q=65&w=1440",
                  source("zeekr"),
                  "Zeekr 7X model-section image candidate",
                ),
              ]
            : [],
      },
    ),
  ),
  ...(
    [
      ["ioniq9-rwd", "IONIQ 9", "RWD", 620],
      ["ioniq6-sr-rwd", "IONIQ 6", "Standard Range RWD", 521],
      ["ioniq6-lr-rwd", "IONIQ 6", "Long Range RWD", 680],
      ["ioniq6-lr-awd", "IONIQ 6", "Long Range AWD", 650],
      ["ioniq5-sr-rwd", "IONIQ 5", "Standard Range RWD", 440],
      ["ioniq5-lr-rwd", "IONIQ 5", "Long Range RWD", 570],
      ["ioniq5-lr-awd", "IONIQ 5", "Long Range AWD", 546],
      ["ioniq5n", "IONIQ 5 N", "N", 448],
      ["kona-sr", "KONA Electric", "Standard Range", 377],
      ["kona-lr", "KONA Electric", "Long Range", 514],
      ["inster-sr", "INSTER", "Standard Range", 327],
      ["inster-lr", "INSTER", "Long Range", 370],
      ["staria", "STARIA Electric", "Electric passenger", 430],
    ] as const
  ).map(([key, model, variant, range]) =>
    record(
      "hyundai",
      key,
      model,
      [
        fact(
          "rangeWltpCombinedKm",
          range,
          "Maximum in Norwegian WLTP footnote; wheel/trim dependent.",
          "UP_TO",
          "VARIANT",
        ),
      ],
      { variantName: variant },
    ),
  ),
  ...(
    [
      ["ix-xdrive60", "iX", "xDrive60 Active Edition", 701],
      ["ix-m70", "iX", "M70 xDrive Active Edition", 600],
      ["ix3-50", "iX3", "50 xDrive Active Edition", 805],
      ["ix1-20", "iX1", "eDrive20 Active Edition", 515],
      ["ix2-30", "iX2", "xDrive30 Active Edition", 479],
      ["i4-40", "i4", "eDrive40 Gran Coupe", 613],
      ["i4-m60", "i4", "M60 xDrive Gran Coupe", 551],
    ] as const
  ).map(([key, model, variant, range]) =>
    record(
      "bmw",
      key,
      model,
      [
        fact(
          "rangeWltpCombinedKm",
          range,
          "Upper end of configuration-dependent combined range interval.",
          "UP_TO",
          "VARIANT",
        ),
      ],
      { variantName: variant },
    ),
  ),
  ...(
    [
      ["enyaq", "Enyaq", 577, 585],
      ["elroq", "Elroq", 571, 470],
      ["epiq", "Epiq", 440, 475],
    ] as const
  ).map(([key, model, range, boot]) =>
    record("skoda", key, model, [
      fact("rangeWltpCombinedKm", range, "Model-family maximum; trim not identified.", "UP_TO"),
      fact("bootSeatsUpLitres", boot, "Model overview luggage figure; measurement method pending."),
    ]),
  ),
  record(
    "volvo",
    "ex60-p12-preliminary",
    "EX60",
    [
      fact("modelYear", 2027, "Displayed model year.", "STATED", "VARIANT"),
      fact(
        "rangeWltpCombinedKm",
        810,
        "Manufacturer explicitly marks range preliminary.",
        "PRELIMINARY",
        "VARIANT",
      ),
      fact("batteryCapacityKwh", 117, "Gross/usable basis not identified.", "STATED", "VARIANT"),
      fact(
        "charging10To80Minutes",
        19,
        "Preliminary estimate using a 400 kW station, not a verified vehicle peak.",
        "PRELIMINARY",
        "VARIANT",
      ),
      fact("drivetrain", "AWD", "P12 AWD.", "STATED", "VARIANT"),
    ],
    {
      variantName: "P12 AWD",
      sourceUrl: "https://www.volvocars.com/no/cars/ex60-electric/",
      warnings: [
        "Preliminary figures must not enter certified-WLTP comparison rankings. Starting price belongs to model family, not this variant.",
      ],
    },
  ),
];

export const officialNorwayBatch: EvidenceBatch = {
  schemaVersion: 1,
  id: "norway-official-2026-09-11-v1",
  observedOn,
  market: "NO",
  completeness: "PARTIAL",
  sources,
  records,
};
