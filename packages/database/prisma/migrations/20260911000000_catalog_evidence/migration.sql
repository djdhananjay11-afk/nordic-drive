-- Additive only. Never replace existing catalogue or seed production example data.
CREATE TYPE "CatalogEvidenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "CatalogEvidence" (
    "id" UUID NOT NULL,
    "contentHash" CHAR(64) NOT NULL,
    "recordKey" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "brandSlug" TEXT NOT NULL,
    "modelName" TEXT,
    "variantName" TEXT,
    "market" CHAR(2) NOT NULL DEFAULT 'NO',
    "observedOn" DATE NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "reviewStatus" "CatalogEvidenceStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "CatalogEvidence_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CatalogEvidence_market_check" CHECK ("market" = 'NO'),
    CONSTRAINT "CatalogEvidence_hash_check" CHECK ("contentHash" ~ '^[a-f0-9]{64}$')
);

CREATE UNIQUE INDEX "CatalogEvidence_contentHash_key" ON "CatalogEvidence"("contentHash");
CREATE INDEX "CatalogEvidence_brandSlug_modelName_observedOn_idx"
    ON "CatalogEvidence"("brandSlug", "modelName", "observedOn");
CREATE INDEX "CatalogEvidence_batchId_idx" ON "CatalogEvidence"("batchId");
CREATE INDEX "CatalogEvidence_reviewStatus_deletedAt_idx"
    ON "CatalogEvidence"("reviewStatus", "deletedAt");

-- Supabase browser clients must not expose unreviewed source data or media links.
-- Import through a trusted, server-only database owner/service connection.
ALTER TABLE "CatalogEvidence" ENABLE ROW LEVEL SECURITY;
