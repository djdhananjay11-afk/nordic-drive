-- Phase 3 replaces the early draft schema with the production NordicDrive data model.
-- This migration is intended for the pre-production workspace database.
DROP TABLE IF EXISTS "AdminAuditLog" CASCADE;
DROP TABLE IF EXISTS "ChargingNetwork" CASCADE;
DROP TABLE IF EXISTS "TaxRule" CASCADE;
DROP TABLE IF EXISTS "RecommendationSession" CASCADE;
DROP TABLE IF EXISTS "FutureLaunch" CASCADE;
DROP TABLE IF EXISTS "Favorite" CASCADE;
DROP TABLE IF EXISTS "Comparison" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "CarMedia" CASCADE;
DROP TABLE IF EXISTS "EVSpecification" CASCADE;
DROP TABLE IF EXISTS "CarSpecification" CASCADE;
DROP TABLE IF EXISTS "CarVariant" CASCADE;
DROP TABLE IF EXISTS "CarModel" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Brand" CASCADE;

DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "CarStatus" CASCADE;
DROP TYPE IF EXISTS "VariantStatus" CASCADE;
DROP TYPE IF EXISTS "BodyType" CASCADE;
DROP TYPE IF EXISTS "Drivetrain" CASCADE;
DROP TYPE IF EXISTS "FeatureCategory" CASCADE;
DROP TYPE IF EXISTS "MediaType" CASCADE;
DROP TYPE IF EXISTS "LaunchStatus" CASCADE;
DROP TYPE IF EXISTS "DealerType" CASCADE;
DROP TYPE IF EXISTS "ChargingPlugType" CASCADE;
DROP TYPE IF EXISTS "ContentStatus" CASCADE;

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('AVAILABLE', 'UPCOMING', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('AVAILABLE', 'ORDER_OPEN', 'WAITLIST', 'SOLD_OUT', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('SUV', 'SEDAN', 'CROSSOVER', 'WAGON', 'HATCHBACK', 'COUPE', 'VAN');

-- CreateEnum
CREATE TYPE "Drivetrain" AS ENUM ('FWD', 'RWD', 'AWD');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('SAFETY', 'COMFORT', 'PERFORMANCE', 'CHARGING', 'INTERIOR', 'EXTERIOR', 'SOFTWARE', 'WINTER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'MODEL_3D', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "LaunchStatus" AS ENUM ('RUMORED', 'CONFIRMED', 'DELAYED', 'LAUNCHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DealerType" AS ENUM ('OFFICIAL', 'USED_CAR', 'SERVICE', 'IMPORTER');

-- CreateEnum
CREATE TYPE "ChargingPlugType" AS ENUM ('CCS', 'TYPE_2', 'CHADEMO', 'NACS');

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "roleId" UUID,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'nb-NO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
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

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" UUID NOT NULL,
    "brandId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT,
    "tagline" TEXT,
    "description" TEXT,
    "status" "CarStatus" NOT NULL DEFAULT 'AVAILABLE',
    "bodyType" "BodyType" NOT NULL,
    "segment" TEXT NOT NULL,
    "modelYear" INTEGER,
    "heroImageUrl" TEXT,
    "priceFromNok" INTEGER,
    "monthlyFromNok" INTEGER,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" UUID NOT NULL,
    "carId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "VariantStatus" NOT NULL DEFAULT 'AVAILABLE',
    "drivetrain" "Drivetrain" NOT NULL,
    "priceNok" INTEGER NOT NULL,
    "monthlyEstimateNok" INTEGER,
    "batteryCapacityKwh" DECIMAL(6,2) NOT NULL,
    "rangeWltpKm" INTEGER NOT NULL,
    "rangeWinterEstimateKm" INTEGER,
    "powerHp" INTEGER,
    "torqueNm" INTEGER,
    "acceleration0To100" DECIMAL(4,2),
    "topSpeedKmh" INTEGER,
    "chargingAcKw" DECIMAL(5,2),
    "chargingDcKw" DECIMAL(6,2),
    "charging10To80Minutes" INTEGER,
    "heatPump" BOOLEAN NOT NULL DEFAULT false,
    "plugType" "ChargingPlugType" NOT NULL DEFAULT 'CCS',
    "seats" INTEGER,
    "towingCapacityKg" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specification" (
    "id" UUID NOT NULL,
    "carId" UUID,
    "variantId" UUID,
    "lengthMm" INTEGER,
    "widthMm" INTEGER,
    "heightMm" INTEGER,
    "wheelbaseMm" INTEGER,
    "bootSpaceLiters" INTEGER,
    "frunkLiters" INTEGER,
    "seats" INTEGER,
    "weightKg" INTEGER,
    "towingCapacityKg" INTEGER,
    "groundClearanceMm" INTEGER,
    "warrantyYears" INTEGER,
    "batteryWarrantyKm" INTEGER,
    "batteryWarrantyYears" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Specification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL,
    "description" TEXT,
    "iconName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarFeature" (
    "id" UUID NOT NULL,
    "carId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CarFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantFeature" (
    "id" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VariantFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "carId" UUID NOT NULL,
    "variantId" UUID,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "rating" DECIMAL(3,1),
    "pros" TEXT[],
    "cons" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" UUID NOT NULL,
    "createdById" UUID,
    "carId" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComparisonVariant" (
    "id" UUID NOT NULL,
    "comparisonId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "ComparisonVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedComparison" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "comparisonId" UUID NOT NULL,
    "name" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SavedComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" UUID NOT NULL,
    "brandId" UUID,
    "carId" UUID,
    "variantId" UUID,
    "launchId" UUID,
    "articleId" UUID,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "blurDataUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Launch" (
    "id" UUID NOT NULL,
    "brandId" UUID NOT NULL,
    "carId" UUID,
    "modelName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "expectedLaunchDate" TIMESTAMP(3),
    "estimatedPriceFromNok" INTEGER,
    "status" "LaunchStatus" NOT NULL DEFAULT 'RUMORED',
    "confidenceLevel" INTEGER NOT NULL DEFAULT 50,
    "sourceNote" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Launch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "canonicalUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dealer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "DealerType" NOT NULL,
    "orgNumber" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "websiteUrl" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'NO',
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Dealer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerBrand" (
    "id" UUID NOT NULL,
    "dealerId" UUID NOT NULL,
    "brandId" UUID NOT NULL,

    CONSTRAINT "DealerBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EVCharging" (
    "id" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "chargingAcKw" DECIMAL(5,2),
    "chargingDcKw" DECIMAL(6,2),
    "charging10To80Minutes" INTEGER,
    "plugType" "ChargingPlugType" NOT NULL DEFAULT 'CCS',
    "batteryPreconditioning" BOOLEAN NOT NULL DEFAULT false,
    "vehicleToLoad" BOOLEAN NOT NULL DEFAULT false,
    "batteryChemistry" TEXT,
    "chargingCurveNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EVCharging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "carId" UUID NOT NULL,
    "variantId" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE INDEX "Role_deletedAt_idx" ON "Role"("deletedAt");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_action_subject_idx" ON "RolePermission"("action", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_action_subject_key" ON "RolePermission"("roleId", "action", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_isActive_deletedAt_idx" ON "Brand"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "Brand_deletedAt_idx" ON "Brand"("deletedAt");

-- CreateIndex
CREATE INDEX "Car_brandId_idx" ON "Car"("brandId");

-- CreateIndex
CREATE INDEX "Car_status_deletedAt_idx" ON "Car"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "Car_bodyType_idx" ON "Car"("bodyType");

-- CreateIndex
CREATE INDEX "Car_segment_idx" ON "Car"("segment");

-- CreateIndex
CREATE INDEX "Car_priceFromNok_idx" ON "Car"("priceFromNok");

-- CreateIndex
CREATE INDEX "Car_deletedAt_idx" ON "Car"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Car_brandId_slug_key" ON "Car"("brandId", "slug");

-- CreateIndex
CREATE INDEX "Variant_carId_idx" ON "Variant"("carId");

-- CreateIndex
CREATE INDEX "Variant_status_deletedAt_idx" ON "Variant"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "Variant_priceNok_idx" ON "Variant"("priceNok");

-- CreateIndex
CREATE INDEX "Variant_rangeWltpKm_idx" ON "Variant"("rangeWltpKm");

-- CreateIndex
CREATE INDEX "Variant_rangeWinterEstimateKm_idx" ON "Variant"("rangeWinterEstimateKm");

-- CreateIndex
CREATE INDEX "Variant_batteryCapacityKwh_idx" ON "Variant"("batteryCapacityKwh");

-- CreateIndex
CREATE INDEX "Variant_deletedAt_idx" ON "Variant"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_carId_slug_key" ON "Variant"("carId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Specification_variantId_key" ON "Specification"("variantId");

-- CreateIndex
CREATE INDEX "Specification_carId_idx" ON "Specification"("carId");

-- CreateIndex
CREATE INDEX "Specification_variantId_idx" ON "Specification"("variantId");

-- CreateIndex
CREATE INDEX "Specification_deletedAt_idx" ON "Specification"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_slug_key" ON "Feature"("slug");

-- CreateIndex
CREATE INDEX "Feature_category_idx" ON "Feature"("category");

-- CreateIndex
CREATE INDEX "Feature_deletedAt_idx" ON "Feature"("deletedAt");

-- CreateIndex
CREATE INDEX "CarFeature_carId_sortOrder_idx" ON "CarFeature"("carId", "sortOrder");

-- CreateIndex
CREATE INDEX "CarFeature_featureId_idx" ON "CarFeature"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "CarFeature_carId_featureId_key" ON "CarFeature"("carId", "featureId");

-- CreateIndex
CREATE INDEX "VariantFeature_variantId_sortOrder_idx" ON "VariantFeature"("variantId", "sortOrder");

-- CreateIndex
CREATE INDEX "VariantFeature_featureId_idx" ON "VariantFeature"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantFeature_variantId_featureId_key" ON "VariantFeature"("variantId", "featureId");

-- CreateIndex
CREATE INDEX "Review_carId_idx" ON "Review"("carId");

-- CreateIndex
CREATE INDEX "Review_variantId_idx" ON "Review"("variantId");

-- CreateIndex
CREATE INDEX "Review_authorId_idx" ON "Review"("authorId");

-- CreateIndex
CREATE INDEX "Review_status_publishedAt_idx" ON "Review"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Review_deletedAt_idx" ON "Review"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_carId_slug_key" ON "Review"("carId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Comparison_slug_key" ON "Comparison"("slug");

-- CreateIndex
CREATE INDEX "Comparison_createdById_idx" ON "Comparison"("createdById");

-- CreateIndex
CREATE INDEX "Comparison_carId_idx" ON "Comparison"("carId");

-- CreateIndex
CREATE INDEX "Comparison_isTemplate_deletedAt_idx" ON "Comparison"("isTemplate", "deletedAt");

-- CreateIndex
CREATE INDEX "Comparison_deletedAt_idx" ON "Comparison"("deletedAt");

-- CreateIndex
CREATE INDEX "ComparisonVariant_comparisonId_position_idx" ON "ComparisonVariant"("comparisonId", "position");

-- CreateIndex
CREATE INDEX "ComparisonVariant_variantId_idx" ON "ComparisonVariant"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "ComparisonVariant_comparisonId_variantId_key" ON "ComparisonVariant"("comparisonId", "variantId");

-- CreateIndex
CREATE INDEX "SavedComparison_userId_idx" ON "SavedComparison"("userId");

-- CreateIndex
CREATE INDEX "SavedComparison_comparisonId_idx" ON "SavedComparison"("comparisonId");

-- CreateIndex
CREATE INDEX "SavedComparison_deletedAt_idx" ON "SavedComparison"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedComparison_userId_comparisonId_key" ON "SavedComparison"("userId", "comparisonId");

-- CreateIndex
CREATE INDEX "Media_brandId_idx" ON "Media"("brandId");

-- CreateIndex
CREATE INDEX "Media_carId_sortOrder_idx" ON "Media"("carId", "sortOrder");

-- CreateIndex
CREATE INDEX "Media_variantId_sortOrder_idx" ON "Media"("variantId", "sortOrder");

-- CreateIndex
CREATE INDEX "Media_launchId_idx" ON "Media"("launchId");

-- CreateIndex
CREATE INDEX "Media_articleId_idx" ON "Media"("articleId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "Media_deletedAt_idx" ON "Media"("deletedAt");

-- CreateIndex
CREATE INDEX "Launch_brandId_idx" ON "Launch"("brandId");

-- CreateIndex
CREATE INDEX "Launch_carId_idx" ON "Launch"("carId");

-- CreateIndex
CREATE INDEX "Launch_status_expectedLaunchDate_idx" ON "Launch"("status", "expectedLaunchDate");

-- CreateIndex
CREATE INDEX "Launch_deletedAt_idx" ON "Launch"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Launch_brandId_slug_key" ON "Launch"("brandId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE INDEX "Article_category_idx" ON "Article"("category");

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_deletedAt_idx" ON "Article"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Dealer_slug_key" ON "Dealer"("slug");

-- CreateIndex
CREATE INDEX "Dealer_type_idx" ON "Dealer"("type");

-- CreateIndex
CREATE INDEX "Dealer_city_idx" ON "Dealer"("city");

-- CreateIndex
CREATE INDEX "Dealer_deletedAt_idx" ON "Dealer"("deletedAt");

-- CreateIndex
CREATE INDEX "DealerBrand_dealerId_idx" ON "DealerBrand"("dealerId");

-- CreateIndex
CREATE INDEX "DealerBrand_brandId_idx" ON "DealerBrand"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "DealerBrand_dealerId_brandId_key" ON "DealerBrand"("dealerId", "brandId");

-- CreateIndex
CREATE UNIQUE INDEX "EVCharging_variantId_key" ON "EVCharging"("variantId");

-- CreateIndex
CREATE INDEX "EVCharging_chargingDcKw_idx" ON "EVCharging"("chargingDcKw");

-- CreateIndex
CREATE INDEX "EVCharging_plugType_idx" ON "EVCharging"("plugType");

-- CreateIndex
CREATE INDEX "EVCharging_deletedAt_idx" ON "EVCharging"("deletedAt");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE INDEX "Wishlist_carId_idx" ON "Wishlist"("carId");

-- CreateIndex
CREATE INDEX "Wishlist_variantId_idx" ON "Wishlist"("variantId");

-- CreateIndex
CREATE INDEX "Wishlist_deletedAt_idx" ON "Wishlist"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_carId_variantId_key" ON "Wishlist"("userId", "carId", "variantId");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarFeature" ADD CONSTRAINT "CarFeature_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarFeature" ADD CONSTRAINT "CarFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantFeature" ADD CONSTRAINT "VariantFeature_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantFeature" ADD CONSTRAINT "VariantFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonVariant" ADD CONSTRAINT "ComparisonVariant_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonVariant" ADD CONSTRAINT "ComparisonVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedComparison" ADD CONSTRAINT "SavedComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedComparison" ADD CONSTRAINT "SavedComparison_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_launchId_fkey" FOREIGN KEY ("launchId") REFERENCES "Launch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Launch" ADD CONSTRAINT "Launch_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Launch" ADD CONSTRAINT "Launch_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerBrand" ADD CONSTRAINT "DealerBrand_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerBrand" ADD CONSTRAINT "DealerBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EVCharging" ADD CONSTRAINT "EVCharging_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

