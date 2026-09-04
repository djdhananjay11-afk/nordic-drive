import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getPublishedCarListing() {
  return prisma.car.findMany({
    where: {
      deletedAt: null,
      status: "AVAILABLE",
      brand: {
        deletedAt: null,
        isActive: true,
      },
    },
    include: {
      brand: true,
      variants: {
        where: { deletedAt: null },
        orderBy: { priceNok: "asc" },
        take: 1,
        include: {
          evCharging: true,
          specification: true,
        },
      },
      media: {
        where: { deletedAt: null, isPrimary: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: [{ brand: { name: "asc" } }, { priceFromNok: "asc" }],
    take: 24,
  });
}

export async function getCarDetail(brandSlug: string, carSlug: string) {
  return prisma.car.findFirst({
    where: {
      slug: carSlug,
      deletedAt: null,
      brand: {
        slug: brandSlug,
        deletedAt: null,
      },
    },
    include: {
      brand: true,
      variants: {
        where: { deletedAt: null },
        include: {
          specification: true,
          evCharging: true,
          features: {
            include: { feature: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { priceNok: "asc" },
      },
      features: {
        include: { feature: true },
        orderBy: { sortOrder: "asc" },
      },
      reviews: {
        where: { deletedAt: null, status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
      },
      media: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getNorwayWinterEvShortlist(maxPriceNok: number, minWinterRangeKm: number) {
  return prisma.variant.findMany({
    where: {
      deletedAt: null,
      priceNok: { lte: maxPriceNok },
      rangeWinterEstimateKm: { gte: minWinterRangeKm },
      heatPump: true,
      car: {
        deletedAt: null,
        status: "AVAILABLE",
      },
    },
    include: {
      car: {
        include: { brand: true },
      },
      evCharging: true,
    },
    orderBy: [{ rangeWinterEstimateKm: "desc" }, { priceNok: "asc" }],
  });
}

export async function getComparisonBySlug(slug: string) {
  return prisma.comparison.findUnique({
    where: { slug },
    include: {
      variants: {
        orderBy: { position: "asc" },
        include: {
          variant: {
            include: {
              car: { include: { brand: true } },
              specification: true,
              evCharging: true,
            },
          },
        },
      },
    },
  });
}

export async function userHasPermission(userId: string, action: string, subject: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  return Boolean(
    user?.role?.permissions.some(
      (permission) =>
        (permission.action === action || permission.action === "manage") &&
        (permission.subject === subject || permission.subject === "all"),
    ),
  );
}

export async function softDeleteCar(carId: string) {
  return prisma.car.update({
    where: { id: carId },
    data: { deletedAt: new Date() },
  });
}
