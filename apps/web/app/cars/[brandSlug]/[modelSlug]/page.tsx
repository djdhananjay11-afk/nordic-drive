import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return nordicCars.map((car) => ({
    brandSlug: car.brandSlug,
    modelSlug: car.modelSlug,
  }));
}

export async function generateMetadata({ params }: CarDetailRouteProps): Promise<Metadata> {
  const resolvedParams = await params;
  const car = getCarBySlug(resolvedParams.brandSlug, resolvedParams.modelSlug);

  if (!car) {
    return {};
  }

  return createCarMetadata(car);
}

export default async function CarDetailRoute({ params }: CarDetailRouteProps) {
  const resolvedParams = await params;
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
