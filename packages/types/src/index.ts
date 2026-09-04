export type UserRole = "super_admin" | "editor" | "content_manager" | "user";

export type PermissionAction = "create" | "read" | "update" | "delete" | "manage";

export type PermissionSubject =
  | "all"
  | "admin"
  | "analytics"
  | "article"
  | "brand"
  | "car"
  | "launch"
  | "media"
  | "review"
  | "savedComparison"
  | "user"
  | "wishlist";

export type CarStatus = "AVAILABLE" | "UPCOMING" | "DISCONTINUED";

export type Drivetrain = "FWD" | "RWD" | "AWD";

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface BrandSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface CarModelSummary {
  id: string;
  brand: BrandSummary;
  name: string;
  slug: string;
  segment: string;
  bodyType: string;
  status: CarStatus;
  heroImageUrl?: string | null;
}

export interface CarVariantSummary {
  id: string;
  modelId: string;
  name: string;
  drivetrain: Drivetrain;
  rangeWltpKm: number;
  batteryCapacityKwh: number;
  priceNok: number;
}
