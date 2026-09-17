import { CatalogueComparison } from "@/features/catalogue/pages";

export const dynamic = "force-dynamic";
export default async function VerifiedCompare({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CatalogueComparison params={await searchParams} />;
}
