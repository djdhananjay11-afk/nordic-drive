import { BookOpenText, Boxes, CarFront, Image, Megaphone, UsersRound } from "lucide-react";

import {
  AdminBarChart,
  AdminPageHeader,
  AdminStatCard,
  AdminTable,
} from "@/components/admin/admin-shell";
import { formatNok } from "@/features/cars/data/nordic-cars";
import { getAdminAnalytics } from "@/lib/admin/services";

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalytics();

  return (
    <>
      <AdminPageHeader
        description="Monitor inventory quality, publishing activity, media coverage, and operational health."
        eyebrow="Overview"
        title="NordicDrive control center"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <AdminStatCard
          detail="Live catalog entries"
          icon={CarFront}
          label="Cars"
          value={`${analytics.counts.cars}`}
        />
        <AdminStatCard
          detail="Active OEMs"
          icon={Boxes}
          label="Brands"
          value={`${analytics.counts.brands}`}
        />
        <AdminStatCard
          detail="Future models"
          icon={Megaphone}
          label="Launches"
          value={`${analytics.counts.launches}`}
        />
        <AdminStatCard
          detail="Editorial pages"
          icon={BookOpenText}
          label="Articles"
          value={`${analytics.counts.articles}`}
        />
        <AdminStatCard
          detail="Assets stored"
          icon={Image}
          label="Media"
          value={`${analytics.counts.media}`}
        />
        <AdminStatCard
          detail="Accounts"
          icon={UsersRound}
          label="Users"
          value={`${analytics.counts.users}`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminBarChart values={analytics.chart} />
        <AdminTable
          columns={["Car", "Brand", "From", "Status"]}
          rows={analytics.recentCars.map((car) => [
            <span className="font-semibold" key="car">
              {car.name}
            </span>,
            car.brand?.name ?? "Unknown brand",
            car.priceFromNok ? formatNok(car.priceFromNok) : "Not set",
            <span
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold"
              key="status"
            >
              {car.status}
            </span>,
          ])}
        />
      </div>
    </>
  );
}
