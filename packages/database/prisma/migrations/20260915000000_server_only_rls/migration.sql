-- Access is through server-side Prisma and RBAC, not the Supabase browser Data API.
ALTER TABLE "CatalogEvidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RolePermission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Car" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Variant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Specification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Feature" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CarFeature" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VariantFeature" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comparison" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComparisonVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedComparison" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Launch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Article" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dealer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DealerBrand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EVCharging" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlist" ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  browser_role TEXT;
  app_table TEXT;
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
  END IF;
  FOREACH browser_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = browser_role) THEN
      FOREACH app_table IN ARRAY ARRAY[
        'CatalogEvidence', 'Role', 'RolePermission', 'User', 'Account', 'Session',
        'VerificationToken', 'Brand', 'Car', 'Variant', 'Specification', 'Feature',
        'CarFeature', 'VariantFeature', 'Review', 'Comparison', 'ComparisonVariant',
        'SavedComparison', 'Media', 'Launch', 'Article', 'Dealer', 'DealerBrand',
        'EVCharging', 'Wishlist', '_prisma_migrations'
      ] LOOP
        IF to_regclass(format('public.%I', app_table)) IS NOT NULL THEN
          EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM %I', app_table, browser_role);
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END $$;
