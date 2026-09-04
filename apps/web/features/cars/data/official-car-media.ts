export type CarMediaAsset = {
  match?: "exact" | "model-family" | "brand-family";
  provider: "manufacturer" | "cms";
  providerName: string;
  representedModel?: string;
  sourceUrl?: string;
  url: string;
};

const teslaModelY: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "Tesla",
  sourceUrl: "https://www.tesla.com/modely",
  url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto:best/Homepage-Model-Y-Desktop-Global",
};

const teslaModel3: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "Tesla",
  sourceUrl: "https://www.tesla.com/model3",
  url: "https://digitalassets.tesla.com/tesla-contents/image/upload/h_2560,w_4096,c_fit,f_auto,q_auto:best/Homepage-Model-3-Desktop-LHD",
};

const teslaModelS: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "Tesla",
  sourceUrl: "https://www.tesla.com/models",
  url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-S-Main-Hero-Desktop-LHD.jpg",
};

const teslaModelX: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "Tesla",
  sourceUrl: "https://www.tesla.com/modelx",
  url: "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-X-Main-Hero-Desktop-LHD.jpg",
};

const bmwIx: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "BMW Group PressClub",
  sourceUrl: "https://www.press.bmwgroup.com/global/photo/detail/P90585317/the-new-bmw-ix-01/2025",
  url: "https://mediapool.bmwgroup.com/cache/P9/202501/P90585317/P90585317-the-new-bmw-ix-01-2025-1500px.jpg",
};

const kiaEv6: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "Kia Norge",
  sourceUrl: "https://www.kia.com/no/modeller/ev6/",
  url: "https://media.crystallize.com/bos-ecom-prod/25/8/18/301/194a2999-rediger-rediger.avif",
};

const kiaEv9: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "Kia Norge",
  sourceUrl: "https://www.kia.com/no/modeller/ev9/",
  url: "https://media.crystallize.com/bos-ecom-prod/25/8/18/367/194a7687-forbedret-nr-rediger-2.avif",
};

const polestar2: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "Polestar",
  sourceUrl: "https://www.polestar.com/no/polestar-2",
  url: "https://www.polestar.com/dato-assets/94392/1736775615-og-polestar-2-26-overview-seo.png",
};

const polestar3: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "Polestar",
  sourceUrl: "https://www.polestar.com/no/polestar-3",
  url: "https://www.polestar.com/dato-assets/94392/1772092219-00-polestar-3-27-overview-seo.png",
};

const polestar4: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "Polestar",
  sourceUrl: "https://www.polestar.com/no/polestar-4",
  url: "https://www.polestar.com/dato-assets/94392/1780062288-00-polestar-4-c-27-overview-seo.png",
};

const polestar5: CarMediaAsset = {
  provider: "manufacturer",
  providerName: "Polestar",
  sourceUrl: "https://www.polestar.com/no/polestar-5",
  url: "https://www.polestar.com/dato-assets/94392/1756804709-00-polestar-5-26-overview-seo.png",
};

export const officialCarMedia: Record<string, CarMediaAsset> = {
  "tesla-model-y-long-range": teslaModelY,
  "tesla-model-3-long-range": teslaModel3,
  "tesla-model-s-dual-motor": teslaModelS,
  "tesla-model-x-dual-motor": teslaModelX,
  "bmw-ix-xdrive50": bmwIx,
  "kia-ev6-long-range-awd": kiaEv6,
  "kia-ev6-gt": kiaEv6,
  "kia-ev9-gt-line-awd": kiaEv9,
  "polestar-polestar-2-long-range": polestar2,
  "polestar-polestar-3-long-range-dual-motor": polestar3,
  "polestar-polestar-4-long-range-dual-motor": polestar4,
  "polestar-polestar-5": polestar5,
};

export function getOfficialCarMedia(key: string) {
  return officialCarMedia[key];
}

export function getCarMediaMatchLabel(asset?: CarMediaAsset) {
  if (!asset?.match || asset.match === "exact") {
    return undefined;
  }

  const representedModel = asset.representedModel ?? "model";

  return asset.match === "model-family"
    ? `${representedModel} family media`
    : `${representedModel} reference media`;
}
