import { notFound } from "next/navigation";
import { z } from "zod";
import { CarEditor } from "@/components/admin/car-editor";
import { getCarEditor } from "@/lib/admin/car-service";
import { prisma } from "@/lib/db";
import { requireOwnerPage } from "@/lib/admin/owner-page";

export default async function EditCarPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireOwnerPage();
  const parsed = z.string().uuid().safeParse((await params).id);
  if (!parsed.success) notFound();
  const record = await getCarEditor(parsed.data);
  if (!record) notFound();
  const brands = await prisma.brand.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  return <CarEditor key={record.updatedAt} record={record} brands={brands} saved={(await searchParams).saved === "1"} />;
}
