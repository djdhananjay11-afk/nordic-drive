import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { apiData, requireAdminPermission } from "@/lib/admin/route-helpers";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["model/gltf-binary", "glb"],
  ["model/gltf+json", "gltf"],
]);

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("create", "media");
  if ("error" in authResult) return authResult.error;

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: { code: "FILE_REQUIRED", message: "Upload file is required" } }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: { code: "FILE_TOO_LARGE", message: "Upload limit is 25 MB" } }, { status: 413 });
  }

  const extension = allowedTypes.get(file.type) ?? inferExtension(file.name);

  if (!extension || !["jpg", "jpeg", "png", "webp", "glb", "gltf"].includes(extension)) {
    return NextResponse.json(
      { error: { code: "UNSUPPORTED_FILE", message: "Only JPG, PNG, WEBP, GLB, and GLTF files are supported" } },
      { status: 415 },
    );
  }

  const id = randomUUID();
  const filename = `${id}.${extension}`;
  const relativeUrl = `/uploads/admin/${filename}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "admin");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  const media = await prisma.media.create({
    data: {
      type: extension === "glb" || extension === "gltf" ? "MODEL_3D" : "IMAGE",
      url: relativeUrl,
      title: file.name,
      altText: file.name.replace(/\.[^.]+$/, ""),
    },
  });

  return apiData(media, { status: 201 });
}

function inferExtension(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension;
}
