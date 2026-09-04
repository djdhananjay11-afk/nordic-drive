type OpenAIResponseOptions = {
  system: string;
  user: string;
  maxOutputTokens?: number;
};

type OpenAIResponsesPayload = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

type OpenAIEmbeddingPayload = {
  data?: Array<{
    embedding?: number[];
  }>;
};

const openAiBaseUrl = "https://api.openai.com/v1";

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function generateOpenAIText({ maxOutputTokens = 900, system, user }: OpenAIResponseOptions) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${openAiBaseUrl}/responses`, {
    body: JSON.stringify({
      input: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: user,
        },
      ],
      max_output_tokens: maxOutputTokens,
      model: process.env.OPENAI_MODEL ?? "gpt-5.6-luna",
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as OpenAIResponsesPayload;
  return extractResponseText(payload);
}

export async function generateOpenAIJson<T>(options: OpenAIResponseOptions, fallback: T): Promise<T> {
  const text = await generateOpenAIText({
    ...options,
    user: `${options.user}\n\nReturn only valid JSON. No markdown fences.`,
  });

  if (!text) {
    return fallback;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export async function createOpenAIEmbedding(input: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${openAiBaseUrl}/embeddings`, {
    body: JSON.stringify({
      input,
      model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as OpenAIEmbeddingPayload;
  return payload.data?.[0]?.embedding ?? null;
}

function extractResponseText(payload: OpenAIResponsesPayload) {
  if (payload.output_text) {
    return payload.output_text;
  }

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ?? null
  );
}
