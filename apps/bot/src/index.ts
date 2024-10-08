import { Font } from "canvacord";
import app from "./api";
import { OliverBot } from "./client/olivrClient";
import { env } from "./env";

Font.loadDefault();

export const client = OliverBot.getInstance();
await client.init();

export default {
  fetch: app.fetch,
  port: env.PORT,
}