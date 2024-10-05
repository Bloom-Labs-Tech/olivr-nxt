import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DISCORD_TOKEN: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    DEVELOPMENT_GUILD_ID: z.string().optional(),
    IS_DEVELOPMENT: z.boolean({ coerce: true }),
    HDEV_API_KEY: z.string(),
  },
  runtimeEnv: process.env,
});