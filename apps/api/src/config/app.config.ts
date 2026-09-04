import { registerAs } from "@nestjs/config";
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(24),
  JWT_ISSUER: z.string().default("nordicdrive"),
  JWT_AUDIENCE: z.string().default("nordicdrive-api"),
});

export function validateEnvironment(config: Record<string, unknown>) {
  const parsed = environmentSchema.safeParse(config);

  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }

  return parsed.data;
}

export const appConfig = registerAs("app", () => ({
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.API_PORT ?? 4000),
  webOrigin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  jwt: {
    secret: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER ?? "nordicdrive",
    audience: process.env.JWT_AUDIENCE ?? "nordicdrive-api",
  },
}));
