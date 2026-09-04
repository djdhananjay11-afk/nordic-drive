import { z } from "zod";

const nullableText = z.string().trim().min(1).optional().nullable();

export const brandSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  country: nullableText,
  websiteUrl: z.string().url().optional().nullable(),
  description: nullableText,
  seoTitle: nullableText,
  seoDescription: nullableText,
  isActive: z.boolean().default(true),
});

export const carSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  tagline: nullableText,
  description: nullableText,
  status: z.enum(["AVAILABLE", "UPCOMING", "DISCONTINUED"]).default("AVAILABLE"),
  bodyType: z.enum(["SUV", "SEDAN", "CROSSOVER", "WAGON", "HATCHBACK", "COUPE", "VAN"]),
  segment: z.string().trim().min(2).max(120),
  modelYear: z.coerce.number().int().min(1990).max(2100).optional().nullable(),
  priceFromNok: z.coerce.number().int().min(0).optional().nullable(),
  monthlyFromNok: z.coerce.number().int().min(0).optional().nullable(),
  seoTitle: nullableText,
  seoDescription: nullableText,
});

export const launchSchema = z.object({
  brandId: z.string().uuid(),
  carId: z.string().uuid().optional().nullable(),
  modelName: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  expectedLaunchDate: z.coerce.date().optional().nullable(),
  estimatedPriceFromNok: z.coerce.number().int().min(0).optional().nullable(),
  status: z.enum(["RUMORED", "CONFIRMED", "DELAYED", "LAUNCHED", "CANCELLED"]).default("RUMORED"),
  confidenceLevel: z.coerce.number().int().min(0).max(100).default(50),
  sourceNote: nullableText,
  seoTitle: nullableText,
  seoDescription: nullableText,
});

export const articleSchema = z.object({
  authorId: z.string().uuid(),
  title: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: nullableText,
  content: z.string().trim().min(10),
  category: z.string().trim().min(2).max(80),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: nullableText,
  seoDescription: nullableText,
  publishedAt: z.coerce.date().optional().nullable(),
});

export const userRoleSchema = z.object({
  roleId: z.string().uuid(),
});

export type BrandInput = z.infer<typeof brandSchema>;
export type CarInput = z.infer<typeof carSchema>;
export type LaunchInput = z.infer<typeof launchSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
