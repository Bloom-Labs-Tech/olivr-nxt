import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DISCORD_TOKEN: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    DEVELOPMENT_GUILD_ID: z.string().optional(),
    IS_DEVELOPMENT: z.boolean({ coerce: true }),
    PORT: z.number({ coerce: true }),
    BASE_URL: z.string(),
    DASHBOARD_URL: z.string(),
    HDEV_API_KEY: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.number({ coerce: true }),
    REDIS_PASSWORD: z.string(),
    REDIS_DB: z.number({ coerce: true }),
    AUTH_SECRET: z.string(),
  },
  runtimeEnv: process.env,
});