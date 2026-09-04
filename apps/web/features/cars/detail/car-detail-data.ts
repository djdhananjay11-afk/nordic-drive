import type { NordicCar } from "@/features/cars/data/nordic-cars";

export type VehicleColorOption = {
  name: string;
  value: string;
};

export type WheelOption = {
  name: string;
  finish: string;
};

export type CarVariant = {
  name: string;
  priceNok: number;
  rangeKm: number;
  accelerationSeconds: number;
  drivetrain: string;
};

export type CarReview = {
  source: string;
  rating: string;
  summary: string;
};

export type CarDetailExperience = {
  viewer: {
    modelUrl?: string;
    environmentUrl?: string;
    fallbackGeometry: "suv" | "sedan" | "crossover" | "wagon";
    defaultColor: string;
    colors: VehicleColorOption[];
    wheels: WheelOption[];
  };
  gallery: Array<{
    title: string;
    description: string;
    gradient: string;
  }>;
  videos: Array<{
    title: string;
    duration: string;
    description: string;
  }>;
  reviews: CarReview[];
  variants: CarVariant[];
  aiSummary: string;
};

const teslaExperience: CarDetailExperience = {
  viewer: {
    fallbackGeometry: "suv",
    defaultColor: "#f8fafc",
    colors: [
      { name: "Pearl White", value: "#f8fafc" },
      { name: "Stealth Grey", value: "#3f4652" },
      { name: "Ultra Red", value: "#b91c1c" },
      { name: "Deep Blue", value: "#1e3a8a" },
    ],
    wheels: [
      { name: "19 Gemini", finish: "#d6dae0" },
      { name: "20 Induction", finish: "#1f2937" },
      { name: "21 Uberturbine", finish: "#09090b" },
    ],
  },
  gallery: [
    {
      title: "Minimal cockpit",
      description: "Panoramic glass, flat floor, and uncluttered controls.",
      gradient: "from-slate-100 via-white to-sky-100",
    },
    {
      title: "Family cargo bay",
      description: "Low load floor with room for winter gear and weekend luggage.",
      gradient: "from-zinc-100 via-white to-stone-100",
    },
    {
      title: "Supercharger ready",
      description: "Route planning favors fast, predictable charging stops in Norway.",
      gradient: "from-blue-100 via-white to-cyan-100",
    },
  ],
  videos: [
    {
      title: "Norwegian winter range drive",
      duration: "08:42",
      description: "Cabin preconditioning, highway efficiency, and cold-weather charging.",
    },
    {
      title: "Family usability review",
      duration: "06:15",
      description: "Seat comfort, storage, child seats, and road-trip ergonomics.",
    },
  ],
  reviews: [
    {
      source: "NordicDrive lab",
      rating: "9.1",
      summary: "The strongest all-rounder when charging network, software, and cost are weighted together.",
    },
    {
      source: "Owner consensus",
      rating: "8.8",
      summary: "Owners praise efficiency and software, while ride firmness remains the common caveat.",
    },
  ],
  variants: [
    {
      name: "Long Range AWD",
      priceNok: 499990,
      rangeKm: 533,
      accelerationSeconds: 5.0,
      drivetrain: "AWD",
    },
    {
      name: "Performance AWD",
      priceNok: 569990,
      rangeKm: 514,
      accelerationSeconds: 3.7,
      drivetrain: "AWD",
    },
  ],
  aiSummary:
    "Best for drivers who want maximum charging confidence, excellent winter efficiency, and a low-friction ownership experience. Choose the Long Range if comfort and value matter more than launch acceleration.",
};

const bmwExperience: CarDetailExperience = {
  viewer: {
    fallbackGeometry: "suv",
    defaultColor: "#dbeafe",
    colors: [
      { name: "Oxide Grey", value: "#9ca3af" },
      { name: "Phytonic Blue", value: "#1d4ed8" },
      { name: "Mineral White", value: "#f8fafc" },
      { name: "Black Sapphire", value: "#111827" },
    ],
    wheels: [
      { name: "21 Aero", finish: "#cbd5e1" },
      { name: "22 Sport", finish: "#334155" },
      { name: "23 Individual", finish: "#0f172a" },
    ],
  },
  gallery: [
    {
      title: "Lounge cabin",
      description: "Wide curved display, soft-touch surfaces, and relaxed seating geometry.",
      gradient: "from-blue-100 via-white to-slate-200",
    },
    {
      title: "Long-distance battery",
      description: "Large usable pack gives reassuring winter headroom between charging stops.",
      gradient: "from-slate-100 via-white to-indigo-100",
    },
    {
      title: "Tow-capable luxury",
      description: "A premium EV that still works for cabins, trailers, and mountain routes.",
      gradient: "from-zinc-100 via-white to-blue-100",
    },
  ],
  videos: [
    {
      title: "Oslo to Hemsedal comfort test",
      duration: "09:30",
      description: "Noise isolation, adaptive suspension, and cold-road range behavior.",
    },
    {
      title: "Towing and charging walkaround",
      duration: "07:05",
      description: "Practical charging stops, trailer stability, and storage details.",
    },
  ],
  reviews: [
    {
      source: "NordicDrive lab",
      rating: "9.0",
      summary: "A range-rich luxury SUV with outstanding comfort and enough capability for demanding family use.",
    },
    {
      source: "Owner consensus",
      rating: "8.6",
      summary: "Owners love refinement and range, with high purchase price as the main barrier.",
    },
  ],
  variants: [
    {
      name: "xDrive40",
      priceNok: 699900,
      rangeKm: 425,
      accelerationSeconds: 6.1,
      drivetrain: "AWD",
    },
    {
      name: "xDrive50",
      priceNok: 799900,
      rangeKm: 630,
      accelerationSeconds: 4.6,
      drivetrain: "AWD",
    },
    {
      name: "M60",
      priceNok: 1049900,
      rangeKm: 561,
      accelerationSeconds: 3.8,
      drivetrain: "AWD",
    },
  ],
  aiSummary:
    "Best for buyers prioritizing quietness, premium comfort, towing confidence, and true long-distance winter range. The xDrive50 is the sweet spot unless performance branding is essential.",
};

const defaultColors: VehicleColorOption[] = [
  { name: "Arctic Silver", value: "#e2e8f0" },
  { name: "Nordic Blue", value: "#2563eb" },
  { name: "Graphite", value: "#334155" },
];

const defaultWheels: WheelOption[] = [
  { name: "Aero", finish: "#cbd5e1" },
  { name: "Sport", finish: "#1f2937" },
];

export function getCarDetailExperience(car: NordicCar): CarDetailExperience {
  if (car.brandSlug === "tesla" && car.modelSlug === "model-y-long-range") {
    return teslaExperience;
  }

  if (car.brandSlug === "bmw" && car.modelSlug === "ix-xdrive50") {
    return bmwExperience;
  }

  return {
    viewer: {
      fallbackGeometry: car.segment.toLowerCase() as CarDetailExperience["viewer"]["fallbackGeometry"],
      defaultColor: "#e2e8f0",
      colors: defaultColors,
      wheels: defaultWheels,
    },
    gallery: car.highlights.map((highlight) => ({
      title: highlight,
      description: `${car.brand} ${car.model} detail curated for Nordic EV buyers.`,
      gradient: car.colorClass,
    })),
    videos: [
      {
        title: "NordicDrive first look",
        duration: "05:20",
        description: "Design, charging, cabin, and practical ownership notes.",
      },
    ],
    reviews: [
      {
        source: "NordicDrive lab",
        rating: "8.4",
        summary: `${car.model} is competitive for Norway when range, charging, and everyday comfort are balanced.`,
      },
    ],
    variants: [
      {
        name: car.model,
        priceNok: car.priceNok,
        rangeKm: car.rangeWltpKm,
        accelerationSeconds: car.accelerationSeconds,
        drivetrain: car.drivetrain,
      },
    ],
    aiSummary: `${car.brand} ${car.model} is a strong ${car.segment.toLowerCase()} candidate for drivers comparing range, charging speed, price, and winter usability in Norway.`,
  };
}
