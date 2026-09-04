import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import type { CarsQueryDto } from "./dto/cars-query.dto.js";

@Injectable()
export class CarsService {
  constructor(private readonly prisma: PrismaService) {}

  async listCars(query: CarsQueryDto) {
    const where = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.segment ? { segment: query.segment } : {}),
    };

    return this.prisma.car.findMany({
      where,
      include: {
        brand: true,
        variants: {
          where: { deletedAt: null },
          orderBy: { priceNok: "asc" },
          take: 3,
        },
      },
      orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
      take: query.limit,
      skip: query.offset,
    });
  }

  async getCarBySlug(brandSlug: string, modelSlug: string) {
    const car = await this.prisma.car.findFirst({
      where: {
        slug: modelSlug,
        deletedAt: null,
        brand: {
          slug: brandSlug,
          deletedAt: null,
        },
      },
      include: {
        brand: true,
        media: true,
        variants: {
          where: { deletedAt: null },
          include: {
            specification: true,
            evCharging: true,
          },
          orderBy: { priceNok: "asc" },
        },
        reviews: {
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
        },
      },
    });

    if (!car) {
      throw new NotFoundException("Car model not found");
    }

    return car;
  }
}
