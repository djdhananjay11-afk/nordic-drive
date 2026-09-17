import Link from "next/link";
import { Plus, Pencil, Search, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCarInventory } from "@/lib/admin/car-service";
import { requireOwnerPage } from "@/lib/admin/owner-page";
import { formatNok } from "@/features/cars/data/nordic-cars";

export default async function AdminCarsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireOwnerPage();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 120).trim() : "";
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1));
  const inventory = await getCarInventory(query, page);
  return <div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-semibold">Cars <span className="text-base font-normal text-slate-500">({inventory.total})</span></h1><Button asChild className="bg-slate-950 text-white"><Link href="/admin/cars/new"><Plus className="mr-2 size-4" />Add car</Link></Button></div>
    <form className="my-6 flex max-w-lg gap-2" action="/admin/cars"><label className="sr-only" htmlFor="car-search">Search cars</label><input id="car-search" name="q" defaultValue={query} maxLength={120} placeholder="Search by model or brand" className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm" /><Button type="submit" variant="outline" aria-label="Search"><Search className="size-4" /></Button></form>
    {inventory.cars.length === 0 ? <p role="status" className="border-y border-slate-200 py-12 text-slate-600">{query ? "No matching cars." : "No cars have been added to the database yet."}</p> : <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[600px] text-left text-sm"><caption className="sr-only">Database car inventory</caption><thead className="bg-slate-50 text-slate-600"><tr>{["Model", "Brand", "Variants", "Price from", "Status", "Actions"].map(label => <th scope="col" className="px-4 py-3 font-medium" key={label}>{label}</th>)}</tr></thead>
        <tbody>{inventory.cars.map(car => <tr key={car.id} className="border-t border-slate-100"><th scope="row" className="px-4 py-4 font-semibold"><Link href={`/admin/cars/${car.id}`} className="text-sky-800 underline-offset-4 hover:underline">{car.name}</Link></th><td className="px-4 py-4">{car.brand.name}</td><td className="px-4 py-4">{car._count.variants}</td><td className="px-4 py-4">{car.priceFromNok === null ? "Unknown" : formatNok(car.priceFromNok)}</td><td className="px-4 py-4">{car.status.toLowerCase()}</td><td className="px-4 py-4"><Link href={`/admin/cars/${car.id}`} aria-label={`Edit ${car.brand.name} ${car.name}`} className="inline-flex size-11 items-center justify-center rounded-md hover:bg-slate-100" title="Edit car"><Pencil className="size-4" /></Link></td></tr>)}</tbody>
      </table></div>}
    <nav aria-label="Inventory pagination" className="mt-5 flex items-center justify-between gap-3 text-sm">
      {page > 1 ? <Link href={`/admin/cars?q=${encodeURIComponent(query)}&page=${page - 1}`} className="inline-flex min-h-11 items-center gap-2"><ArrowLeft className="size-4" />Previous</Link> : <span />}
      <span>Page {page} of {inventory.pages}</span>
      {page < inventory.pages ? <Link href={`/admin/cars?q=${encodeURIComponent(query)}&page=${page + 1}`} className="inline-flex min-h-11 items-center gap-2">Next<ArrowRight className="size-4" /></Link> : <span />}
    </nav>
  </div>;
}
