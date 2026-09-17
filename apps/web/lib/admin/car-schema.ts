import { z } from "zod";

const optionalText = (max = 2000) => z.string().trim().max(max).nullable().optional().transform(value => value || null);
const integer = (max: number, min = 0) => z.number().int().min(min).max(max).nullable().optional().transform(value => value ?? null);
const decimal = (max: number) => z.number().finite().min(0).max(max).multipleOf(0.01).nullable().optional().transform(value => value ?? null);
const slug = z.string().trim().min(1).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const mediaUrl = z.string().max(2048).refine(value => {
  if (/^\/(?!\/)[a-zA-Z0-9/_%.-]+$/.test(value) && !value.includes("..")) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}, "Use an HTTPS URL or a local asset path.");
const optionalUrl = mediaUrl.nullable().optional().or(z.literal("")).transform(value => value || null);

export const specificationSchema = z.object({
  lengthMm: integer(50000), widthMm: integer(10000), heightMm: integer(10000), wheelbaseMm: integer(30000),
  bootSpaceLiters: integer(20000), frunkLiters: integer(5000), seats: integer(100, 1), weightKg: integer(50000),
  towingCapacityKg: integer(50000), groundClearanceMm: integer(2000), warrantyYears: integer(30),
  batteryWarrantyKm: integer(2000000), batteryWarrantyYears: integer(30),
  payload: z.record(z.unknown()).nullable().optional(),
}).strict();

export const featureSchema = z.object({
  name: z.string().trim().min(1).max(120), slug,
  category: z.enum(["SAFETY", "COMFORT", "PERFORMANCE", "CHARGING", "INTERIOR", "EXTERIOR", "SOFTWARE", "WINTER"]),
  description: optionalText(), iconName: optionalText(80), isHighlighted: z.boolean().default(false), sortOrder: z.number().int().min(0).max(1000).default(0),
}).strict();

export const mediaSchema = z.object({
  id: z.string().uuid().optional(), type: z.enum(["IMAGE", "VIDEO", "MODEL_3D", "DOCUMENT"]), url: mediaUrl,
  title: optionalText(160), altText: optionalText(500), width: integer(30000, 1), height: integer(30000, 1),
  blurDataUrl: z.string().max(20000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/).nullable().optional().or(z.literal("")).transform(value => value || null),
  sortOrder: z.number().int().min(0).max(1000).default(0), isPrimary: z.boolean().default(false),
}).strict().superRefine((value, context) => {
  if (value.type === "IMAGE" && !value.altText) context.addIssue({ code: "custom", path: ["altText"], message: "Alternative text is required for images." });
});
const features = z.array(featureSchema).max(100).default([]).refine(items => new Set(items.map(item => item.slug)).size === items.length, "Feature slugs must be unique.");
const media = z.array(mediaSchema).max(50).default([]).refine(items => items.filter(item => item.isPrimary).length <= 1, "Choose at most one primary media item.");
export const chargingSchema = z.object({
  batteryPreconditioning: z.boolean().default(false), vehicleToLoad: z.boolean().default(false),
  batteryChemistry: optionalText(120), chargingCurveNote: optionalText(4000),
}).strict();
export const variantSchema = z.object({
  id: z.string().uuid().optional(), name: z.string().trim().min(1).max(160), slug,
  status: z.enum(["AVAILABLE", "ORDER_OPEN", "WAITLIST", "SOLD_OUT", "DISCONTINUED"]),
  drivetrain: z.enum(["FWD", "RWD", "AWD"]), priceNok: z.number().int().min(0).max(20000000), monthlyEstimateNok: integer(500000),
  batteryCapacityKwh: z.number().positive().max(9999).multipleOf(0.01), rangeWltpKm: z.number().int().positive().max(5000), rangeWinterEstimateKm: integer(5000),
  powerHp: integer(10000), torqueNm: integer(50000), acceleration0To100: decimal(99.99), topSpeedKmh: integer(600),
  chargingAcKw: decimal(999.99), chargingDcKw: decimal(9999), charging10To80Minutes: integer(1440, 1),
  heatPump: z.boolean(), plugType: z.enum(["CCS", "TYPE_2", "CHADEMO", "NACS"]), seats: integer(100, 1), towingCapacityKg: integer(50000),
  specification: specificationSchema, evCharging: chargingSchema, features, media,
}).strict();

export const carEditorSchema = z.object({
  brandId: z.string().uuid(), name: z.string().trim().min(1).max(120), slug,
  displayName: optionalText(160), tagline: optionalText(500), description: optionalText(20000),
  status: z.enum(["AVAILABLE", "UPCOMING", "DISCONTINUED"]),
  bodyType: z.enum(["SUV", "SEDAN", "CROSSOVER", "WAGON", "HATCHBACK", "COUPE", "VAN"]), segment: z.string().trim().min(1).max(120),
  modelYear: integer(2100, 1990), heroImageUrl: optionalUrl, priceFromNok: integer(20000000), monthlyFromNok: integer(500000),
  seoTitle: optionalText(160), seoDescription: optionalText(500), canonicalUrl: optionalUrl,
  specification: specificationSchema, variants: z.array(variantSchema).max(50), features, media,
}).strict().superRefine((value, context) => {
  if (new Set(value.variants.map(variant => variant.slug)).size !== value.variants.length)
    context.addIssue({ code: "custom", path: ["variants"], message: "Variant slugs must be unique within the car." });
  const ids = value.variants.flatMap(variant => variant.id ? [variant.id] : []);
  const mediaIds = [...value.media, ...value.variants.flatMap(variant => variant.media)].flatMap(item => item.id ? [item.id] : []);
  if (new Set(ids).size !== ids.length || new Set(mediaIds).size !== mediaIds.length)
    context.addIssue({ code: "custom", path: ["variants"], message: "Duplicate record IDs are not allowed." });
});
export const carSaveSchema = z.object({ updatedAt: z.string().datetime().optional(), car: carEditorSchema }).strict();
export type CarEditorInput = z.infer<typeof carEditorSchema>;
export type CarSaveInput = z.infer<typeof carSaveSchema>;
export type VariantEditorInput = z.infer<typeof variantSchema>;
export type FeatureEditorInput = z.infer<typeof featureSchema>;
export type MediaEditorInput = z.infer<typeof mediaSchema>;

export const editorBrandSchema = z.object({ name: z.string().trim().min(1).max(120), slug, country: optionalText(100), websiteUrl: optionalUrl }).strict();
