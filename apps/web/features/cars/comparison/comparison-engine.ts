import { formatNok, getCarBySlug, nordicCars, type NordicCar } from "@/features/cars/data/nordic-cars";

export type ComparisonCategory =
  | "Price"
  | "Range"
  | "Battery"
  | "Power"
  | "Charging"
  | "Safety"
  | "Interior"
  | "Dimensions"
  | "Warranty"
  | "Performance";

export type ComparisonDirection = "higher" | "lower" | "boolean" | "neutral";

export type ComparisonMetricId =
  | "priceNok"
  | "monthlyNok"
  | "rangeWltpKm"
  | "winterRangeKm"
  | "batteryKwh"
  | "horsepower"
  | "fastChargingKw"
  | "chargingMinutes"
  | "safetyScore"
  | "interiorScore"
  | "lengthMm"
  | "bootLiters"
  | "warrantyYears"
  | "batteryWarrantyKm"
  | "accelerationSeconds"
  | "towingKg";

export type ComparisonVehicle = NordicCar & {
  key: string;
  addKey: string;
  horsepower: number;
  safetyScore: number;
  interiorScore: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  wheelbaseMm: number;
  bootLiters: number;
  warrantyYears: number;
  warrantyKm: number;
  batteryWarrantyYears: number;
  batteryWarrantyKm: number;
};

export type ComparisonCell = {
  carKey: string;
  rawValue: number | boolean | string;
  displayValue: string;
  isBest: boolean;
  score: number | null;
};

export type ComparisonRow = {
  id: ComparisonMetricId;
  category: ComparisonCategory;
  label: string;
  description: string;
  direction: ComparisonDirection;
  cells: ComparisonCell[];
};

export type ComparisonSection = {
  category: ComparisonCategory;
  rows: ComparisonRow[];
};

export type ComparisonChartSeries = {
  id: "range" | "cost" | "charging" | "performance";
  title: string;
  description: string;
  unit: string;
  direction: ComparisonDirection;
  points: Array<{
    carKey: string;
    label: string;
    value: number;
    displayValue: string;
    isBest: boolean;
  }>;
};

export type ComparisonSummary = {
  title: string;
  narrative: string;
  highlights: string[];
};

export type ComparisonResult = {
  vehicles: ComparisonVehicle[];
  sections: ComparisonSection[];
  rows: ComparisonRow[];
  scores: Array<{
    carKey: string;
    score: number;
    rank: number;
  }>;
  charts: ComparisonChartSeries[];
  summary: ComparisonSummary;
};

type EnrichedSpec = Omit<
  ComparisonVehicle,
  | keyof NordicCar
  | "key"
  | "addKey"
>;

type ComparisonMetric = {
  id: ComparisonMetricId;
  category: ComparisonCategory;
  label: string;
  description: string;
  direction: ComparisonDirection;
  weight: number;
  value: (car: ComparisonVehicle) => number | boolean | string;
  format: (value: number | boolean | string, car: ComparisonVehicle) => string;
};

const defaultVehicleKeys = [
  "tesla:model-y-long-range",
  "bmw:ix-xdrive50",
  "hyundai:ioniq-5-awd",
];

const supplementalSpecs: Record<string, EnrichedSpec> = {
  "tesla:model-y-long-range": {
    horsepower: 384,
    safetyScore: 9.4,
    interiorScore: 8.7,
    lengthMm: 4751,
    widthMm: 1921,
    heightMm: 1624,
    wheelbaseMm: 2890,
    bootLiters: 854,
    warrantyYears: 5,
    warrantyKm: 100000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 192000,
  },
  "porsche:macan-electric-4": {
    horsepower: 408,
    safetyScore: 9.0,
    interiorScore: 9.2,
    lengthMm: 4784,
    widthMm: 1938,
    heightMm: 1622,
    wheelbaseMm: 2893,
    bootLiters: 540,
    warrantyYears: 5,
    warrantyKm: 100000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 160000,
  },
  "bmw:ix-xdrive50": {
    horsepower: 523,
    safetyScore: 9.2,
    interiorScore: 9.4,
    lengthMm: 4953,
    widthMm: 1967,
    heightMm: 1695,
    wheelbaseMm: 3000,
    bootLiters: 500,
    warrantyYears: 5,
    warrantyKm: 100000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 160000,
  },
  "volvo:ex90-twin-motor": {
    horsepower: 408,
    safetyScore: 9.7,
    interiorScore: 9.1,
    lengthMm: 5037,
    widthMm: 1964,
    heightMm: 1744,
    wheelbaseMm: 2985,
    bootLiters: 310,
    warrantyYears: 5,
    warrantyKm: 100000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 160000,
  },
  "hyundai:ioniq-5-awd": {
    horsepower: 325,
    safetyScore: 8.8,
    interiorScore: 8.5,
    lengthMm: 4635,
    widthMm: 1890,
    heightMm: 1605,
    wheelbaseMm: 3000,
    bootLiters: 527,
    warrantyYears: 5,
    warrantyKm: 100000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 160000,
  },
  "nio:et5-touring": {
    horsepower: 489,
    safetyScore: 8.7,
    interiorScore: 8.9,
    lengthMm: 4790,
    widthMm: 1960,
    heightMm: 1499,
    wheelbaseMm: 2888,
    bootLiters: 450,
    warrantyYears: 5,
    warrantyKm: 150000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 160000,
  },
  "audi:q8-e-tron-55-quattro": {
    horsepower: 408,
    safetyScore: 9.1,
    interiorScore: 9.0,
    lengthMm: 4915,
    widthMm: 1937,
    heightMm: 1633,
    wheelbaseMm: 2928,
    bootLiters: 569,
    warrantyYears: 5,
    warrantyKm: 100000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 160000,
  },
  "kia:ev9-gt-line-awd": {
    horsepower: 385,
    safetyScore: 9.3,
    interiorScore: 8.8,
    lengthMm: 5015,
    widthMm: 1980,
    heightMm: 1780,
    wheelbaseMm: 3100,
    bootLiters: 333,
    warrantyYears: 7,
    warrantyKm: 150000,
    batteryWarrantyYears: 7,
    batteryWarrantyKm: 150000,
  },
  "polestar:polestar-2-long-range": {
    horsepower: 421,
    safetyScore: 9.0,
    interiorScore: 8.6,
    lengthMm: 4606,
    widthMm: 1859,
    heightMm: 1479,
    wheelbaseMm: 2735,
    bootLiters: 405,
    warrantyYears: 5,
    warrantyKm: 100000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 160000,
  },
  "porsche:taycan-4s": {
    horsepower: 544,
    safetyScore: 8.9,
    interiorScore: 9.5,
    lengthMm: 4963,
    widthMm: 1966,
    heightMm: 1379,
    wheelbaseMm: 2900,
    bootLiters: 407,
    warrantyYears: 5,
    warrantyKm: 100000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 160000,
  },
  "byd:seal-excellence-awd": {
    horsepower: 530,
    safetyScore: 8.8,
    interiorScore: 8.4,
    lengthMm: 4800,
    widthMm: 1875,
    heightMm: 1460,
    wheelbaseMm: 2920,
    bootLiters: 400,
    warrantyYears: 6,
    warrantyKm: 150000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 200000,
  },
};

const comparisonMetrics: ComparisonMetric[] = [
  {
    id: "priceNok",
    category: "Price",
    label: "Price from",
    description: "Norwegian starting price estimate.",
    direction: "lower",
    weight: 1.2,
    value: (car) => car.priceNok,
    format: (value) => formatNok(Number(value)),
  },
  {
    id: "monthlyNok",
    category: "Price",
    label: "Monthly estimate",
    description: "Estimated monthly ownership payment.",
    direction: "lower",
    weight: 0.7,
    value: (car) => car.monthlyNok,
    format: (value) => formatNok(Number(value)),
  },
  {
    id: "rangeWltpKm",
    category: "Range",
    label: "WLTP range",
    description: "Official combined electric range.",
    direction: "higher",
    weight: 1.15,
    value: (car) => car.rangeWltpKm,
    format: (value) => `${value} km`,
  },
  {
    id: "winterRangeKm",
    category: "Range",
    label: "Winter range",
    description: "NordicDrive cold-weather planning estimate.",
    direction: "higher",
    weight: 1.35,
    value: (car) => car.winterRangeKm,
    format: (value) => `${value} km`,
  },
  {
    id: "batteryKwh",
    category: "Battery",
    label: "Battery",
    description: "Usable battery capacity estimate.",
    direction: "higher",
    weight: 0.7,
    value: (car) => car.batteryKwh,
    format: (value) => `${value} kWh`,
  },
  {
    id: "horsepower",
    category: "Power",
    label: "Horsepower",
    description: "Peak system output estimate.",
    direction: "higher",
    weight: 0.75,
    value: (car) => car.horsepower,
    format: (value) => `${value} hp`,
  },
  {
    id: "fastChargingKw",
    category: "Charging",
    label: "Peak DC charging",
    description: "Maximum fast-charging power.",
    direction: "higher",
    weight: 0.9,
    value: (car) => car.fastChargingKw,
    format: (value) => `${value} kW`,
  },
  {
    id: "chargingMinutes",
    category: "Charging",
    label: "10-80% charging",
    description: "Typical fast-charge window.",
    direction: "lower",
    weight: 1,
    value: (car) => car.chargingMinutes,
    format: (value) => `${value} min`,
  },
  {
    id: "safetyScore",
    category: "Safety",
    label: "Safety score",
    description: "NordicDrive safety confidence score.",
    direction: "higher",
    weight: 1.1,
    value: (car) => car.safetyScore,
    format: (value) => `${Number(value).toFixed(1)}/10`,
  },
  {
    id: "interiorScore",
    category: "Interior",
    label: "Interior score",
    description: "Cabin quality, ergonomics, space, and technology.",
    direction: "higher",
    weight: 0.85,
    value: (car) => car.interiorScore,
    format: (value) => `${Number(value).toFixed(1)}/10`,
  },
  {
    id: "lengthMm",
    category: "Dimensions",
    label: "Length",
    description: "Overall vehicle length.",
    direction: "neutral",
    weight: 0,
    value: (car) => car.lengthMm,
    format: (value, car) => `${value} x ${car.widthMm} x ${car.heightMm} mm`,
  },
  {
    id: "bootLiters",
    category: "Dimensions",
    label: "Boot space",
    description: "Primary cargo volume estimate.",
    direction: "higher",
    weight: 0.65,
    value: (car) => car.bootLiters,
    format: (value) => `${value} L`,
  },
  {
    id: "warrantyYears",
    category: "Warranty",
    label: "Vehicle warranty",
    description: "Main vehicle warranty coverage.",
    direction: "higher",
    weight: 0.5,
    value: (car) => car.warrantyYears,
    format: (value, car) => `${value} years / ${formatNumber(car.warrantyKm)} km`,
  },
  {
    id: "batteryWarrantyKm",
    category: "Warranty",
    label: "Battery warranty",
    description: "Battery warranty coverage.",
    direction: "higher",
    weight: 0.55,
    value: (car) => car.batteryWarrantyKm,
    format: (value, car) => `${car.batteryWarrantyYears} years / ${formatNumber(Number(value))} km`,
  },
  {
    id: "accelerationSeconds",
    category: "Performance",
    label: "0-100 km/h",
    description: "Acceleration benchmark.",
    direction: "lower",
    weight: 0.8,
    value: (car) => car.accelerationSeconds,
    format: (value) => `${Number(value).toFixed(1)} s`,
  },
  {
    id: "towingKg",
    category: "Performance",
    label: "Towing",
    description: "Braked trailer capacity.",
    direction: "higher",
    weight: 0.55,
    value: (car) => car.towingKg,
    format: (value) => `${value} kg`,
  },
];

export function getVehicleKey(car: Pick<NordicCar, "brandSlug" | "modelSlug">) {
  return `${car.brandSlug}:${car.modelSlug}`;
}

export function getVehicleAddKey(car: Pick<NordicCar, "brandSlug" | "modelSlug">) {
  return `${car.brandSlug}-${car.modelSlug}`;
}

export function enrichCar(car: NordicCar): ComparisonVehicle {
  const key = getVehicleKey(car);
  const spec = supplementalSpecs[key] ?? createFallbackSpec(car);

  return {
    ...car,
    ...spec,
    key,
    addKey: getVehicleAddKey(car),
  };
}

export function getAllComparisonVehicles() {
  return nordicCars.map(enrichCar);
}

export function resolveComparisonVehicles(input: {
  vehicles?: string | string[] | null | undefined;
  add?: string | string[] | null | undefined;
}) {
  const requestedKeys = normalizeRequestedKeys(input.vehicles);
  const addKeys = normalizeRequestedKeys(input.add)
    .map(resolveAnyVehicleKey)
    .filter(isString);

  const selected = [...requestedKeys.map(resolveAnyVehicleKey).filter(isString), ...addKeys];
  const uniqueKeys = selected.filter((key, index, keys) => keys.indexOf(key) === index).slice(0, 4);
  const fallbackKeys = uniqueKeys.length > 0 ? defaultVehicleKeys : defaultVehicleKeys.slice(0, 3);

  const finalKeys = [...uniqueKeys, ...fallbackKeys.filter((key) => !uniqueKeys.includes(key))].slice(0, 4);

  return finalKeys.map(resolveVehicleByKey).filter(isNordicCar).map(enrichCar);
}

export function buildComparison(vehicles: ComparisonVehicle[]): ComparisonResult {
  const rows = comparisonMetrics.map((metric) => buildRow(metric, vehicles));
  const sections = groupRows(rows);
  const scores = calculateScores(rows, vehicles);
  const summary = createComparisonSummary(vehicles, rows, scores);

  return {
    vehicles,
    rows,
    sections,
    scores,
    charts: createChartSeries(vehicles, rows),
    summary,
  };
}

export function createComparisonFromParams(input: {
  vehicles?: string | string[] | null | undefined;
  add?: string | string[] | null | undefined;
}) {
  return buildComparison(resolveComparisonVehicles(input));
}

export function formatComparisonVehiclesParam(keys: string[]) {
  return keys.slice(0, 4).join(",");
}

function buildRow(metric: ComparisonMetric, vehicles: ComparisonVehicle[]): ComparisonRow {
  const values = vehicles.map((car) => metric.value(car));
  const bestValue = getBestValue(values, metric.direction);

  return {
    id: metric.id,
    category: metric.category,
    label: metric.label,
    description: metric.description,
    direction: metric.direction,
    cells: vehicles.map((car) => {
      const rawValue = metric.value(car);
      return {
        carKey: car.key,
        rawValue,
        displayValue: metric.format(rawValue, car),
        isBest: metric.direction !== "neutral" && rawValue === bestValue,
        score: scoreValue(rawValue, values, metric.direction),
      };
    }),
  };
}

function getBestValue(values: Array<number | boolean | string>, direction: ComparisonDirection) {
  if (direction === "boolean") {
    return values.includes(true);
  }

  const numericValues = values.map(Number).filter(Number.isFinite);
  if (numericValues.length === 0 || direction === "neutral") {
    return null;
  }

  return direction === "lower" ? Math.min(...numericValues) : Math.max(...numericValues);
}

function scoreValue(value: number | boolean | string, values: Array<number | boolean | string>, direction: ComparisonDirection) {
  if (direction === "neutral") {
    return null;
  }

  if (direction === "boolean") {
    return value === true ? 100 : 0;
  }

  const numericValue = Number(value);
  const numericValues = values.map(Number).filter(Number.isFinite);

  if (!Number.isFinite(numericValue) || numericValues.length === 0) {
    return null;
  }

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  if (min === max) {
    return 100;
  }

  const ratio = direction === "higher" ? (numericValue - min) / (max - min) : (max - numericValue) / (max - min);
  return Math.round(ratio * 100);
}

function calculateScores(rows: ComparisonRow[], vehicles: ComparisonVehicle[]) {
  const weightedMetrics = comparisonMetrics.filter((metric) => metric.weight > 0);

  return vehicles
    .map((car) => {
      const totalWeight = weightedMetrics.reduce((total, metric) => total + metric.weight, 0);
      const weightedScore = weightedMetrics.reduce((total, metric) => {
        const row = rows.find((candidate) => candidate.id === metric.id);
        const cell = row?.cells.find((candidate) => candidate.carKey === car.key);
        return total + (cell?.score ?? 0) * metric.weight;
      }, 0);

      return {
        carKey: car.key,
        score: Math.round(weightedScore / totalWeight),
        rank: 0,
      };
    })
    .sort((left, right) => right.score - left.score)
    .map((score, index) => ({
      ...score,
      rank: index + 1,
    }));
}

function createChartSeries(vehicles: ComparisonVehicle[], rows: ComparisonRow[]): ComparisonChartSeries[] {
  return [
    createChart("range", "Winter Range", "Cold-weather planning range for Norway.", "km", "higher", "winterRangeKm", vehicles, rows),
    createChart("cost", "Price", "Lower starting price scores best.", "NOK", "lower", "priceNok", vehicles, rows),
    createChart("charging", "Charging Window", "Lower 10-80% time is better.", "min", "lower", "chargingMinutes", vehicles, rows),
    createChart("performance", "0-100 km/h", "Lower acceleration time is better.", "s", "lower", "accelerationSeconds", vehicles, rows),
  ];
}

function createChart(
  id: ComparisonChartSeries["id"],
  title: string,
  description: string,
  unit: string,
  direction: ComparisonDirection,
  metricId: ComparisonMetricId,
  vehicles: ComparisonVehicle[],
  rows: ComparisonRow[],
): ComparisonChartSeries {
  const row = rows.find((candidate) => candidate.id === metricId);

  return {
    id,
    title,
    description,
    unit,
    direction,
    points: vehicles.map((car) => {
      const cell = row?.cells.find((candidate) => candidate.carKey === car.key);
      return {
        carKey: car.key,
        label: `${car.brand} ${car.model}`,
        value: Number(cell?.rawValue ?? 0),
        displayValue: cell?.displayValue ?? "-",
        isBest: Boolean(cell?.isBest),
      };
    }),
  };
}

function createComparisonSummary(
  vehicles: ComparisonVehicle[],
  rows: ComparisonRow[],
  scores: ComparisonResult["scores"],
): ComparisonSummary {
  const topScore = scores[0];
  const fallbackVehicle = vehicles[0];

  if (!fallbackVehicle) {
    return {
      title: "Comparison ready",
      narrative: "Add vehicles to generate a NordicDrive recommendation summary.",
      highlights: ["Select two to four vehicles to compare price, range, charging, safety, and performance."],
    };
  }

  const winner = vehicles.find((car) => car.key === topScore?.carKey) ?? fallbackVehicle;
  const rangeLeader = getLeader(vehicles, rows, "winterRangeKm") ?? fallbackVehicle;
  const valueLeader = getValueLeader(vehicles) ?? fallbackVehicle;
  const chargingLeader = getLeader(vehicles, rows, "chargingMinutes") ?? fallbackVehicle;

  return {
    title: winner ? `${winner.brand} ${winner.model} leads this comparison` : "Comparison ready",
    narrative: winner
      ? `${winner.brand} ${winner.model} has the strongest blended score across Nordic winter range, charging, safety, comfort, ownership cost, and performance. ${rangeLeader.brand} ${rangeLeader.model} is the range benchmark here, while ${valueLeader.brand} ${valueLeader.model} offers the sharpest price-to-winter-range value.`
      : "Add vehicles to generate a NordicDrive recommendation summary.",
    highlights: [
      `${rangeLeader.brand} ${rangeLeader.model} has the strongest winter range at ${rangeLeader.winterRangeKm} km.`,
      `${chargingLeader.brand} ${chargingLeader.model} has the quickest 10-80% charge window at ${chargingLeader.chargingMinutes} minutes.`,
      `${valueLeader.brand} ${valueLeader.model} delivers ${Math.round(valueLeader.winterRangeKm / (valueLeader.priceNok / 100000))} winter km per NOK 100k.`,
    ],
  };
}

function getLeader(vehicles: ComparisonVehicle[], rows: ComparisonRow[], metricId: ComparisonMetricId) {
  const row = rows.find((candidate) => candidate.id === metricId);
  const bestCell = row?.cells.find((cell) => cell.isBest);
  return vehicles.find((car) => car.key === bestCell?.carKey) ?? vehicles[0];
}

function getValueLeader(vehicles: ComparisonVehicle[]) {
  return [...vehicles].sort(
    (left, right) => right.winterRangeKm / right.priceNok - left.winterRangeKm / left.priceNok,
  )[0];
}

function isString(value: string | null): value is string {
  return typeof value === "string";
}

function isNordicCar(value: NordicCar | undefined): value is NordicCar {
  return Boolean(value);
}

function groupRows(rows: ComparisonRow[]): ComparisonSection[] {
  return rows.reduce<ComparisonSection[]>((sections, row) => {
    const section = sections.find((candidate) => candidate.category === row.category);
    if (section) {
      section.rows.push(row);
    } else {
      sections.push({ category: row.category, rows: [row] });
    }
    return sections;
  }, []);
}

function normalizeRequestedKeys(value: string | string[] | null | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.flatMap((entry) => entry.split(",")).map((entry) => entry.trim()).filter(Boolean);
}

function resolveAnyVehicleKey(value: string) {
  if (value.includes(":")) {
    return resolveVehicleByKey(value) ? value : null;
  }

  const car = nordicCars.find((candidate) => getVehicleAddKey(candidate) === value);
  if (car) {
    return getVehicleKey(car);
  }

  const [brandSlug, ...modelParts] = value.split("-");
  const modelSlug = modelParts.join("-");
  return brandSlug && modelSlug && getCarBySlug(brandSlug, modelSlug) ? `${brandSlug}:${modelSlug}` : null;
}

function resolveVehicleByKey(key: string) {
  const [brandSlug, modelSlug] = key.split(":");
  return brandSlug && modelSlug ? getCarBySlug(brandSlug, modelSlug) : undefined;
}

function createFallbackSpec(car: NordicCar): EnrichedSpec {
  const sizeBase = car.segment === "SUV" ? 4900 : car.segment === "Wagon" ? 4800 : 4650;
  const horsepower = Math.round(220 + car.batteryKwh * 2.6 + (car.drivetrain === "AWD" ? 70 : 0));

  return {
    horsepower,
    safetyScore: car.seats >= 7 ? 9.1 : 8.7,
    interiorScore: car.priceNok > 700000 ? 9 : 8.4,
    lengthMm: sizeBase,
    widthMm: car.segment === "SUV" ? 1940 : 1875,
    heightMm: car.segment === "SUV" ? 1680 : 1480,
    wheelbaseMm: car.segment === "SUV" ? 2950 : 2870,
    bootLiters: car.segment === "SUV" ? 560 : 430,
    warrantyYears: 5,
    warrantyKm: 100000,
    batteryWarrantyYears: 8,
    batteryWarrantyKm: 160000,
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 0,
  }).format(value);
}
