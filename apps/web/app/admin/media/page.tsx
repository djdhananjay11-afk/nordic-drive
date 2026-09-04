import { Upload } from "lucide-react";

import { AdminPageHeader, AdminTable } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { listAdminMedia } from "@/lib/admin/services";

export default async function AdminMediaPage() {
  const media = await listAdminMedia();

  return (
    <>
      <AdminPageHeader
        description="Upload and manage optimized imagery, video, and GLB/GLTF 3D assets for premium car pages."
        eyebrow="Assets"
        title="Media & 3D"
      />
      <form
        action="/api/admin/uploads"
        className="mb-6 rounded-lg border border-dashed border-slate-300 bg-white p-6 shadow-sm"
        encType="multipart/form-data"
        method="post"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Upload image or 3D asset</h2>
            <p className="mt-1 text-sm text-slate-500">Supported: JPG, PNG, WEBP, GLB, GLTF. Max 25 MB.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input className="text-sm" name="file" required type="file" />
            <Button className="bg-slate-950 text-white hover:bg-slate-800" type="submit">
              <Upload className="mr-2 size-4" />
              Upload
            </Button>
          </div>
        </div>
      </form>
      <AdminTable
        columns={["Asset", "Type", "Linked to", "Primary", "Updated"]}
        rows={media.map((asset) => [
          <span className="font-semibold" key="asset">{asset.altText ?? asset.title ?? asset.url}</span>,
          asset.type,
          asset.car?.name ?? asset.brand?.name ?? asset.article?.title ?? asset.launch?.modelName ?? "Unassigned",
          asset.isPrimary ? "Yes" : "No",
          asset.updatedAt.toLocaleDateString("nb-NO"),
        ])}
      />
    </>
  );
}
