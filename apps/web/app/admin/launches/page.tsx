import { Plus } from "lucide-react";

import { AdminPageHeader, AdminSearchBar, AdminTable } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { formatNok } from "@/features/cars/data/nordic-cars";
import { listAdminLaunches } from "@/lib/admin/services";

export default async function AdminLaunchesPage() {
  const launches = await listAdminLaunches();

  return (
    <>
      <AdminPageHeader
        action={
          <Button className="bg-slate-950 text-white hover:bg-slate-800">
            <Plus className="mr-2 size-4" />
            Add launch
          </Button>
        }
        description="Track expected launch windows, editorial confidence, source notes, and SEO pages."
        eyebrow="Future cars"
        title="Launches"
      />
      <AdminSearchBar placeholder="Search launches..." />
      <AdminTable
        columns={["Model", "Brand", "Expected", "Estimate", "Confidence", "Status"]}
        rows={launches.map((launch) => [
          <span className="font-semibold" key="model">{launch.modelName}</span>,
          launch.brand.name,
          launch.expectedLaunchDate?.toLocaleDateString("nb-NO") ?? "TBD",
          launch.estimatedPriceFromNok ? formatNok(launch.estimatedPriceFromNok) : "TBD",
          `${launch.confidenceLevel}%`,
          launch.status,
        ])}
      />
    </>
  );
}
