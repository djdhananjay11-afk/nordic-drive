import { Plus } from "lucide-react";

import { AdminPageHeader, AdminSearchBar, AdminTable } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { formatNok } from "@/features/cars/data/nordic-cars";
import { listAdminCars } from "@/lib/admin/services";

export default async function AdminCarsPage() {
  const cars = await listAdminCars();

  return (
    <>
      <AdminPageHeader
        action={
          <Button className="bg-slate-950 text-white hover:bg-slate-800">
            <Plus className="mr-2 size-4" />
            Add car
          </Button>
        }
        description="Create, edit, publish, and soft-delete cars and variants in the NordicDrive catalog."
        eyebrow="Inventory"
        title="Cars"
      />
      <AdminSearchBar placeholder="Search cars by brand, model, segment..." />
      <AdminTable
        columns={["Model", "Brand", "Segment", "Price from", "Primary variant", "Status"]}
        rows={cars.map((car) => [
          <span className="font-semibold" key="model">{car.name}</span>,
          car.brand.name,
          car.segment,
          car.priceFromNok ? formatNok(car.priceFromNok) : "Not set",
          car.variants[0]?.name ?? "No variants",
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold" key="status">
            {car.status}
          </span>,
        ])}
      />
    </>
  );
}
