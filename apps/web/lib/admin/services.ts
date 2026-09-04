import { prisma } from "@/lib/db";

import type { Prisma } from "@nordicdrive/database";

export async function getAdminAnalytics() {
  const [cars, brands, launches, articles, users, media] = await Promise.all([
    prisma.car.count({ where: { deletedAt: null } }),
    prisma.brand.count({ where: { deletedAt: null } }),
    prisma.launch.count({ where: { deletedAt: null } }),
    prisma.article.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.media.count({ where: { deletedAt: null } }),
  ]);

  const recentCars = await prisma.car.findMany({
    where: { deletedAt: null },
    include: { brand: true, variants: { where: { deletedAt: null }, take: 1, orderBy: { priceNok: "asc" } } },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return {
    counts: { cars, brands, launches, articles, users, media },
    recentCars,
    chart: [
      { label: "Mon", value: 18 },
      { label: "Tue", value: 27 },
      { label: "Wed", value: 22 },
      { label: "Thu", value: 34 },
      { label: "Fri", value: 41 },
      { label: "Sat", value: 29 },
      { label: "Sun", value: 37 },
    ],
  };
}

export async function listAdminCars() {
  return prisma.car.findMany({
    where: { deletedAt: null },
    include: {
      brand: true,
      variants: { where: { deletedAt: null }, orderBy: { priceNok: "asc" }, take: 1 },
    },
    orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
  });
}

export async function createAdminCar(data: unknown) {
  return prisma.car.create({ data: cleanData(data) as Prisma.CarUncheckedCreateInput });
}

export async function updateAdminCar(id: string, data: unknown) {
  return prisma.car.update({ where: { id }, data: cleanData(data) as Prisma.CarUncheckedUpdateInput });
}

export async function deleteAdminCar(id: string) {
  return prisma.car.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listAdminBrands() {
  return prisma.brand.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { cars: true, dealers: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createAdminBrand(data: unknown) {
  return prisma.brand.create({ data: cleanData(data) as Prisma.BrandUncheckedCreateInput });
}

export async function updateAdminBrand(id: string, data: unknown) {
  return prisma.brand.update({ where: { id }, data: cleanData(data) as Prisma.BrandUncheckedUpdateInput });
}

export async function deleteAdminBrand(id: string) {
  return prisma.brand.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
}

export async function listAdminLaunches() {
  return prisma.launch.findMany({
    where: { deletedAt: null },
    include: { brand: true, car: true },
    orderBy: [{ expectedLaunchDate: "asc" }, { updatedAt: "desc" }],
  });
}

export async function createAdminLaunch(data: unknown) {
  return prisma.launch.create({ data: cleanData(data) as Prisma.LaunchUncheckedCreateInput });
}

export async function updateAdminLaunch(id: string, data: unknown) {
  return prisma.launch.update({ where: { id }, data: cleanData(data) as Prisma.LaunchUncheckedUpdateInput });
}

export async function deleteAdminLaunch(id: string) {
  return prisma.launch.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listAdminArticles() {
  return prisma.article.findMany({
    where: { deletedAt: null },
    include: { author: true },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });
}

export async function createAdminArticle(data: unknown) {
  return prisma.article.create({ data: cleanData(data) as Prisma.ArticleUncheckedCreateInput });
}

export async function updateAdminArticle(id: string, data: unknown) {
  return prisma.article.update({ where: { id }, data: cleanData(data) as Prisma.ArticleUncheckedUpdateInput });
}

export async function deleteAdminArticle(id: string) {
  return prisma.article.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listAdminMedia() {
  return prisma.media.findMany({
    where: { deletedAt: null },
    include: { brand: true, car: true, variant: true, launch: true, article: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

export async function listAdminUsers() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    include: { role: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function listRoles() {
  return prisma.role.findMany({
    where: { deletedAt: null },
    include: { permissions: true },
    orderBy: { name: "asc" },
  });
}

function cleanData(data: unknown) {
  if (!data || typeof data !== "object") {
    return {};
  }

  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}
