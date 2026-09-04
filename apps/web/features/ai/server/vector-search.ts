import { createOpenAIEmbedding } from "@/features/ai/server/openai-client";
import { getVehicleDocuments, type VehicleDocument } from "@/features/ai/server/vehicle-documents";

export type SemanticSearchResult = {
  document: VehicleDocument;
  score: number;
  reason: string;
};

const vectorDimensions = 96;

export async function semanticVehicleSearch(query: string, limit = 5): Promise<SemanticSearchResult[]> {
  const documents = getVehicleDocuments();
  const openAIEmbedding = await createOpenAIEmbedding(query);

  if (openAIEmbedding) {
    return rankWithEmbedding(query, documents, openAIEmbedding, limit);
  }

  const queryVector = createLocalEmbedding(query);

  return documents
    .map((document) => {
      const documentVector = createLocalEmbedding(document.text);
      const score = cosineSimilarity(queryVector, documentVector) * 0.72 + keywordScore(query, document) * 0.28;

      return {
        document,
        reason: createMatchReason(query, document),
        score: Math.round(score * 1000) / 1000,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

async function rankWithEmbedding(
  query: string,
  documents: VehicleDocument[],
  queryEmbedding: number[],
  limit: number,
): Promise<SemanticSearchResult[]> {
  const embeddedDocuments = await Promise.all(
    documents.map(async (document) => ({
      document,
      embedding: (await createOpenAIEmbedding(document.text)) ?? createLocalEmbedding(document.text, queryEmbedding.length),
    })),
  );

  return embeddedDocuments
    .map(({ document, embedding }) => {
      return {
        document,
        reason: createMatchReason(query, document),
        score: Math.round(cosineSimilarity(queryEmbedding, embedding) * 1000) / 1000,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function createLocalEmbedding(input: string, dimensions = vectorDimensions) {
  const vector = new Array<number>(dimensions).fill(0);

  for (const token of tokenize(input)) {
    const index = hashToken(token) % dimensions;
    vector[index] = (vector[index] ?? 0) + (token.length > 6 ? 1.35 : 1);
  }

  return normalize(vector);
}

export function cosineSimilarity(left: number[], right: number[]) {
  const length = Math.min(left.length, right.length);
  let total = 0;

  for (let index = 0; index < length; index += 1) {
    total += (left[index] ?? 0) * (right[index] ?? 0);
  }

  return total;
}

function keywordScore(query: string, document: VehicleDocument) {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return 0;
  }

  const haystack = `${document.text} ${document.tags.join(" ")}`.toLowerCase();
  const matches = tokens.filter((token) => haystack.includes(token));
  return matches.length / tokens.length;
}

function createMatchReason(query: string, document: VehicleDocument) {
  const queryTokens = tokenize(query);
  const matchingTags = document.tags.filter((tag) => {
    const normalizedTag = tag.toLowerCase();
    return queryTokens.some((token) => normalizedTag.includes(token));
  });

  if (matchingTags.length > 0) {
    return `Matched ${matchingTags.slice(0, 3).join(", ")}.`;
  }

  return `Matched range, price, charging, and ownership signals for ${document.title}.`;
}

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9æøå]+/gi, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function hashToken(token: string) {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function normalize(vector: number[]) {
  const magnitude = Math.sqrt(vector.reduce((total, value) => total + value * value, 0));
  if (magnitude === 0) {
    return vector;
  }
  return vector.map((value) => value / magnitude);
}
