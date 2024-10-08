import { OliverBot } from "./olivrClient";

export * from "@sapphire/discord.js-utilities";
export * from "./olivrClient";
export * from "./olivrCommand";
export * from "./olivrEvent";
export * from "./olivrMiddleware";

export const client = OliverBot.getInstance();