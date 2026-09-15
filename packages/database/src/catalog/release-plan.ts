import { createHash } from "node:crypto";
import { canonicalJson } from "./plan.js";
import { releaseId, releaseVehicles } from "./release.js";

export function releaseRows() {
  return releaseVehicles.map((vehicle) => ({
    contentHash: createHash("sha256").update(canonicalJson({ releaseId, vehicle })).digest("hex"),
    recordKey: vehicle.id,
    batchId: releaseId,
    brandSlug: vehicle.brandSlug,
    modelName: vehicle.model,
    variantName: vehicle.variant,
    market: "NO",
    observedOn: new Date(`${vehicle.checkedOn}T00:00:00Z`),
    sourceUrl: vehicle.sources[0]!.url,
    payload: JSON.parse(JSON.stringify(vehicle)) as object,
  }));
}
