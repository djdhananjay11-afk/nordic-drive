CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "UserRole" AS ENUM ('USER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "CarStatus" AS ENUM ('AVAILABLE', 'UPCOMING', 'DISCONTINUED');
CREATE TYPE "Drivetrain" AS ENUM ('FWD', 'RWD', 'AWD');
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'MODEL_3D', 'INTERIOR', 'EXTERIOR');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "passwordHash" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "locale" TEXT NOT NULL DEFAULT 'nb-NO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Account" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId")
);

CREATE TABLE "Session" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
);

CREATE TABLE "Brand" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "country" TEXT,
  "logoUrl" TEXT,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CarModel" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "brandId" UUID NOT NULL REFERENCES "Brand"("id") ON DELETE RESTRICT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "segment" TEXT NOT NULL,
  "bodyType" TEXT NOT NULL,
  "status" "CarStatus" NOT NULL DEFAULT 'AVAILABLE',
  "launchDate" TIMESTAMP(3),
  "description" TEXT,
  "heroImageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CarModel_brandId_slug_key" UNIQUE ("brandId", "slug")
);

CREATE TABLE "CarVariant" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "modelId" UUID NOT NULL REFERENCES "CarModel"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "drivetrain" "Drivetrain" NOT NULL,
  "batteryCapacityKwh" DECIMAL(6,2) NOT NULL,
  "rangeWltpKm" INTEGER NOT NULL,
  "rangeWinterEstimateKm" INTEGER,
  "powerHp" INTEGER,
  "torqueNm" INTEGER,
  "acceleration0To100" DECIMAL(4,2),
  "topSpeed" INTEGER,
  "priceNok" INTEGER NOT NULL,
  "monthlyEstimateNok" INTEGER,
  "availabilityStatus" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CarVariant_modelId_slug_key" UNIQUE ("modelId", "slug")
);

CREATE TABLE "CarSpecification" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "variantId" UUID NOT NULL UNIQUE REFERENCES "CarVariant"("id") ON DELETE CASCADE,
  "lengthMm" INTEGER,
  "widthMm" INTEGER,
  "heightMm" INTEGER,
  "wheelbaseMm" INTEGER,
  "bootSpaceLiters" INTEGER,
  "seats" INTEGER,
  "weightKg" INTEGER,
  "towingCapacityKg" INTEGER,
  "groundClearanceMm" INTEGER
);

CREATE TABLE "EVSpecification" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "variantId" UUID NOT NULL UNIQUE REFERENCES "CarVariant"("id") ON DELETE CASCADE,
  "chargingAcKw" DECIMAL(5,2),
  "chargingDcKw" DECIMAL(6,2),
  "charging10To80Minutes" INTEGER,
  "heatPump" BOOLEAN NOT NULL DEFAULT false,
  "batteryChemistry" TEXT,
  "plugType" TEXT NOT NULL DEFAULT 'CCS',
  "estimatedWinterRangeLossPercent" INTEGER
);

CREATE TABLE "CarMedia" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "modelId" UUID NOT NULL REFERENCES "CarModel"("id") ON DELETE CASCADE,
  "variantId" UUID REFERENCES "CarVariant"("id") ON DELETE SET NULL,
  "type" "MediaType" NOT NULL,
  "url" TEXT NOT NULL,
  "altText" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Review" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "modelId" UUID NOT NULL REFERENCES "CarModel"("id") ON DELETE CASCADE,
  "authorId" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "rating" DECIMAL(3,1),
  "pros" TEXT[] NOT NULL,
  "cons" TEXT[] NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Comparison" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "title" TEXT,
  "carVariantIds" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Favorite" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "modelId" UUID NOT NULL REFERENCES "CarModel"("id") ON DELETE CASCADE,
  "variantId" UUID REFERENCES "CarVariant"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_userId_modelId_variantId_key" UNIQUE ("userId", "modelId", "variantId")
);

CREATE TABLE "FutureLaunch" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "brandId" UUID NOT NULL REFERENCES "Brand"("id") ON DELETE RESTRICT,
  "modelName" TEXT NOT NULL,
  "expectedLaunchDate" TIMESTAMP(3),
  "estimatedPriceFromNok" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'RUMORED',
  "confidenceLevel" INTEGER NOT NULL DEFAULT 50,
  "sourceNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "RecommendationSession" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID,
  "inputPayload" JSONB NOT NULL,
  "resultPayload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "TaxRule" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "year" INTEGER NOT NULL,
  "ruleType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "validFrom" TIMESTAMP(3) NOT NULL,
  "validTo" TIMESTAMP(3)
);

CREATE TABLE "ChargingNetwork" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'NO',
  "providerUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AdminAuditLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "beforePayload" JSONB,
  "afterPayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "CarModel_brandId_idx" ON "CarModel"("brandId");
CREATE INDEX "CarModel_status_idx" ON "CarModel"("status");
CREATE INDEX "CarModel_segment_idx" ON "CarModel"("segment");
CREATE INDEX "CarVariant_modelId_idx" ON "CarVariant"("modelId");
CREATE INDEX "CarVariant_priceNok_idx" ON "CarVariant"("priceNok");
CREATE INDEX "CarVariant_rangeWltpKm_idx" ON "CarVariant"("rangeWltpKm");
CREATE INDEX "CarVariant_batteryCapacityKwh_idx" ON "CarVariant"("batteryCapacityKwh");
CREATE INDEX "CarMedia_modelId_idx" ON "CarMedia"("modelId");
CREATE INDEX "CarMedia_variantId_idx" ON "CarMedia"("variantId");
CREATE INDEX "Review_modelId_idx" ON "Review"("modelId");
CREATE INDEX "Review_status_idx" ON "Review"("status");
CREATE INDEX "Comparison_userId_idx" ON "Comparison"("userId");
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX "FutureLaunch_expectedLaunchDate_idx" ON "FutureLaunch"("expectedLaunchDate");
CREATE INDEX "TaxRule_year_idx" ON "TaxRule"("year");
CREATE INDEX "TaxRule_ruleType_idx" ON "TaxRule"("ruleType");
CREATE INDEX "AdminAuditLog_userId_idx" ON "AdminAuditLog"("userId");
CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");
