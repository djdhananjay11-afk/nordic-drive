import { nordicCars, nordicLaunches } from "@/features/cars/data/nordic-cars";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

export type HomeComparison = {
  title: string;
  slug: string;
  cars: string[];
  signal: string;
};

export type HomeArticle = {
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
};

const localizedHomeContent: Record<
  Locale,
  {
    articles: HomeArticle[];
    trendingComparisons: HomeComparison[];
  }
> = {
  en: {
    trendingComparisons: [
      {
        title: "Model Y vs iX",
        slug: "model-y-vs-bmw-ix",
        cars: ["Tesla Model Y", "BMW iX"],
        signal: "Family SUV range and charging",
      },
      {
        title: "Ioniq 5 vs Polestar 2",
        slug: "ioniq-5-vs-polestar-2",
        cars: ["Hyundai Ioniq 5", "Polestar 2"],
        signal: "Value, design, and fast charging",
      },
      {
        title: "Macan Electric vs EX90",
        slug: "macan-electric-vs-volvo-ex90",
        cars: ["Porsche Macan Electric", "Volvo EX90"],
        signal: "Luxury performance vs 7-seat safety",
      },
    ],
    articles: [
      {
        title: "How winter changes EV range in Norway",
        slug: "winter-range-norway",
        category: "EV Guide",
        readTime: "6 min",
        excerpt: "WLTP is only the opening line. Learn what matters when temperature drops.",
      },
      {
        title: "The quiet race to 800V charging",
        slug: "800v-charging-norway",
        category: "Charging",
        readTime: "4 min",
        excerpt: "Why charging architecture can matter more than battery size on long trips.",
      },
      {
        title: "Premium family EVs to watch",
        slug: "premium-family-evs",
        category: "Launches",
        readTime: "5 min",
        excerpt: "The next wave of large electric SUVs and wagons heading toward Norway.",
      },
    ],
  },
  no: {
    trendingComparisons: [
      {
        title: "Model Y mot iX",
        slug: "model-y-vs-bmw-ix",
        cars: ["Tesla Model Y", "BMW iX"],
        signal: "Familie-SUV, rekkevidde og lading",
      },
      {
        title: "Ioniq 5 mot Polestar 2",
        slug: "ioniq-5-vs-polestar-2",
        cars: ["Hyundai Ioniq 5", "Polestar 2"],
        signal: "Verdi, design og hurtiglading",
      },
      {
        title: "Macan Electric mot EX90",
        slug: "macan-electric-vs-volvo-ex90",
        cars: ["Porsche Macan Electric", "Volvo EX90"],
        signal: "Luksusytelse mot syvseters sikkerhet",
      },
    ],
    articles: [
      {
        title: "Slik påvirker vinteren elbilrekkevidden i Norge",
        slug: "winter-range-norway",
        category: "Elbilguide",
        readTime: "6 min",
        excerpt: "WLTP er bare starten. Se hva som betyr mest når temperaturen faller.",
      },
      {
        title: "Det stille kappløpet mot 800V-lading",
        slug: "800v-charging-norway",
        category: "Lading",
        readTime: "4 min",
        excerpt: "Hvorfor ladearkitektur kan bety mer enn batteristørrelse på langturer.",
      },
      {
        title: "Premium familieelbiler å følge med på",
        slug: "premium-family-evs",
        category: "Lanseringer",
        readTime: "5 min",
        excerpt: "Den neste bølgen av store elektriske SUV-er og stasjonsvogner på vei til Norge.",
      },
    ],
  },
};

export function getHomeData(locale: Locale = defaultLocale) {
  const featuredSlugs = [
    "tesla:model-y-long-range",
    "bmw:ix-xdrive50",
    "volvo:ex30-single-motor-extended-range",
    "hyundai:ioniq-5-awd",
    "kia:ev9-gt-line-awd",
    "porsche:macan-electric-4",
  ];
  const featuredCars = featuredSlugs
    .map((key) => {
      const [brandSlug, modelSlug] = key.split(":");
      return nordicCars.find((car) => car.brandSlug === brandSlug && car.modelSlug === modelSlug);
    })
    .filter((car): car is (typeof nordicCars)[number] => Boolean(car));
  const brands = Array.from(new Set(nordicCars.map((car) => car.brand))).map((brand) => ({
    name: brand,
    slug: brand.toLowerCase().replace(/\s+/g, "-"),
    count: nordicCars.filter((car) => car.brand === brand).length,
  }));

  const localizedContent = localizedHomeContent[locale];

  return {
    featuredCars,
    launches: nordicLaunches,
    trendingComparisons: localizedContent.trendingComparisons,
    brands,
    articles: localizedContent.articles,
  };
}
