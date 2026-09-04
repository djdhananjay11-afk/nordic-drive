import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { appConfig, validateEnvironment } from "./config/app.config.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { CarsModule } from "./modules/cars/cars.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { PrismaModule } from "./modules/prisma/prisma.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig],
      validate: validateEnvironment,
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    CarsModule,
  ],
})
export class AppModule {}
