import { z } from "zod";
import { metricLabels, type CatalogueVehicle } from "@nordicdrive/database/catalogue";

const text = z.string().trim().min(1).max(2000);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(160);
const localized = z.object({ no: text, en: text });
const https = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  });
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().startsWith(value) &&
      value <= new Date().toISOString().slice(0, 10)
    );
  });
const fact = z.object({
  value: z.union([z.number().finite().positive(), text]),
  unit: z.string().max(30),
  source: z.number().int().nonnegative(),
  note: localized.optional(),
});
const publication = z
  .object({
    id: slug,
    brand: text,
    brandSlug: slug,
    model: text,
    slug,
    variant: text,
    checkedOn: date,
    sources: z
      .array(z.object({ title: text, url: https }))
      .min(1)
      .max(30),
    galleryUrl: https,
    facts: z.record(fact),
    image: z
      .object({
        path: z.string().regex(/^\/(?!\/)[a-zA-Z0-9/_-]+\.(avif|webp|png|jpe?g)$/),
        alt: localized,
        permissionReference: text,
        checkedOn: date,
      })
      .nullable(),
  })
  .strict()
  .superRefine((vehicle, context) => {
    for (const [key, value] of Object.entries(vehicle.facts)) {
      if (!Object.hasOwn(metricLabels, key) || value.source >= vehicle.sources.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid metric or source reference",
        });
      }
    }
  });

export function parsePublication(payload: unknown, recordKey: string): CatalogueVehicle | null {
  const parsed = publication.safeParse(payload);
  if (!parsed.success || parsed.data.id !== recordKey) return null;
  return parsed.data as CatalogueVehicle;
}
