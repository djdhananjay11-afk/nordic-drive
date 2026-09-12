import { fieldUnits, type FactField } from "./fields.js";
import type { BrandSource, EvidenceBatch, EvidenceRecord, Fact, MediaCandidate } from "./types.js";

const observedOn = "2026-09-12";
const mazdaPdf = "https://media-assets.mazda.eu/raw/upload/mazdano/globalassets/mmn-local-pages/prislister/mazda6e_pricelist_no_eaa_compliance_2.pdf?rnd=4a847d";
const sources: BrandSource[] = [
  { slug: "dongfeng", name: "Dongfeng", url: "https://www.dong-feng.no/box/spesifikasjoner", status: "CONTENT_READ", notes: "BOX trim table; conflicts with model page in base range, capacity, dimensions and luggage." },
  { slug: "ds", name: "DS Automobiles", url: "https://www.bos.no/bil/ds-automobiles/ds-3", status: "CONTENT_READ", notes: "Norwegian Bertel O. Steen product specifications; current sales status and model year unconfirmed." },
  { slug: "hongqi", name: "Hongqi", url: "https://hongqi.no/biler/ehs5/spesifikasjoner/", status: "CONTENT_READ", notes: "EHS5 Exclusive 4WD table read; do not sum motor outputs into certified system power." },
  { slug: "jeep", name: "Jeep", url: "https://www.jeep.com/no/modeller/jeep-avenger/elektrisk.html", status: "CONTENT_READ", notes: "Avenger electric trim prices; charging energy/power unit error withheld." },
  { slug: "lexus", name: "Lexus", url: "https://www.lexus.no/new-cars/rz/overview", status: "CONTENT_READ", notes: "RZ 350e/500e/550e separated; conflicting 350e range and acceleration unit typo withheld." },
  { slug: "maxus", name: "Maxus", url: "https://maxus.no/modeller/mifa-9", status: "CONTENT_READ", notes: "MIFA9 passenger specification table, not two-seat commercial model." },
  { slug: "mazda", name: "Mazda", url: mazdaPdf, status: "CONTENT_READ", notes: "Official Norwegian 6e PDF accessible despite empty model index; historical specification observation, not a current price offer." },
  { slug: "mercedes-benz", name: "Mercedes-Benz", url: "https://artikler.mercedes-benz.no/specialedition/eqa/", status: "CONTENT_READ", notes: "EQA Special Edition offer expired June 30, 2026; price withheld, only historical equipment observation." },
  { slug: "mini", name: "MINI", url: "https://www.mini.no/no_NO/home.html", status: "CONTENT_READ", notes: "Cooper Electric and Aceman combined/city WLTP envelopes; exact trim data still dynamic." },
  { slug: "subaru", name: "Subaru", url: "https://www.subaru.no/biler/solterra", status: "CONTENT_READ", notes: "Updated Solterra; conflicting offer prices and conditional service cover must not be merged." },
  { slug: "voyah", name: "Voyah", url: "https://www.voyah.no/voyah-courage", status: "CONTENT_READ", notes: "Courage source differs from homepage range and charging; NAF result not manufacturer charging claim." },
];

function fact(field: FactField, value: Fact["value"], qualification: string, basis: Fact["basis"] = "STATED", scope: Fact["scope"] = "MODEL"): Fact {
  return { field, value, unit: fieldUnits[field], qualification, basis, scope };
}

function record(brandSlug: string, key: string, modelName: string, facts: Fact[], options: Partial<Pick<EvidenceRecord, "variantName" | "sourceUrl" | "warnings" | "media">> = {}): EvidenceRecord {
  const source = sources.find((entry) => entry.slug === brandSlug);
  if (!source) throw new Error(`Missing source ${brandSlug}`);
  return { brandSlug, key: `${brandSlug}/${key}`, modelName, sourceUrl: source.url, observedOn, facts, media: [], warnings: ["Partial research only; exact Norwegian model year, trim and present availability need review."], ...options };
}

function media(url: string, sourceUrl: string, subject: string, failed = false): MediaCandidate {
  return { url, sourceUrl, subject, rightsStatus: "UNVERIFIED", visualStatus: "NOT_INSPECTED", availability: failed ? "FETCH_FAILED" : "NOT_CHECKED" };
}

const records: EvidenceRecord[] = [
  ...([ ["go", "GO", 3.3], ["long-range", "Long Range", 6.6] ] as const).map(([key, variantName, ac]) => record("dongfeng", `box-${key}-charging`, "BOX", [
    fact("powerKw", 70, "Trim table.", "STATED", "VARIANT"),
    fact("chargingAcKw", ac, "Trim-specific AC limit.", "STATED", "VARIANT"),
    fact("chargingDcPeakKw", 70, "DC peak.", "UP_TO", "VARIANT"),
    fact("charging10To80Minutes", 30, "DC 10-80%; temperature conditions unspecified.", "STATED", "VARIANT"),
    fact("seats", 5, "Both trims.", "STATED", "VARIANT"),
  ], { variantName, warnings: ["Model page versus table: GO 240/230 km, 31.5/31.4 kWh, length 4030/4020 mm, luggage 326/376 L. Disputed fields withheld. 2WD does not identify driven axle."] })),
  record("dongfeng", "box-media", "BOX", [], { sourceUrl: "https://www.dong-feng.no/box", media: [media("https://cdn.prod.website-files.com/68b061d4456fe05198a49e1f/68b9b858488249132ae149d0_box-mobile.avif", "https://www.dong-feng.no/box", "BOX exterior; photograph/render and generation unverified.", true)] }),
  record("ds", "ds3-e-tense-specifications", "DS 3 E-TENSE", [
    fact("batteryCapacityKwh", 54, "Gross/usable not specified."),
    fact("powerPs", 156, "Norwegian hk."),
    fact("drivetrain", "FWD", "Explicit front-wheel drive."),
    fact("chargingAcKw", 11, "Onboard AC."),
    fact("chargingDcPeakKw", 100, "DC power.", "UP_TO"),
    fact("bootSeatsUpLitres", 350, "Rear luggage; measurement standard unspecified."),
    fact("seats", 5, "Product table."),
  ], { warnings: ["Dated awards and expression-of-interest form do not confirm current sales. Consumption lacks cycle, range lacks explicit combined qualifier; omitted. Stated zero towing retained as a review note, not an unknown value."] }),
  record("hongqi", "ehs5-exclusive-specifications", "EHS5", [
    fact("priceFromNok", 439900, "Delivery to dealer included; taxes/options and offer validity pending.", "FROM", "VARIANT"),
    fact("chargingAcKw", 11, "Specification table.", "STATED", "VARIANT"),
    fact("chargingDcPeakKw", 265, "Peak DC CCS2.", "UP_TO", "VARIANT"),
    fact("charging10To80Minutes", 20, "Claimed <=20 minutes; charger and temperature dependent.", "UP_TO", "VARIANT"),
    fact("lengthMm", 4750, "Table.", "STATED", "VARIANT"),
    fact("widthMm", 1900, "Mirror basis unconfirmed.", "STATED", "VARIANT"),
    fact("heightMm", 1640, "Table.", "STATED", "VARIANT"),
    fact("wheelbaseMm", 2900, "Table.", "STATED", "VARIANT"),
    fact("bootSeatsUpLitres", 462, "Rear storage.", "STATED", "VARIANT"),
    fact("bootSeatsDownLitres", 1601, "Two-seat configuration.", "STATED", "VARIANT"),
    fact("frunkLitres", 48, "Front storage.", "STATED", "VARIANT"),
    fact("heatPump", true, "Equipment table.", "STATED", "VARIANT"),
    fact("batteryPreconditioning", true, "Equipment table.", "STATED", "VARIANT"),
  ], { variantName: "Exclusive 4WD", warnings: ["Motor power given per axle; no derived system output. Crash-test protocol and warranty terms require separate verification."] }),
  record("hongqi", "ehs5-battery-range", "EHS5", [
    fact("batteryGrossKwh", 85, "Exclusive listing explicitly says gross.", "STATED", "VARIANT"),
    fact("rangeWltpCombinedKm", 522, "Combined WLTP for Exclusive.", "UP_TO", "VARIANT"),
    fact("drivetrain", "AWD", "Exclusive 4WD listing.", "STATED", "VARIANT"),
  ], { variantName: "Exclusive 4WD", sourceUrl: "https://hongqi.no/", media: [media("https://images.ctfassets.net/mt8w0y3iajsh/zEMLwVWB34s3kpi1hfvKq/cbd2efeb2f87713438e80b395badca28/EHS5front.jpg?fit=pad&h=600&q=90&w=1140", "https://hongqi.no/", "EHS5 front; photo authenticity and exact trim unverified.")] }),
  ...([ ["altitude", "Altitude", 299900], ["85th", "85th Anniversary", 314900], ["summit", "Summit", 334900] ] as const).map(([key, variantName, price]) => record("jeep", `avenger-${key}-price`, "Avenger Electric", [
    fact("priceFromNok", price, "Electric trim starting price; taxes, delivery and validity pending.", "FROM", "VARIANT"),
  ], { variantName })),
  record("jeep", "avenger-charging", "Avenger Electric", [
    fact("charging20To80Minutes", 27, "Explicit DC 20-80% claim, not 10-80%."),
    fact("bootSeatsUpLitres", 355, "Model-level maximum.", "UP_TO"),
    fact("bootSeatsDownLitres", 1250, "Rear seats folded.", "UP_TO"),
  ], { warnings: ["Power headline wrongly uses kWh; DC peak omitted. Dimensions require brochure check. Equipment and range not tied to exact model year."] }),
  ...([ ["350e", "FWD", 165], ["500e", "AWD", 280], ["550e", "AWD", 300] ] as const).map(([variantName, drivetrain, power]) => record("lexus", `rz-${variantName}-power`, "RZ", [
    fact("powerKw", power, "Named powertrain listing.", "STATED", "VARIANT"),
    fact("drivetrain", drivetrain, "Named powertrain listing.", "STATED", "VARIANT"),
  ], { variantName, warnings: ["350e range differs within page (559/590). Acceleration unit says 0-62 m/s; do not silently interpret as 0-100 km/h. Trim, homologation and current offer pending."] })),
  record("lexus", "rz-media", "RZ", [], { media: [media("https://scene7.toyota.eu/is/image/toyotaeurope/2026-lexus-rz-signposting-rz-performance-1024x1024-161130?scl=1", "https://www.lexus.no/new-cars/rz/overview", "RZ driving image; exact trim and photo authenticity unverified.")] }),
  record("maxus", "mifa9-specifications", "MIFA9", [
    fact("batteryCapacityKwh", 90, "Gross/usable not specified."),
    fact("rangeWltpCombinedKm", 430, "Combined, not urban 565 km."),
    fact("rangeWltpCityKm", 565, "Urban cycle only."),
    fact("lengthMm", 5270, "Table."), fact("widthMm", 2000, "Mirror basis unconfirmed."),
    fact("heightMm", 1840, "Table."), fact("wheelbaseMm", 3200, "Table."),
    fact("powerKw", 180, "Table."), fact("drivetrain", "FWD", "Table."),
    fact("seats", 7, "Passenger model."),
    fact("towingBrakedKg", 1000, "Braked trailer."),
    fact("towingUnbrakedKg", 750, "Unbraked trailer."),
  ], { warnings: ["Charging time lacks unit/window; omitted. Price and exact trim unknown. Confirm Norwegian model-year availability."] }),
  ...([ ["standard", "258 hk", 68.8, 479, 24, 7.6], ["long-range", "Long Range 245 hk", 80, 552, 47, 7.8] ] as const).map(([key, variantName, battery, range, minutes, acceleration]) => record("mazda", `6e-${key}-pdf`, "Mazda6e", [
    fact("batteryCapacityKwh", battery, "PDF page 13; gross/usable unspecified.", "STATED", "VARIANT"),
    fact("rangeWltpCombinedKm", range, "Combined, page 13.", "STATED", "VARIANT"),
    fact("charging10To80Minutes", minutes, "DC 10-80%, page 13.", "STATED", "VARIANT"),
    fact("acceleration0To100Seconds", acceleration, "Page 13.", "STATED", "VARIANT"),
    fact("drivetrain", "RWD", "Page 13.", "STATED", "VARIANT"),
  ], { variantName, warnings: ["Historical Norwegian PDF, not current price evidence. Recheck production model year and order status. Width mirror basis and inconsistent folded luggage labels withheld."] })),
  record("mercedes-benz", "eqa-300-special-edition-historical", "EQA", [
    fact("drivetrain", "AWD", "Named 4MATIC equipment description.", "STATED", "VARIANT"),
    fact("bootSeatsUpLitres", 340, "Page headline; measurement method pending."),
  ], { variantName: "300 4MATIC Special Edition Plus", warnings: ["Historical expired campaign: ended 2026-06-30. No current price accepted. Maximum range and tow value may cover other configurations; omitted. Spectral Blue shown in media is unavailable per page."] }),
  ...([ ["cooper", "Cooper Electric", 400, 513], ["aceman", "Aceman", 405, 511] ] as const).map(([key, modelName, combined, city]) => record("mini", `${key}-wltp-envelope`, modelName, [
    fact("rangeWltpCombinedKm", combined, "Maximum across model configurations; not base trim.", "UP_TO"),
    fact("rangeWltpCityKm", city, "Urban maximum across configurations.", "UP_TO"),
  ], { warnings: ["Exact trim and wheel size pending. Combustion Cooper and Countryman prices excluded."] })),
  record("subaru", "solterra-updated-specifications", "Solterra", [
    fact("batteryCapacityKwh", 73.1, "Updated model; gross/usable unspecified."),
    fact("rangeWltpCombinedKm", 509, "Page calls WLTP figure estimated; exact trim pending.", "PRELIMINARY"),
    fact("chargingAcKw", 22, "Model capability, trim fitment pending.", "UP_TO"),
    fact("chargingDcPeakKw", 150, "DC capability.", "UP_TO"),
    fact("drivetrain", "AWD", "Permanent four-wheel drive."),
    fact("batteryPreconditioning", true, "Automatic route-based or manual activation."),
  ], { warnings: ["Offer prices differ between homepage and model page; omitted. Service-activated ten-year cover is not an unconditional new-car warranty."], media: [media("https://cdn.sanity.io/images/6240rmr0/production/cd5cbb345ccc6dae65b4432576cfc322a155760a-3008x2159.jpg?auto=format&w=1280", "https://www.subaru.no/biler/solterra", "Updated Solterra exterior; rights and generation inspection pending.", true)] }),
  record("voyah", "courage-practicality", "Courage", [
    fact("bootSeatsUpLitres", 527, "Model page; measurement basis pending."),
    fact("warrantyYears", 5, "Paired with mileage limit; exclusions pending."),
    fact("warrantyKm", 150000, "Paired with five years."),
  ], { warnings: ["Homepage 470 km/35 minutes differs from product page 476 km/26 minutes. Latter time attributed to NAF; excluded until original test/configuration checked. No unsupported battery or heat-pump claims."] }),
];

export const officialNorwayFollowupBatch: EvidenceBatch = {
  schemaVersion: 1, id: "norway-official-2026-09-12-v2", observedOn, market: "NO", completeness: "PARTIAL", sources, records,
};
