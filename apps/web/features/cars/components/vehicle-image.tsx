"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ImageOff } from "lucide-react";

import { getCarImageAsset, type NordicCar } from "@/features/cars/data/nordic-cars";
import { getCarMediaMatchLabel } from "@/features/cars/data/official-car-media";
import { cn } from "@/lib/utils";

const blurDataUrl =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTInIGhlaWdodD0nOCcgdmlld0JveD0nMCAwIDEyIDgnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzEyJyBoZWlnaHQ9JzgnIGZpbGw9JyNlMmU4ZjAnLz48cGF0aCBkPSdNMCA2QzIgNCA0IDMgNiAzczQgMSA2IDN2MkgwVjZaJyBmaWxsPScjOTRhM2IzJyBmaWxsLW9wYWNpdHk9Jy40Jy8+PC9zdmc+";

type VehicleImageProps = {
  car: NordicCar;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function VehicleImage({
  car,
  className,
  imageClassName,
  priority = false,
  sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
}: VehicleImageProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const norwegian = usePathname().startsWith("/no");
  const imageAsset = getCarImageAsset(car);
  const hasImageError = failedUrl === imageAsset.url;
  const media = imageAsset.media;
  const matchLabel = getCarMediaMatchLabel(media);
  const missingLicensedMedia = !media && !car.imageUrl;
  const imageAlt =
    matchLabel && media?.representedModel
      ? `${media.representedModel} official vehicle media used as a visual reference for ${car.brand} ${car.model}`
      : (car.imageAlt ?? `${car.brand} ${car.model} electric car`);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-gradient-to-br",
        car.colorClass,
        className,
      )}
    >
      {!hasImageError && !missingLicensedMedia ? (
        <Image
          alt={imageAlt}
          className={cn(
            "object-cover object-center transition duration-700 group-hover:scale-[1.04]",
            imageClassName,
          )}
          fill
          onError={() => setFailedUrl(imageAsset.url)}
          placeholder="blur"
          priority={priority}
          quality={82}
          blurDataURL={blurDataUrl}
          sizes={sizes}
          src={imageAsset.url}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-100 p-5 text-center text-zinc-600">
          <ImageOff aria-hidden="true" className="size-7" />
          <span className="text-sm font-medium">
            {norwegian ? "Foto ikke tilgjengelig" : "Photo not available"}
          </span>
          <span className="text-xs">
            {car.brand} {car.model}
          </span>
        </div>
      )}
      {matchLabel && !hasImageError ? (
        <span className="absolute bottom-2 left-2 max-w-[46%] truncate rounded bg-slate-950/70 px-2 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
          {matchLabel}
        </span>
      ) : null}
      {media && !hasImageError ? (
        <span
          className="absolute bottom-2 right-2 max-w-[46%] truncate rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700 shadow-sm"
          title={`${media.providerName}${media.sourceUrl ? ` / ${media.sourceUrl}` : ""}`}
        >
          {media.providerName}
        </span>
      ) : null}
    </div>
  );
}
