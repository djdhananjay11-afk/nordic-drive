import { Plus } from "lucide-react";

import { AdminPageHeader, AdminSearchBar, AdminTable } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { listAdminBrands } from "@/lib/admin/services";

export default async function AdminBrandsPage() {
  const brands = await listAdminBrands();

  return (
    <>
      <AdminPageHeader
        action={
          <Button className="bg-slate-950 text-white hover:bg-slate-800">
            <Plus className="mr-2 size-4" />
            Add brand
          </Button>
        }
        description="Manage brand pages, SEO metadata, logos, dealer relationships, and active catalog status."
        eyebrow="Catalog"
        title="Brands"
      />
      <AdminSearchBar placeholder="Search brands..." />
      <AdminTable
        columns={["Brand", "Country", "Cars", "Dealers", "Status"]}
        rows={brands.map((brand) => [
          <span className="font-semibold" key="brand">{brand.name}</span>,
          brand.country ?? "Unknown",
          `${brand._count.cars}`,
          `${brand._count.dealers}`,
          brand.isActive ? "Active" : "Inactive",
        ])}
      />
    </>
  );
}
