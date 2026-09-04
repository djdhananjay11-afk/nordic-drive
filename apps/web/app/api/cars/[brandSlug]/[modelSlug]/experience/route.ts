import { NextResponse } from "next/server";

import { getCarBySlug } from "@/features/cars/data/nordic-cars";
import { getCarDetailExperience } from "@/features/cars/detail/car-detail-data";

export const revalidate = 3600;

type CarExperienceRouteContext = {
  params: Promise<{
    brandSlug: string;
    modelSlug: string;
  }>;
};

export async function GET(_request: Request, { params }: CarExperienceRouteContext) {
  const resolvedParams = await params;
  const car = getCarBySlug(resolvedParams.brandSlug, resolvedParams.modelSlug);

  if (!car) {
    return NextResponse.json(
      { error: "Car not found" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
        },
        status: 404,
      },
    );
  }

  return NextResponse.json(
    {
      car: {
        brand: car.brand,
        model: car.model,
        brandSlug: car.brandSlug,
        modelSlug: car.modelSlug,
      },
      experience: getCarDetailExperience(car),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
