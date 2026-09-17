import { CarEditor } from "@/components/admin/car-editor";
import { prisma } from "@/lib/db";
import { requireOwnerPage } from "@/lib/admin/owner-page";

export default async function NewCarPage() {
  await requireOwnerPage();
  const brands = await prisma.brand.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  return <CarEditor brands={brands} />;
}
