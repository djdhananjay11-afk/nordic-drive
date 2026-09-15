import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCuratedRelease } from "@/features/catalogue/config";
import { CatalogueDetail } from "@/features/catalogue/pages";
import { getCatalogue } from "@/features/catalogue/repository";
import { catalogueCopy } from "@/features/catalogue/copy";
import { getRequestLocale } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/seo";
import { vehiclePath } from "@nordicdrive/database/catalogue";

import { JsonLd } from "@/components/seo/json-ld";
import { getCarBySlug, nordicCars } from "@/features/cars/data/nordic-cars";
import { PremiumCarDetailPage } from "@/features/cars/detail/car-detail-page";
import { breadcrumbJsonLd, carJsonLd, createCarMetadata } from "@/lib/seo";

type CarDetailRouteProps = {
  params: Promise<{
    brandSlug: string;
    modelSlug: string;
  }>;
};

export const dynamicParams = true;
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export function generateStaticParams() {
  if (isCuratedRelease()) return [];
  return nordicCars.map((car) => ({
    brandSlug: car.brandSlug,
    modelSlug: car.modelSlug,
  }));
}

export async function generateMetadata({ params }: CarDetailRouteProps): Promise<Metadata> {
  const resolvedParams = await params;
  if (isCuratedRelease()) {
    const vehicle = (await getCatalogue()).find(
      (v) => v.brandSlug === resolvedParams.brandSlug && v.slug === resolvedParams.modelSlug,
    );
    if (!vehicle) notFound();
    const locale = await getRequestLocale();
    return createPageMetadata({
      title: `${vehicle.brand} ${vehicle.model} ${vehicle.variant}`,
      description: catalogueCopy[locale].intro,
      locale,
      path: vehiclePath(vehicle),
    });
  }
  const car = getCarBySlug(resolvedParams.brandSlug, resolvedParams.modelSlug);

  if (!car) {
    return {};
  }

  return createCarMetadata(car);
}

export default async function CarDetailRoute({ params }: CarDetailRouteProps) {
  const resolvedParams = await params;
  if (isCuratedRelease()) {
    const vehicle = (await getCatalogue()).find(
      (v) => v.brandSlug === resolvedParams.brandSlug && v.slug === resolvedParams.modelSlug,
    );
    if (!vehicle) notFound();
    return <CatalogueDetail vehicle={vehicle} locale={await getRequestLocale()} />;
  }
  const car = getCarBySlug(resolvedParams.brandSlug, resolvedParams.modelSlug);

  if (!car) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          carJsonLd(car),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: car.brand, path: `/brands/${car.brandSlug}` },
            { name: car.model, path: `/cars/${car.brandSlug}/${car.modelSlug}` },
          ]),
        ]}
        id="nordicdrive-car-schema"
      />
      <PremiumCarDetailPage car={car} />
    </>
  );
}
