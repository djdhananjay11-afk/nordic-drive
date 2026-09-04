import { PrismaClient, type BodyType, type Drivetrain, type FeatureCategory } from "@prisma/client";

const prisma = new PrismaClient();

type SeedCar = {
  brand: {
    name: string;
    slug: string;
    country: string;
    websiteUrl: string;
  };
  car: {
    name: string;
    slug: string;
    tagline: string;
    bodyType: BodyType;
    segment: string;
    modelYear: number;
    priceFromNok: number;
    monthlyFromNok: number;
  };
  variant: {
    name: string;
    slug: string;
    drivetrain: Drivetrain;
    priceNok: number;
    monthlyEstimateNok: number;
    batteryCapacityKwh: number;
    rangeWltpKm: number;
    rangeWinterEstimateKm: number;
    powerHp: number;
    torqueNm?: number;
    acceleration0To100: number;
    topSpeedKmh: number;
    chargingAcKw: number;
    chargingDcKw: number;
    charging10To80Minutes: number;
    heatPump: boolean;
    seats: number;
    towingCapacityKg: number;
  };
  specification: {
    lengthMm: number;
    widthMm: number;
    heightMm: number;
    wheelbaseMm: number;
    bootSpaceLiters: number;
    frunkLiters?: number;
    weightKg: number;
    groundClearanceMm?: number;
  };
  charging: {
    batteryChemistry: string;
    batteryPreconditioning: boolean;
    vehicleToLoad: boolean;
    chargingCurveNote: string;
  };
  highlights: string[];
};

const rolePermissions = {
  user: [
    ["read", "car"],
    ["read", "article"],
    ["create", "wishlist"],
    ["create", "savedComparison"],
  ],
  editor: [
    ["read", "admin"],
    ["create", "article"],
    ["update", "article"],
    ["create", "review"],
    ["update", "review"],
  ],
  content_manager: [
    ["read", "admin"],
    ["create", "car"],
    ["update", "car"],
    ["delete", "car"],
    ["create", "launch"],
    ["update", "launch"],
    ["manage", "media"],
  ],
  super_admin: [["manage", "all"]],
} satisfies Record<string, Array<[string, string]>>;

const featureSeeds: Array<{ name: string; slug: string; category: FeatureCategory; iconName: string }> = [
  { name: "Heat pump", slug: "heat-pump", category: "WINTER", iconName: "Snowflake" },
  { name: "Fast DC charging", slug: "fast-dc-charging", category: "CHARGING", iconName: "Zap" },
  { name: "All-wheel drive", slug: "all-wheel-drive", category: "PERFORMANCE", iconName: "Gauge" },
  { name: "Advanced driver assistance", slug: "advanced-driver-assistance", category: "SAFETY", iconName: "Shield" },
  { name: "Premium cabin", slug: "premium-cabin", category: "INTERIOR", iconName: "Armchair" },
  { name: "Winter package", slug: "winter-package", category: "WINTER", iconName: "ThermometerSnowflake" },
  { name: "Tow-ready", slug: "tow-ready", category: "PERFORMANCE", iconName: "Truck" },
  { name: "Connected software", slug: "connected-software", category: "SOFTWARE", iconName: "Cpu" },
];

const cars: SeedCar[] = [
  {
    brand: { name: "Tesla", slug: "tesla", country: "US", websiteUrl: "https://www.tesla.com/no_no" },
    car: {
      name: "Model Y",
      slug: "model-y",
      tagline: "Norway's electric family benchmark with strong charging access.",
      bodyType: "SUV",
      segment: "Premium midsize SUV",
      modelYear: 2026,
      priceFromNok: 449990,
      monthlyFromNok: 4890,
    },
    variant: {
      name: "Long Range AWD",
      slug: "long-range-awd",
      drivetrain: "AWD",
      priceNok: 499990,
      monthlyEstimateNok: 5290,
      batteryCapacityKwh: 75,
      rangeWltpKm: 533,
      rangeWinterEstimateKm: 410,
      powerHp: 514,
      torqueNm: 493,
      acceleration0To100: 5.0,
      topSpeedKmh: 217,
      chargingAcKw: 11,
      chargingDcKw: 250,
      charging10To80Minutes: 27,
      heatPump: true,
      seats: 5,
      towingCapacityKg: 1600,
    },
    specification: {
      lengthMm: 4751,
      widthMm: 1921,
      heightMm: 1624,
      wheelbaseMm: 2890,
      bootSpaceLiters: 854,
      frunkLiters: 117,
      weightKg: 1997,
      groundClearanceMm: 167,
    },
    charging: {
      batteryChemistry: "Lithium-ion",
      batteryPreconditioning: true,
      vehicleToLoad: false,
      chargingCurveNote: "Strong charging ecosystem with broad Supercharger availability in Norway.",
    },
    highlights: ["Heat pump", "Fast DC charging", "All-wheel drive", "Connected software"],
  },
  {
    brand: { name: "Tesla", slug: "tesla", country: "US", websiteUrl: "https://www.tesla.com/no_no" },
    car: {
      name: "Model 3",
      slug: "model-3",
      tagline: "Efficient electric sedan with excellent long-distance value.",
      bodyType: "SEDAN",
      segment: "Premium sedan",
      modelYear: 2026,
      priceFromNok: 389990,
      monthlyFromNok: 4290,
    },
    variant: {
      name: "Long Range AWD",
      slug: "long-range-awd",
      drivetrain: "AWD",
      priceNok: 459990,
      monthlyEstimateNok: 4890,
      batteryCapacityKwh: 75,
      rangeWltpKm: 629,
      rangeWinterEstimateKm: 470,
      powerHp: 498,
      torqueNm: 493,
      acceleration0To100: 4.4,
      topSpeedKmh: 201,
      chargingAcKw: 11,
      chargingDcKw: 250,
      charging10To80Minutes: 27,
      heatPump: true,
      seats: 5,
      towingCapacityKg: 1000,
    },
    specification: {
      lengthMm: 4720,
      widthMm: 1850,
      heightMm: 1441,
      wheelbaseMm: 2875,
      bootSpaceLiters: 594,
      frunkLiters: 88,
      weightKg: 1828,
      groundClearanceMm: 138,
    },
    charging: {
      batteryChemistry: "Lithium-ion",
      batteryPreconditioning: true,
      vehicleToLoad: false,
      chargingCurveNote: "Efficient sedan platform with predictable trip planning.",
    },
    highlights: ["Heat pump", "Fast DC charging", "Advanced driver assistance", "Connected software"],
  },
  {
    brand: { name: "BMW", slug: "bmw", country: "DE", websiteUrl: "https://www.bmw.no" },
    car: {
      name: "iX",
      slug: "ix",
      tagline: "Long-range luxury SUV with high comfort and towing capacity.",
      bodyType: "SUV",
      segment: "Luxury SUV",
      modelYear: 2026,
      priceFromNok: 799900,
      monthlyFromNok: 8490,
    },
    variant: {
      name: "xDrive50",
      slug: "xdrive50",
      drivetrain: "AWD",
      priceNok: 879900,
      monthlyEstimateNok: 9290,
      batteryCapacityKwh: 105.2,
      rangeWltpKm: 630,
      rangeWinterEstimateKm: 470,
      powerHp: 523,
      torqueNm: 765,
      acceleration0To100: 4.6,
      topSpeedKmh: 200,
      chargingAcKw: 11,
      chargingDcKw: 195,
      charging10To80Minutes: 35,
      heatPump: true,
      seats: 5,
      towingCapacityKg: 2500,
    },
    specification: {
      lengthMm: 4953,
      widthMm: 1967,
      heightMm: 1695,
      wheelbaseMm: 3000,
      bootSpaceLiters: 500,
      weightKg: 2585,
      groundClearanceMm: 203,
    },
    charging: {
      batteryChemistry: "Lithium-ion",
      batteryPreconditioning: true,
      vehicleToLoad: false,
      chargingCurveNote: "Large battery prioritizes range and comfort over peak charging speed.",
    },
    highlights: ["Heat pump", "All-wheel drive", "Premium cabin", "Tow-ready"],
  },
  {
    brand: { name: "Audi", slug: "audi", country: "DE", websiteUrl: "https://www.audi.no" },
    car: {
      name: "Q8 e-tron",
      slug: "q8-e-tron",
      tagline: "Refined electric SUV with quiet cabin and strong winter comfort.",
      bodyType: "SUV",
      segment: "Premium large SUV",
      modelYear: 2026,
      priceFromNok: 759900,
      monthlyFromNok: 8190,
    },
    variant: {
      name: "55 quattro",
      slug: "55-quattro",
      drivetrain: "AWD",
      priceNok: 829900,
      monthlyEstimateNok: 8890,
      batteryCapacityKwh: 106,
      rangeWltpKm: 582,
      rangeWinterEstimateKm: 420,
      powerHp: 408,
      torqueNm: 664,
      acceleration0To100: 5.6,
      topSpeedKmh: 200,
      chargingAcKw: 11,
      chargingDcKw: 170,
      charging10To80Minutes: 31,
      heatPump: true,
      seats: 5,
      towingCapacityKg: 1800,
    },
    specification: {
      lengthMm: 4915,
      widthMm: 1937,
      heightMm: 1633,
      wheelbaseMm: 2928,
      bootSpaceLiters: 569,
      frunkLiters: 62,
      weightKg: 2585,
      groundClearanceMm: 172,
    },
    charging: {
      batteryChemistry: "Lithium-ion",
      batteryPreconditioning: true,
      vehicleToLoad: false,
      chargingCurveNote: "Stable charging profile and comfortable long-distance setup.",
    },
    highlights: ["Heat pump", "Premium cabin", "All-wheel drive", "Winter package"],
  },
  {
    brand: { name: "Volvo", slug: "volvo", country: "SE", websiteUrl: "https://www.volvocars.com/no" },
    car: {
      name: "EX30",
      slug: "ex30",
      tagline: "Compact Scandinavian EV with strong value and city-friendly size.",
      bodyType: "CROSSOVER",
      segment: "Compact crossover",
      modelYear: 2026,
      priceFromNok: 339900,
      monthlyFromNok: 3690,
    },
    variant: {
      name: "Twin Motor Performance",
      slug: "twin-motor-performance",
      drivetrain: "AWD",
      priceNok: 429900,
      monthlyEstimateNok: 4590,
      batteryCapacityKwh: 69,
      rangeWltpKm: 450,
      rangeWinterEstimateKm: 330,
      powerHp: 428,
      torqueNm: 543,
      acceleration0To100: 3.6,
      topSpeedKmh: 180,
      chargingAcKw: 11,
      chargingDcKw: 153,
      charging10To80Minutes: 26,
      heatPump: true,
      seats: 5,
      towingCapacityKg: 1600,
    },
    specification: {
      lengthMm: 4233,
      widthMm: 1837,
      heightMm: 1555,
      wheelbaseMm: 2650,
      bootSpaceLiters: 318,
      frunkLiters: 7,
      weightKg: 1943,
      groundClearanceMm: 165,
    },
    charging: {
      batteryChemistry: "NMC",
      batteryPreconditioning: true,
      vehicleToLoad: false,
      chargingCurveNote: "Compact battery and efficient packaging make it easy to live with.",
    },
    highlights: ["Heat pump", "Advanced driver assistance", "All-wheel drive", "Connected software"],
  },
  {
    brand: { name: "Kia", slug: "kia", country: "KR", websiteUrl: "https://www.kia.com/no" },
    car: {
      name: "EV9",
      slug: "ev9",
      tagline: "Large seven-seat electric SUV for families needing space.",
      bodyType: "SUV",
      segment: "Large family SUV",
      modelYear: 2026,
      priceFromNok: 699900,
      monthlyFromNok: 7390,
    },
    variant: {
      name: "GT-Line AWD",
      slug: "gt-line-awd",
      drivetrain: "AWD",
      priceNok: 799900,
      monthlyEstimateNok: 8490,
      batteryCapacityKwh: 99.8,
      rangeWltpKm: 505,
      rangeWinterEstimateKm: 380,
      powerHp: 384,
      torqueNm: 700,
      acceleration0To100: 5.3,
      topSpeedKmh: 200,
      chargingAcKw: 11,
      chargingDcKw: 210,
      charging10To80Minutes: 24,
      heatPump: true,
      seats: 7,
      towingCapacityKg: 2500,
    },
    specification: {
      lengthMm: 5015,
      widthMm: 1980,
      heightMm: 1780,
      wheelbaseMm: 3100,
      bootSpaceLiters: 333,
      frunkLiters: 52,
      weightKg: 2664,
      groundClearanceMm: 177,
    },
    charging: {
      batteryChemistry: "Lithium-ion",
      batteryPreconditioning: true,
      vehicleToLoad: true,
      chargingCurveNote: "800V platform supports fast family-trip stops.",
    },
    highlights: ["Fast DC charging", "Tow-ready", "Winter package", "Premium cabin"],
  },
  {
    brand: { name: "Hyundai", slug: "hyundai", country: "KR", websiteUrl: "https://www.hyundai.no" },
    car: {
      name: "Ioniq 5",
      slug: "ioniq-5",
      tagline: "Fast-charging crossover with standout practicality.",
      bodyType: "CROSSOVER",
      segment: "Midsize crossover",
      modelYear: 2026,
      priceFromNok: 449900,
      monthlyFromNok: 4790,
    },
    variant: {
      name: "Long Range AWD",
      slug: "long-range-awd",
      drivetrain: "AWD",
      priceNok: 529900,
      monthlyEstimateNok: 5590,
      batteryCapacityKwh: 77.4,
      rangeWltpKm: 481,
      rangeWinterEstimateKm: 365,
      powerHp: 325,
      torqueNm: 605,
      acceleration0To100: 5.3,
      topSpeedKmh: 185,
      chargingAcKw: 11,
      chargingDcKw: 233,
      charging10To80Minutes: 18,
      heatPump: true,
      seats: 5,
      towingCapacityKg: 1600,
    },
    specification: {
      lengthMm: 4635,
      widthMm: 1890,
      heightMm: 1605,
      wheelbaseMm: 3000,
      bootSpaceLiters: 527,
      frunkLiters: 24,
      weightKg: 2115,
      groundClearanceMm: 160,
    },
    charging: {
      batteryChemistry: "Lithium-ion",
      batteryPreconditioning: true,
      vehicleToLoad: true,
      chargingCurveNote: "One of the fastest charging mainstream EVs in its class.",
    },
    highlights: ["Fast DC charging", "Heat pump", "Winter package", "Connected software"],
  },
  {
    brand: { name: "Polestar", slug: "polestar", country: "SE", websiteUrl: "https://www.polestar.com/no" },
    car: {
      name: "Polestar 2",
      slug: "polestar-2",
      tagline: "Minimalist performance fastback with Nordic design roots.",
      bodyType: "SEDAN",
      segment: "Premium fastback",
      modelYear: 2026,
      priceFromNok: 449000,
      monthlyFromNok: 4790,
    },
    variant: {
      name: "Long Range Dual Motor",
      slug: "long-range-dual-motor",
      drivetrain: "AWD",
      priceNok: 529000,
      monthlyEstimateNok: 5590,
      batteryCapacityKwh: 82,
      rangeWltpKm: 596,
      rangeWinterEstimateKm: 430,
      powerHp: 421,
      torqueNm: 740,
      acceleration0To100: 4.5,
      topSpeedKmh: 205,
      chargingAcKw: 11,
      chargingDcKw: 205,
      charging10To80Minutes: 28,
      heatPump: true,
      seats: 5,
      towingCapacityKg: 1500,
    },
    specification: {
      lengthMm: 4606,
      widthMm: 1859,
      heightMm: 1479,
      wheelbaseMm: 2735,
      bootSpaceLiters: 405,
      frunkLiters: 41,
      weightKg: 2113,
      groundClearanceMm: 151,
    },
    charging: {
      batteryChemistry: "Lithium-ion",
      batteryPreconditioning: true,
      vehicleToLoad: false,
      chargingCurveNote: "Balanced range, performance, and Scandinavian interface design.",
    },
    highlights: ["Heat pump", "All-wheel drive", "Premium cabin", "Connected software"],
  },
  {
    brand: { name: "Porsche", slug: "porsche", country: "DE", websiteUrl: "https://www.porsche.com/norway" },
    car: {
      name: "Taycan",
      slug: "taycan",
      tagline: "Electric sports sedan with 800V charging and Porsche dynamics.",
      bodyType: "SEDAN",
      segment: "Performance sedan",
      modelYear: 2026,
      priceFromNok: 1039000,
      monthlyFromNok: 10990,
    },
    variant: {
      name: "4S Performance Battery Plus",
      slug: "4s-performance-battery-plus",
      drivetrain: "AWD",
      priceNok: 1249000,
      monthlyEstimateNok: 13290,
      batteryCapacityKwh: 97,
      rangeWltpKm: 557,
      rangeWinterEstimateKm: 395,
      powerHp: 598,
      torqueNm: 710,
      acceleration0To100: 3.7,
      topSpeedKmh: 250,
      chargingAcKw: 11,
      chargingDcKw: 320,
      charging10To80Minutes: 18,
      heatPump: true,
      seats: 4,
      towingCapacityKg: 0,
    },
    specification: {
      lengthMm: 4963,
      widthMm: 1966,
      heightMm: 1379,
      wheelbaseMm: 2900,
      bootSpaceLiters: 407,
      frunkLiters: 84,
      weightKg: 2295,
      groundClearanceMm: 127,
    },
    charging: {
      batteryChemistry: "Lithium-ion",
      batteryPreconditioning: true,
      vehicleToLoad: false,
      chargingCurveNote: "800V architecture enables extremely short charging stops.",
    },
    highlights: ["Fast DC charging", "All-wheel drive", "Premium cabin", "Advanced driver assistance"],
  },
  {
    brand: { name: "BYD", slug: "byd", country: "CN", websiteUrl: "https://www.bydauto.no" },
    car: {
      name: "Seal",
      slug: "seal",
      tagline: "Efficient electric sedan with strong value and LFP battery tech.",
      bodyType: "SEDAN",
      segment: "Midsize sedan",
      modelYear: 2026,
      priceFromNok: 399900,
      monthlyFromNok: 4290,
    },
    variant: {
      name: "Excellence AWD",
      slug: "excellence-awd",
      drivetrain: "AWD",
      priceNok: 469900,
      monthlyEstimateNok: 4990,
      batteryCapacityKwh: 82.5,
      rangeWltpKm: 520,
      rangeWinterEstimateKm: 385,
      powerHp: 530,
      torqueNm: 670,
      acceleration0To100: 3.8,
      topSpeedKmh: 180,
      chargingAcKw: 11,
      chargingDcKw: 150,
      charging10To80Minutes: 26,
      heatPump: true,
      seats: 5,
      towingCapacityKg: 1500,
    },
    specification: {
      lengthMm: 4800,
      widthMm: 1875,
      heightMm: 1460,
      wheelbaseMm: 2920,
      bootSpaceLiters: 400,
      frunkLiters: 53,
      weightKg: 2185,
      groundClearanceMm: 145,
    },
    charging: {
      batteryChemistry: "LFP Blade Battery",
      batteryPreconditioning: true,
      vehicleToLoad: true,
      chargingCurveNote: "Value-focused sedan with robust LFP battery chemistry.",
    },
    highlights: ["Heat pump", "All-wheel drive", "Connected software", "Fast DC charging"],
  },
];

async function seedRoles() {
  for (const [slug, permissions] of Object.entries(rolePermissions)) {
    const role = await prisma.role.upsert({
      where: { slug },
      update: {
        name: toTitle(slug),
        description: `${toTitle(slug)} role`,
        isSystem: true,
      },
      create: {
        slug,
        name: toTitle(slug),
        description: `${toTitle(slug)} role`,
        isSystem: true,
      },
    });

    for (const [action, subject] of permissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_action_subject: { roleId: role.id, action, subject } },
        update: {},
        create: { roleId: role.id, action, subject },
      });
    }
  }
}

async function seedFeatures() {
  for (const feature of featureSeeds) {
    await prisma.feature.upsert({
      where: { slug: feature.slug },
      update: feature,
      create: feature,
    });
  }
}

async function seedUsers() {
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { slug: "super_admin" } });
  const editorRole = await prisma.role.findUniqueOrThrow({ where: { slug: "editor" } });

  await prisma.user.upsert({
    where: { email: "admin@nordicdrive.no" },
    update: { roleId: adminRole.id, name: "NordicDrive Admin" },
    create: {
      email: "admin@nordicdrive.no",
      name: "NordicDrive Admin",
      roleId: adminRole.id,
      locale: "nb-NO",
    },
  });

  await prisma.user.upsert({
    where: { email: "editor@nordicdrive.no" },
    update: { roleId: editorRole.id, name: "NordicDrive Editor" },
    create: {
      email: "editor@nordicdrive.no",
      name: "NordicDrive Editor",
      roleId: editorRole.id,
      locale: "nb-NO",
    },
  });
}

async function seedCars() {
  const featureByName = new Map(
    (await prisma.feature.findMany()).map((feature) => [feature.name, feature.id]),
  );

  for (const item of cars) {
    const brand = await prisma.brand.upsert({
      where: { slug: item.brand.slug },
      update: {
        name: item.brand.name,
        country: item.brand.country,
        websiteUrl: item.brand.websiteUrl,
        isActive: true,
      },
      create: {
        ...item.brand,
        description: `${item.brand.name} electric vehicles available in Norway.`,
        seoTitle: `${item.brand.name} electric cars Norway`,
        seoDescription: `Compare ${item.brand.name} electric cars, Norwegian prices, range, charging, and variants.`,
      },
    });

    const car = await prisma.car.upsert({
      where: { brandId_slug: { brandId: brand.id, slug: item.car.slug } },
      update: {
        ...item.car,
        description: item.car.tagline,
        seoTitle: `${item.brand.name} ${item.car.name} price and range in Norway`,
        seoDescription: `Compare ${item.brand.name} ${item.car.name} Norwegian pricing, winter range, EV charging, and specifications.`,
      },
      create: {
        ...item.car,
        brandId: brand.id,
        description: item.car.tagline,
        seoTitle: `${item.brand.name} ${item.car.name} price and range in Norway`,
        seoDescription: `Compare ${item.brand.name} ${item.car.name} Norwegian pricing, winter range, EV charging, and specifications.`,
      },
    });

    await prisma.carFeature.deleteMany({ where: { carId: car.id } });
    await prisma.carFeature.createMany({
      data: item.highlights
        .map((name, index) => {
          const featureId = featureByName.get(name);
          return featureId
            ? {
                carId: car.id,
                featureId,
                isHighlighted: true,
                sortOrder: index,
              }
            : null;
        })
        .filter((value): value is NonNullable<typeof value> => Boolean(value)),
    });

    const variant = await prisma.variant.upsert({
      where: { carId_slug: { carId: car.id, slug: item.variant.slug } },
      update: item.variant,
      create: {
        ...item.variant,
        carId: car.id,
      },
    });

    await prisma.specification.upsert({
      where: { variantId: variant.id },
      update: {
        ...item.specification,
        carId: car.id,
        seats: item.variant.seats,
        towingCapacityKg: item.variant.towingCapacityKg,
        warrantyYears: 5,
        batteryWarrantyYears: 8,
        batteryWarrantyKm: 160000,
      },
      create: {
        ...item.specification,
        carId: car.id,
        variantId: variant.id,
        seats: item.variant.seats,
        towingCapacityKg: item.variant.towingCapacityKg,
        warrantyYears: 5,
        batteryWarrantyYears: 8,
        batteryWarrantyKm: 160000,
      },
    });

    await prisma.eVCharging.upsert({
      where: { variantId: variant.id },
      update: {
        chargingAcKw: item.variant.chargingAcKw,
        chargingDcKw: item.variant.chargingDcKw,
        charging10To80Minutes: item.variant.charging10To80Minutes,
        batteryChemistry: item.charging.batteryChemistry,
        batteryPreconditioning: item.charging.batteryPreconditioning,
        vehicleToLoad: item.charging.vehicleToLoad,
        chargingCurveNote: item.charging.chargingCurveNote,
      },
      create: {
        variantId: variant.id,
        chargingAcKw: item.variant.chargingAcKw,
        chargingDcKw: item.variant.chargingDcKw,
        charging10To80Minutes: item.variant.charging10To80Minutes,
        batteryChemistry: item.charging.batteryChemistry,
        batteryPreconditioning: item.charging.batteryPreconditioning,
        vehicleToLoad: item.charging.vehicleToLoad,
        chargingCurveNote: item.charging.chargingCurveNote,
      },
    });

    await prisma.media.upsert({
      where: { id: stableUuid(`media-${item.brand.slug}-${item.car.slug}`) },
      update: {
        brandId: brand.id,
        carId: car.id,
        variantId: variant.id,
        type: "IMAGE",
        url: `/images/cars/${item.brand.slug}-${item.car.slug}.jpg`,
        altText: `${item.brand.name} ${item.car.name} exterior`,
        isPrimary: true,
      },
      create: {
        id: stableUuid(`media-${item.brand.slug}-${item.car.slug}`),
        brandId: brand.id,
        carId: car.id,
        variantId: variant.id,
        type: "IMAGE",
        url: `/images/cars/${item.brand.slug}-${item.car.slug}.jpg`,
        altText: `${item.brand.name} ${item.car.name} exterior`,
        isPrimary: true,
      },
    });
  }
}

async function seedContentAndRelations() {
  const editor = await prisma.user.findUniqueOrThrow({ where: { email: "editor@nordicdrive.no" } });
  const tesla = await prisma.brand.findUniqueOrThrow({ where: { slug: "tesla" } });
  const modelY = await prisma.car.findUniqueOrThrow({
    where: { brandId_slug: { brandId: tesla.id, slug: "model-y" } },
    include: { variants: true },
  });
  const modelYVariant = modelY.variants[0];

  if (!modelYVariant) {
    throw new Error("Tesla Model Y seed variant was not created.");
  }

  await prisma.review.upsert({
    where: { carId_slug: { carId: modelY.id, slug: "tesla-model-y-norway-review" } },
    update: {
      title: "Tesla Model Y Norway review",
      content: "A strong all-round EV for Norwegian families, especially when charging access matters.",
      status: "PUBLISHED",
      publishedAt: new Date("2026-01-15T10:00:00.000Z"),
    },
    create: {
      carId: modelY.id,
      variantId: modelYVariant.id,
      authorId: editor.id,
      title: "Tesla Model Y Norway review",
      slug: "tesla-model-y-norway-review",
      summary: "A strong all-round EV for Norwegian families.",
      content: "A strong all-round EV for Norwegian families, especially when charging access matters.",
      rating: 4.6,
      pros: ["Charging network", "Efficiency", "Space"],
      cons: ["Firm ride", "Minimal physical controls"],
      status: "PUBLISHED",
      seoTitle: "Tesla Model Y review Norway",
      seoDescription: "Norwegian review of Tesla Model Y with price, winter range, charging, and family practicality.",
      publishedAt: new Date("2026-01-15T10:00:00.000Z"),
    },
  });

  await prisma.article.upsert({
    where: { slug: "winter-range-guide-norway" },
    update: {
      title: "Winter range guide for Norwegian EV buyers",
      status: "PUBLISHED",
      publishedAt: new Date("2026-02-01T10:00:00.000Z"),
    },
    create: {
      authorId: editor.id,
      title: "Winter range guide for Norwegian EV buyers",
      slug: "winter-range-guide-norway",
      excerpt: "How to interpret WLTP, winter estimates, charging stops, and heat pump value.",
      content: "Norwegian EV buyers should compare WLTP range with realistic winter estimates and charging behavior.",
      category: "EV Guide",
      status: "PUBLISHED",
      seoTitle: "Winter EV range guide Norway",
      seoDescription: "Learn how to compare winter range, charging, and battery efficiency for EVs in Norway.",
      publishedAt: new Date("2026-02-01T10:00:00.000Z"),
    },
  });

  await seedLaunch("audi", "A6 e-tron Avant", "a6-e-tron-avant", "2026-10-01", 649000, "CONFIRMED", 82);
  await seedLaunch("polestar", "Polestar 5", "polestar-5", "2027-03-01", 899000, "CONFIRMED", 78);
  await seedLaunch("volkswagen", "ID.2", "id-2", "2027-06-01", 299000, "RUMORED", 58);

  await seedDealer("Tesla Oslo North", "tesla-oslo-north", "tesla", "Oslo");
  await seedDealer("Premium EV Bergen", "premium-ev-bergen", "bmw", "Bergen");

  const comparisonVariants = await prisma.variant.findMany({
    where: {
      car: {
        OR: [
          { slug: "model-y", brand: { slug: "tesla" } },
          { slug: "ix", brand: { slug: "bmw" } },
          { slug: "ev9", brand: { slug: "kia" } },
        ],
      },
    },
    take: 3,
  });

  const comparison = await prisma.comparison.upsert({
    where: { slug: "premium-family-evs-norway" },
    update: {
      title: "Premium family EVs in Norway",
      description: "Tesla Model Y vs BMW iX vs Kia EV9",
      isTemplate: true,
    },
    create: {
      title: "Premium family EVs in Norway",
      slug: "premium-family-evs-norway",
      description: "Tesla Model Y vs BMW iX vs Kia EV9",
      isTemplate: true,
      seoTitle: "Premium family EV comparison Norway",
      seoDescription: "Compare premium family EVs by price, winter range, charging, and towing capacity.",
    },
  });

  await prisma.comparisonVariant.deleteMany({ where: { comparisonId: comparison.id } });
  await prisma.comparisonVariant.createMany({
    data: comparisonVariants.map((variant, index) => ({
      comparisonId: comparison.id,
      variantId: variant.id,
      position: index,
    })),
  });

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@nordicdrive.no" } });
  await prisma.savedComparison.upsert({
    where: { userId_comparisonId: { userId: admin.id, comparisonId: comparison.id } },
    update: { name: "Family SUV shortlist" },
    create: {
      userId: admin.id,
      comparisonId: comparison.id,
      name: "Family SUV shortlist",
    },
  });

  await prisma.wishlist.upsert({
    where: { userId_carId_variantId: { userId: admin.id, carId: modelY.id, variantId: modelYVariant.id } },
    update: { notes: "Benchmark family EV." },
    create: {
      userId: admin.id,
      carId: modelY.id,
      variantId: modelYVariant.id,
      notes: "Benchmark family EV.",
    },
  });
}

async function seedLaunch(
  brandSlug: string,
  modelName: string,
  slug: string,
  expectedLaunchDate: string,
  estimatedPriceFromNok: number,
  status: "RUMORED" | "CONFIRMED",
  confidenceLevel: number,
) {
  const brand = await prisma.brand.upsert({
    where: { slug: brandSlug },
    update: {},
    create: {
      name: toTitle(brandSlug),
      slug: brandSlug,
      country: "DE",
      description: `${toTitle(brandSlug)} electric vehicles.`,
    },
  });

  await prisma.launch.upsert({
    where: { brandId_slug: { brandId: brand.id, slug } },
    update: {
      modelName,
      expectedLaunchDate: new Date(expectedLaunchDate),
      estimatedPriceFromNok,
      status,
      confidenceLevel,
    },
    create: {
      brandId: brand.id,
      modelName,
      slug,
      expectedLaunchDate: new Date(expectedLaunchDate),
      estimatedPriceFromNok,
      status,
      confidenceLevel,
      sourceNote: "NordicDrive editorial estimate for Norway.",
      seoTitle: `${modelName} Norway launch`,
      seoDescription: `Expected Norwegian launch timing and estimated price for ${modelName}.`,
    },
  });
}

async function seedDealer(name: string, slug: string, brandSlug: string, city: string) {
  const brand = await prisma.brand.findUniqueOrThrow({ where: { slug: brandSlug } });
  const dealer = await prisma.dealer.upsert({
    where: { slug },
    update: { name, city },
    create: {
      name,
      slug,
      type: "OFFICIAL",
      city,
      country: "NO",
      websiteUrl: brand.websiteUrl,
    },
  });

  await prisma.dealerBrand.upsert({
    where: { dealerId_brandId: { dealerId: dealer.id, brandId: brand.id } },
    update: {},
    create: { dealerId: dealer.id, brandId: brand.id },
  });
}

function toTitle(value: string) {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stableUuid(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return `00000000-0000-4000-8000-${hash.toString(16).padStart(12, "0").slice(0, 12)}`;
}

async function main() {
  await seedRoles();
  await seedFeatures();
  await seedUsers();
  await seedCars();
  await seedContentAndRelations();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
