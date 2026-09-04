import type { Locale } from "@/lib/i18n/config";

export const dictionaries = {
  en: {
    metadata: {
      homeDescription:
        "Compare EV range, Norwegian pricing, winter performance, launches, brands, and AI recommendations in one premium electric car platform.",
      homeTitle: "NordicDrive | Compare Electric Cars in Norway",
      siteDescription:
        "Compare electric cars, Norwegian pricing, winter range, charging, launches, and AI recommendations.",
    },
    nav: {
      about: "About",
      advertise: "Advertise",
      ai: "AI advisor",
      cars: "Cars",
      compare: "Compare",
      disclaimer: "Disclaimer",
      evGuide: "EV Guide",
      launches: "Launches",
      menu: "Menu",
      search: "Search",
      signIn: "Sign in",
    },
    home: {
      ai: {
        button: "Start recommendation",
        description:
          "Budget, winter trips, charging access, family size, performance, and range anxiety become a grounded shortlist with clear tradeoffs.",
        eyebrow: "AI recommendation",
        title: "Tell us how you drive. We'll find the right EV.",
      },
      articles: {
        description:
          "Launch analysis, winter range explainers, charging guides, and premium EV market signals.",
        eyebrow: "News and insights",
        title: "Editorial guidance for electric ownership.",
      },
      brands: {
        description:
          "Brand pages become launch hubs, media galleries, variant catalogs, and comparison entry points.",
        eyebrow: "Brand showcase",
        models: "models",
        title: "Every premium EV brand, one calm interface.",
      },
      comparisons: {
        description:
          "A faster way to understand tradeoffs between range, charging, price, space, and luxury.",
        eyebrow: "Trending comparisons",
        open: "Open comparison",
        title: "Decision paths buyers are exploring.",
      },
      cta: {
        compare: "Compare now",
        explore: "Explore EVs",
      },
      featured: {
        description:
          "Fast comparisons with Norway-focused pricing, charging, range, and winter confidence.",
        eyebrow: "Featured EVs",
        title: "A curated garage for Nordic roads.",
      },
      hero: {
        description:
          "Compare range, charging, launches, ownership signals, and AI recommendations in one cinematic EV platform.",
        eyebrow: "NordicDrive Intelligence Platform",
        title: "The electric car experience, redesigned for Norway.",
      },
      launches: {
        description:
          "Launch signals, expected Norwegian pricing, and editorial confidence for upcoming EVs.",
        estimatedFrom: "Estimated from",
        eyebrow: "Latest launches",
        title: "The next wave is already visible.",
      },
      metrics: {
        charging: "10-80%",
        from: "From",
        wltp: "WLTP",
      },
      search: {
        advanced: "Advanced search",
        placeholder: "Search Tesla, Porsche, BMW, range, SUV...",
      },
      trust: {
        advertise: "Future advertising",
        disclaimer: "Independent informational platform. Prices and specifications may change.",
        learnMore: "Learn more",
      },
    },
    listing: {
      bodyType: "Body type",
      brand: "Brand",
      cars: {
        description:
          "Search and filter premium EVs with Norway-focused range, charging, price, and winter ownership data.",
        eyebrow: "Cars",
        metaDescription:
          "Search, filter, sort, and compare electric cars in Norway by brand, range, price, body type, and charging performance.",
        title: "Electric cars, beautifully organized.",
      },
      clear: "Reset filters",
      closeFilters: "Close filters",
      details: "Details",
      electricCars: {
        description:
          "Explore all-electric models with range-first sorting, instant search, and Norway-specific EV filters.",
        eyebrow: "Electric cars",
        metaDescription:
          "Browse all electric cars available for Norway with instant search, premium filters, range sorting, and price filtering.",
        metaTitle: "All Electric Cars in Norway",
        title: "All electric cars",
      },
      filters: "Filters",
      filtersHint: "Refine the EV shortlist",
      found: "EVs found",
      from: "From",
      maxPrice: "Max price",
      minRange: "Minimum range",
      noResultsDescription: "Try lowering the range, price, or search query.",
      noResultsTitle: "No cars match this search.",
      options: {
        allBodyTypes: "All body types",
        allBrands: "All brands",
        chargingAsc: "Fastest charging",
        priceAsc: "Lowest price",
        priceDesc: "Highest price",
        rangeDesc: "Longest range",
        recommended: "Recommended",
      },
      page: "Page",
      previous: "Previous",
      next: "Next",
      searchPlaceholder: "Instant search by model, brand, body type, range...",
      sourceLocal: "local index",
      updating: "Updating...",
      upTo: "Up to",
      winter: "Winter",
      of: "of",
    },
    informational: {
      about: {
        description:
          "NordicDrive is an independent EV comparison platform helping Norwegian drivers understand electric cars, winter range, charging, prices, and future launches.",
        eyebrow: "Independent EV intelligence",
        title: "Built to make Norway's EV market easier to understand.",
        sections: [
          {
            title: "What NordicDrive does",
            body: "NordicDrive organizes electric-car information around the questions Norwegian buyers actually ask: price, range, winter usability, charging speed, family practicality, performance, and upcoming launches.",
          },
          {
            title: "Independent by design",
            body: "The platform is not owned by a manufacturer, importer, dealer group, or charging company. Brand names are used only to identify and compare vehicles.",
          },
          {
            title: "Informational first",
            body: "The first launch is focused on education and comparison. Commercial placements may be added later, but the product should remain useful before it becomes monetized.",
          },
        ],
      },
      advertise: {
        description:
          "NordicDrive will later support premium, clearly labeled advertising opportunities for EV brands, dealers, charging companies, insurers, and mobility partners.",
        eyebrow: "Future partnerships",
        title: "Premium automotive advertising, designed to feel useful.",
        sections: [
          {
            title: "Launch-stage approach",
            body: "NordicDrive is starting as a clean informational platform. We will keep early pages light, fast, and trustworthy before introducing advertising.",
          },
          {
            title: "Future ad formats",
            body: "Potential formats include sponsored launch pages, featured dealer visibility, charging-network campaigns, insurance partnerships, newsletter sponsorships, and comparison-page placements.",
          },
          {
            title: "Trust rules",
            body: "Paid placements should be clearly labeled, visually restrained, and separated from editorial recommendations so users can understand what is sponsored.",
          },
        ],
      },
      disclaimer: {
        description:
          "NordicDrive is an independent informational platform. Vehicle prices, specifications, ranges, availability, and launch timing may change.",
        eyebrow: "Accuracy and independence",
        title: "Important information before using NordicDrive.",
        sections: [
          {
            title: "Independent platform",
            body: "NordicDrive is not affiliated with Tesla, BMW, Audi, Volvo, Polestar, Porsche, Hyundai, Kia, BYD, NIO, or any other manufacturer unless explicitly stated.",
          },
          {
            title: "Data can change",
            body: "Prices, trims, specifications, WLTP range, charging data, launch dates, and incentives can change without notice. Always confirm final details with the manufacturer, importer, dealer, or official source.",
          },
          {
            title: "No financial advice",
            body: "NordicDrive provides general information and comparison tools. It does not provide financial, legal, insurance, tax, or purchasing advice.",
          },
          {
            title: "Images and media",
            body: "Vehicle images should come from licensed, manufacturer-approved, dealer-approved, or owned media sources. Placeholder visuals may be used until approved media is available.",
          },
        ],
      },
    },
  },
  no: {
    metadata: {
      homeDescription:
        "Sammenlign rekkevidde, norske priser, vinteregenskaper, lanseringer, merker og AI-anbefalinger i én premium elbilplattform.",
      homeTitle: "NordicDrive | Sammenlign elbiler i Norge",
      siteDescription:
        "Sammenlign elbiler, norske priser, vinterrekkevidde, lading, lanseringer og AI-anbefalinger.",
    },
    nav: {
      about: "Om oss",
      advertise: "Annonser",
      ai: "AI-rådgiver",
      cars: "Biler",
      compare: "Sammenlign",
      disclaimer: "Ansvarsfraskrivelse",
      evGuide: "Elbilguide",
      launches: "Lanseringer",
      menu: "Meny",
      search: "Søk",
      signIn: "Logg inn",
    },
    home: {
      ai: {
        button: "Start anbefaling",
        description:
          "Budsjett, vinterturer, lademuligheter, familiestørrelse, ytelse og rekkeviddebehov blir til en tydelig shortlist med ærlige kompromisser.",
        eyebrow: "AI-anbefaling",
        title: "Fortell oss hvordan du kjører. Vi finner riktig elbil.",
      },
      articles: {
        description:
          "Lanseringsanalyse, forklaringer om vinterrekkevidde, ladeguider og signaler fra premium elbilmarkedet.",
        eyebrow: "Nyheter og innsikt",
        title: "Redaksjonell veiledning for elektrisk eierskap.",
      },
      brands: {
        description:
          "Merksider blir lanseringshubber, mediegallerier, variantkataloger og innganger til sammenligning.",
        eyebrow: "Merkeoversikt",
        models: "modeller",
        title: "Alle premium elbilmerker i ett rolig grensesnitt.",
      },
      comparisons: {
        description:
          "En raskere måte å forstå kompromisser mellom rekkevidde, lading, pris, plass og luksus.",
        eyebrow: "Populære sammenligninger",
        open: "Åpne sammenligning",
        title: "Valgene norske kjøpere utforsker.",
      },
      cta: {
        compare: "Sammenlign nå",
        explore: "Utforsk elbiler",
      },
      featured: {
        description:
          "Raske sammenligninger med norske priser, lading, rekkevidde og vintertrygghet.",
        eyebrow: "Utvalgte elbiler",
        title: "En kuratert garasje for nordiske veier.",
      },
      hero: {
        description:
          "Sammenlign rekkevidde, lading, lanseringer, eierskapssignaler og AI-anbefalinger i én filmatisk elbilplattform.",
        eyebrow: "NordicDrive Intelligence Platform",
        title: "Elbilopplevelsen, redesignet for Norge.",
      },
      launches: {
        description:
          "Lanseringssignaler, forventede norske priser og redaksjonell trygghet for kommende elbiler.",
        estimatedFrom: "Estimert fra",
        eyebrow: "Siste lanseringer",
        title: "Den neste bølgen er allerede synlig.",
      },
      metrics: {
        charging: "10-80%",
        from: "Fra",
        wltp: "WLTP",
      },
      search: {
        advanced: "Avansert søk",
        placeholder: "Søk Tesla, Porsche, BMW, rekkevidde, SUV...",
      },
      trust: {
        advertise: "Fremtidig annonsering",
        disclaimer: "Uavhengig informasjonsplattform. Priser og spesifikasjoner kan endres.",
        learnMore: "Les mer",
      },
    },
    listing: {
      bodyType: "Karosseri",
      brand: "Merke",
      cars: {
        description:
          "Søk og filtrer premium elbiler med norsk rekkevidde, lading, pris og vinterdata.",
        eyebrow: "Biler",
        metaDescription:
          "Søk, filtrer, sorter og sammenlign elbiler i Norge etter merke, rekkevidde, pris, karosseri og ladehastighet.",
        title: "Elbiler, vakkert organisert.",
      },
      clear: "Nullstill filtre",
      closeFilters: "Lukk filtre",
      details: "Detaljer",
      electricCars: {
        description:
          "Utforsk helelektriske modeller med rekkevidde først, lynraskt søk og norske elbilfiltre.",
        eyebrow: "Elbiler",
        metaDescription:
          "Se alle elbiler tilgjengelige for Norge med øyeblikkelig søk, premium filtre, rekkeviddesortering og prisfiltrering.",
        metaTitle: "Alle elbiler i Norge",
        title: "Alle elbiler",
      },
      filters: "Filtre",
      filtersHint: "Spiss inn elbilutvalget",
      found: "elbiler funnet",
      from: "Fra",
      maxPrice: "Maks pris",
      minRange: "Minimum rekkevidde",
      noResultsDescription: "Prøv lavere rekkeviddekrav, pris eller et enklere søk.",
      noResultsTitle: "Ingen biler matcher søket.",
      options: {
        allBodyTypes: "Alle karosserier",
        allBrands: "Alle merker",
        chargingAsc: "Raskest lading",
        priceAsc: "Lavest pris",
        priceDesc: "Høyest pris",
        rangeDesc: "Lengst rekkevidde",
        recommended: "Anbefalt",
      },
      page: "Side",
      previous: "Forrige",
      next: "Neste",
      searchPlaceholder: "Søk etter modell, merke, karosseri, rekkevidde...",
      sourceLocal: "lokal indeks",
      updating: "Oppdaterer...",
      upTo: "Opptil",
      winter: "Vinter",
      of: "av",
    },
    informational: {
      about: {
        description:
          "NordicDrive er en uavhengig elbilplattform som hjelper norske sjåfører å forstå elbiler, vinterrekkevidde, lading, priser og kommende lanseringer.",
        eyebrow: "Uavhengig elbilinnsikt",
        title: "Bygget for å gjøre Norges elbilmarked lettere å forstå.",
        sections: [
          {
            title: "Hva NordicDrive gjør",
            body: "NordicDrive organiserer elbilinformasjon rundt spørsmålene norske kjøpere faktisk stiller: pris, rekkevidde, vinteregenskaper, ladehastighet, familiepraktikalitet, ytelse og kommende lanseringer.",
          },
          {
            title: "Uavhengig fra starten",
            body: "Plattformen eies ikke av en produsent, importør, forhandlergruppe eller ladeaktør. Merkenavn brukes kun for å identifisere og sammenligne biler.",
          },
          {
            title: "Informasjon først",
            body: "Den første lanseringen handler om læring og sammenligning. Kommersielle plasseringer kan komme senere, men produktet skal være nyttig før det blir inntektsdrevet.",
          },
        ],
      },
      advertise: {
        description:
          "NordicDrive kan senere tilby premium og tydelig merkede annonsemuligheter for elbilmerker, forhandlere, ladeaktører, forsikring og mobilitetspartnere.",
        eyebrow: "Fremtidige partnerskap",
        title: "Premium bilannonsering, utformet for å være nyttig.",
        sections: [
          {
            title: "Tilnærming ved lansering",
            body: "NordicDrive starter som en ren informasjonsplattform. De første sidene skal være lette, raske og tillitvekkende før annonser introduseres.",
          },
          {
            title: "Fremtidige annonseformater",
            body: "Mulige formater inkluderer sponsede lanseringssider, synlighet for forhandlere, kampanjer for ladenettverk, forsikringspartnere, nyhetsbrev og plasseringer på sammenligningssider.",
          },
          {
            title: "Regler for tillit",
            body: "Betalte plasseringer bør merkes tydelig, være visuelt tilbakeholdne og holdes adskilt fra redaksjonelle anbefalinger.",
          },
        ],
      },
      disclaimer: {
        description:
          "NordicDrive er en uavhengig informasjonsplattform. Priser, spesifikasjoner, rekkevidde, tilgjengelighet og lanseringstidspunkt kan endres.",
        eyebrow: "Nøyaktighet og uavhengighet",
        title: "Viktig informasjon før du bruker NordicDrive.",
        sections: [
          {
            title: "Uavhengig plattform",
            body: "NordicDrive er ikke tilknyttet Tesla, BMW, Audi, Volvo, Polestar, Porsche, Hyundai, Kia, BYD, NIO eller andre produsenter med mindre dette står uttrykkelig.",
          },
          {
            title: "Data kan endres",
            body: "Priser, utstyrsnivåer, spesifikasjoner, WLTP-rekkevidde, ladedata, lanseringsdatoer og insentiver kan endres uten varsel. Bekreft alltid endelige detaljer hos produsent, importør, forhandler eller offisiell kilde.",
          },
          {
            title: "Ikke økonomisk rådgivning",
            body: "NordicDrive tilbyr generell informasjon og sammenligningsverktøy. Plattformen gir ikke økonomisk, juridisk, forsikringsmessig, skattemessig eller kjøpsmessig rådgivning.",
          },
          {
            title: "Bilder og media",
            body: "Bilbilder bør komme fra lisensierte, produsentgodkjente, forhandlergodkjente eller egeneide mediekilder. Plassholdergrafikk kan brukes til godkjent media er tilgjengelig.",
          },
        ],
      },
    },
  },
} as const satisfies Record<Locale, object>;

export type Dictionary = (typeof dictionaries)[Locale];
export type HomeDictionary = Dictionary["home"];
export type InformationalDictionary = Dictionary["informational"];
export type ListingDictionary = Dictionary["listing"];

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
