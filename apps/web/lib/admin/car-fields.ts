export type EditorField = { key: string; label: string; type?: "number" | "textarea" | "checkbox" | "url" | "json"; options?: readonly string[]; required?: boolean; step?: string };
const field = (key: string, label: string, type?: EditorField["type"], required?: boolean): EditorField => ({ key, label, type, required });
const choice = (key: string, label: string, options: string[]): EditorField => ({ key, label, options, required: true });
export const carFields: EditorField[] = [
  field("name", "Model name", undefined, true), field("slug", "URL slug", undefined, true), field("displayName", "Display name"),
  field("tagline", "Tagline"), field("description", "Description", "textarea"),
  choice("status", "Availability", ["AVAILABLE", "UPCOMING", "DISCONTINUED"]),
  choice("bodyType", "Body type", ["SUV", "SEDAN", "CROSSOVER", "WAGON", "HATCHBACK", "COUPE", "VAN"]),
  field("segment", "Market segment", undefined, true), field("modelYear", "Model year", "number"),
  field("heroImageUrl", "Hero image URL", "url"), field("priceFromNok", "Starting price (NOK)", "number"), field("monthlyFromNok", "Monthly estimate (NOK)", "number"),
];
export const seoFields: EditorField[] = [field("seoTitle", "SEO title"), field("seoDescription", "SEO description", "textarea"), field("canonicalUrl", "Canonical URL", "url")];
export const specificationFields: EditorField[] = [
  field("lengthMm", "Length (mm)", "number"), field("widthMm", "Width (mm)", "number"), field("heightMm", "Height (mm)", "number"), field("wheelbaseMm", "Wheelbase (mm)", "number"),
  field("bootSpaceLiters", "Boot space (litres)", "number"), field("frunkLiters", "Frunk (litres)", "number"), field("seats", "Seats", "number"), field("weightKg", "Weight (kg)", "number"),
  field("towingCapacityKg", "Towing capacity (kg)", "number"), field("groundClearanceMm", "Ground clearance (mm)", "number"),
  field("warrantyYears", "Vehicle warranty (years)", "number"), field("batteryWarrantyKm", "Battery warranty (km)", "number"), field("batteryWarrantyYears", "Battery warranty (years)", "number"),
  field("payload", "Additional specifications / source notes (JSON)", "json"),
];
export const variantFields: EditorField[] = [
  field("name", "Variant name", undefined, true), field("slug", "Variant URL slug", undefined, true),
  choice("status", "Availability", ["AVAILABLE", "ORDER_OPEN", "WAITLIST", "SOLD_OUT", "DISCONTINUED"]), choice("drivetrain", "Drivetrain", ["FWD", "RWD", "AWD"]),
  field("priceNok", "Price (NOK)", "number", true), field("monthlyEstimateNok", "Monthly estimate (NOK)", "number"),
  { ...field("batteryCapacityKwh", "Battery capacity (kWh)", "number", true), step: "0.01" },
  field("rangeWltpKm", "WLTP range (km)", "number", true), field("rangeWinterEstimateKm", "Winter range estimate (km)", "number"),
  field("powerHp", "Power (hp)", "number"), field("torqueNm", "Torque (Nm)", "number"), { ...field("acceleration0To100", "0-100 km/h (seconds)", "number"), step: "0.01" },
  field("topSpeedKmh", "Top speed (km/h)", "number"), { ...field("chargingAcKw", "AC charging (kW)", "number"), step: "0.01" }, { ...field("chargingDcKw", "DC charging (kW)", "number"), step: "0.01" },
  field("charging10To80Minutes", "10-80% charging (minutes)", "number"), field("heatPump", "Heat pump", "checkbox"), choice("plugType", "Charging connector", ["CCS", "TYPE_2", "CHADEMO", "NACS"]),
  field("seats", "Seats", "number"), field("towingCapacityKg", "Towing capacity (kg)", "number"),
];
export const chargingFields: EditorField[] = [field("batteryPreconditioning", "Battery preconditioning", "checkbox"), field("vehicleToLoad", "Vehicle-to-load", "checkbox"), field("batteryChemistry", "Battery chemistry"), field("chargingCurveNote", "Charging conditions / curve notes", "textarea")];
export const featureFields: EditorField[] = [field("name", "Feature name", undefined, true), field("slug", "Feature slug", undefined, true), choice("category", "Category", ["SAFETY", "COMFORT", "PERFORMANCE", "CHARGING", "INTERIOR", "EXTERIOR", "SOFTWARE", "WINTER"]), field("description", "Description", "textarea"), field("iconName", "Icon name"), field("isHighlighted", "Highlighted", "checkbox"), field("sortOrder", "Display order", "number")];
export const mediaFields: EditorField[] = [choice("type", "Media type", ["IMAGE", "VIDEO", "MODEL_3D", "DOCUMENT"]), field("url", "Asset URL", "url", true), field("title", "Title / credit"), field("altText", "Alternative text"), field("width", "Width (px)", "number"), field("height", "Height (px)", "number"), field("blurDataUrl", "Raster blur data URL", "textarea"), field("sortOrder", "Display order", "number"), field("isPrimary", "Primary asset", "checkbox")];
