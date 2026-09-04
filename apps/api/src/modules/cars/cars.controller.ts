import { Controller, Get, Param, Query } from "@nestjs/common";

import { CarsQueryDto } from "./dto/cars-query.dto.js";
import { CarsService } from "./cars.service.js";

@Controller({ path: "cars", version: "1" })
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  listCars(@Query() query: CarsQueryDto) {
    return this.carsService.listCars(query);
  }

  @Get(":brandSlug/:modelSlug")
  getCar(@Param("brandSlug") brandSlug: string, @Param("modelSlug") modelSlug: string) {
    return this.carsService.getCarBySlug(brandSlug, modelSlug);
  }
}
