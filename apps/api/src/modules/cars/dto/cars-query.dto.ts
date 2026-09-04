import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import type { CarStatus } from "@nordicdrive/types";

const carStatuses = ["AVAILABLE", "UPCOMING", "DISCONTINUED"] as const;

export class CarsQueryDto {
  @IsOptional()
  @IsEnum(carStatuses)
  status?: CarStatus;

  @IsOptional()
  @IsString()
  segment?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 24;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}
