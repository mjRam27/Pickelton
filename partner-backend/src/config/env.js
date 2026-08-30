import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8090),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: z.enum(["true", "false"]).default("false"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("15m"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3001"),
  LOG_LEVEL: z.string().default("info"),
  SUPABASE_URL: z.preprocess((value) => value || undefined, z.string().url().optional()),
  SUPABASE_ANON_KEY: z.preprocess((value) => value || undefined, z.string().min(1).optional())
});

export const env = schema.parse(process.env);
export const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean);
