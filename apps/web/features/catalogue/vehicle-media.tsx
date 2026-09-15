"use client";
import Image from "next/image";
import { ExternalLink, ImageOff } from "lucide-react";
import { useState } from "react";
import type { CatalogueLocale, CatalogueVehicle } from "@nordicdrive/database/catalogue";
import { catalogueCopy } from "./copy";

export function CatalogueMedia({
  vehicle,
  locale,
}: {
  vehicle: CatalogueVehicle;
  locale: CatalogueLocale;
}) {
  const [failed, setFailed] = useState(false);
  const copy = catalogueCopy[locale];
  const asset = vehicle.image;
  return (
    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg bg-zinc-100 p-6 text-center">
      {asset && asset.permissionReference && !failed ? (
        <Image
          src={asset.path}
          alt={asset.alt[locale]}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex max-w-xs flex-col items-center gap-3">
          <ImageOff aria-hidden="true" className="size-6 text-zinc-400" />
          <p className="text-sm text-zinc-600">{copy.missingPhoto}</p>
          <a
            href={vehicle.galleryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-emerald-800 underline underline-offset-4"
          >
            {copy.photos}
            <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          </a>
        </div>
      )}
    </div>
  );
}
