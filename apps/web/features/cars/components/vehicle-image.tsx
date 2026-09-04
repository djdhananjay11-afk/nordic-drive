"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [hasImageError, setHasImageError] = useState(false);
  const imageAsset = getCarImageAsset(car);
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
      <div className="absolute inset-x-8 bottom-7 h-16 rounded-[50%] bg-slate-950/15 blur-2xl" />
      {!hasImageError ? (
        <Image
          alt={imageAlt}
          className={cn(
            "object-cover object-center transition duration-700 group-hover:scale-[1.04]",
            imageClassName,
          )}
          fill
          onError={() => setHasImageError(true)}
          placeholder="blur"
          priority={priority}
          quality={82}
          blurDataURL={blurDataUrl}
          sizes={sizes}
          src={imageAsset.url}
        />
      ) : (
        <FallbackVehicleShape />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/14 to-transparent" />
      {matchLabel && !hasImageError ? (
        <span className="absolute bottom-2 left-2 max-w-[46%] truncate rounded bg-slate-950/70 px-2 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
          {matchLabel}
        </span>
      ) : null}
      {missingLicensedMedia ? (
        <span className="absolute bottom-2 right-2 max-w-[52%] truncate rounded bg-white/85 px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur">
          Add CMS media
        </span>
      ) : null}
      {media && !hasImageError ? (
        <span
          className="absolute bottom-2 right-2 max-w-[46%] truncate rounded bg-white/80 px-2 py-1 text-[10px] font-medium text-slate-600 opacity-80 shadow-sm backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100"
          title={`${media.providerName}${media.sourceUrl ? ` / ${media.sourceUrl}` : ""}`}
        >
          {media.providerName}
        </span>
      ) : null}
    </div>
  );
}

function FallbackVehicleShape() {
  return (
    <>
      <div className="absolute inset-x-8 bottom-14 h-12 rounded-t-[70px] border border-white/80 bg-white/76 shadow-xl" />
      <div className="absolute left-[36%] right-[38%] bottom-[92px] h-10 rounded-t-[70px] border border-white/80 bg-white/88" />
      <div className="absolute bottom-9 left-12 size-12 rounded-full border-[8px] border-slate-950 bg-slate-200" />
      <div className="absolute bottom-9 right-12 size-12 rounded-full border-[8px] border-slate-950 bg-slate-200" />
      <div className="absolute inset-x-6 bottom-8 h-px bg-gradient-to-r from-transparent via-slate-400/80 to-transparent" />
    </>
  );
}
