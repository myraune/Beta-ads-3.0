import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  MAGIC_LINK_BASE_URL: z.string().url(),
  OVERLAY_URL: z.string().url(),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(2),
  S3_ACCESS_KEY: z.string().min(3),
  S3_SECRET_KEY: z.string().min(8),
  S3_BUCKET: z.string().min(3),
  S3_FORCE_PATH_STYLE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  API_PORT: z.coerce.number().default(4000)
});

export type AppEnv = z.infer<typeof envSchema>;

let parsedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (!parsedEnv) {
    parsedEnv = envSchema.parse(process.env);
  }

  return parsedEnv;
}
