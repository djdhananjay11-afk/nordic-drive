import type { FactField } from "./fields.js";

export type SourceStatus = "CONTENT_READ" | "EXTRACTION_BLOCKED" | "NORWAY_UNCONFIRMED";

export interface BrandSource {
  slug: string;
  name: string;
  url: string;
  status: SourceStatus;
  notes: string;
}

export interface Fact {
  field: FactField;
  value: number | string | boolean;
  unit: string;
  scope: "MODEL" | "VARIANT";
  basis: "STATED" | "FROM" | "UP_TO" | "PRELIMINARY";
  qualification: string;
}

export interface MediaCandidate {
  url: string;
  sourceUrl: string;
  subject: string;
  rightsStatus: "UNVERIFIED";
  visualStatus: "NOT_INSPECTED";
  availability: "NOT_CHECKED" | "FETCH_FAILED";
}

export interface EvidenceRecord {
  key: string;
  brandSlug: string;
  sourceUrl: string;
  modelName?: string;
  variantName?: string;
  observedOn: string;
  facts: Fact[];
  media: MediaCandidate[];
  warnings: string[];
}

export interface EvidenceBatch {
  schemaVersion: 1;
  id: string;
  observedOn: string;
  market: "NO";
  completeness: "PARTIAL";
  sources: BrandSource[];
  records: EvidenceRecord[];
}
