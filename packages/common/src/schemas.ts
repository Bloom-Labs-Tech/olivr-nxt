import { $Enums } from "@olivr-nxt/database";
import { z } from "zod";
import { validateApiKey } from ".";

const embedSchema = z.object({
  color: z.string().refine((value) => /^#[0-9A-F]{6}$/i.test(value), { message: "Invalid hex color" }),
  title: z.string(),
  description: z.string(),
  footer: z.string(),
});

export const announcement = z.object({
  announcements: z.array(z.object({
    channelId: z.string(),
    message: z.string(),
    embed: embedSchema.optional(),
    date: z.date({ coerce: true }),
  })),
});

export const autorole = z.object({
  roles: z.array(z.object({
    id: z.string(),
    type: z.enum(["bot", "user"]),
  })),
});

export const counting = z.object({
  channelId: z.string(),
});

export const economy = z.object({
  currency: z.string(),
});

export const cronRegex = /^(\*|([0-5]?[0-9])([-/][0-9]+)?(,[0-5]?[0-9])*)\s(\*|([01]?[0-9]|2[0-3])([-/][0-9]+)?(,[01]?[0-9]|2[0-3])*)\s(\*|([012]?[0-9]|3[01])([-/][0-9]+)?(,[012]?[0-9]|3[01])*)\s(\*|(0?[1-9]|1[0-2])([-/][0-9]+)?(,(0?[1-9]|1[0-2]))*)\s(\*|([0-6])([-/][0-6])?(,[0-6])*)$/;
export const events = z.object({
  events: z.array(z.object({
    channelId: z.string(),
    message: z.string().optional(),
    embed: embedSchema.optional(),
    repeat: z.string().refine((value) => cronRegex.test(value), { message: "Invalid cron expression" }),
  })),
});

export const dynamicVoice = z.object({
  categoryId: z.string(),
  channelId: z.string(),
});

export const fun = z.object({});

export const generators = z.object({
  password: z.boolean(),
  number: z.boolean(),
  dice: z.boolean(),
  coin: z.boolean(),
});

export const goodbye = z.object({
  channelId: z.string(),
  message: z.string().optional(),
  embed: embedSchema.optional(),
});

export const leveling = z.object({
  channelId: z.string(),
  roles: z.array(z.object({
    level: z.number(),
    roleId: z.string(),
  })),
});

export const logs = z.object({
  channelId: z.string(),
});

export const moderation = z.object({
  ban: z.boolean(),
  kick: z.boolean(),
  mute: z.boolean(),
  warn: z.boolean(),
  report: z.boolean(),
});

export const music = z.object({
  maxQueueLength: z.number(),
  djRoleId: z.string().optional(),
});

export const security = z.object({
  verification: z.object({
    enabled: z.boolean(),
    roleId: z.string(),
  }),
});

export const suggestions = z.object({
  voting: z.boolean(),
});

export const tickets = z.object({
  categoryId: z.string(),
});

export const utility = z.object({
  translator: z.boolean(),
});

export const welcome = z.object({
  channelId: z.string(),
  message: z.string().optional(),
  embed: embedSchema.optional(),
});

export const featureWithEnabledSchema = <T extends z.ZodRawShape>(feature: z.ZodObject<T>) => z.object({
  enabled: z.boolean(),
  data: feature,
});

export const featureData = {
  moderation,
  welcome,
  goodbye,
  autorole,
  logs,
  music,
  fun,
  utility,
  leveling,
  economy,
  tickets,
  announcement,
  events,
  generators,
  suggestions,
  security,
  counting,
  dynamicVoice,
};

export const defaultFeatureData = {
  announcement: { announcements: [] },
  autorole: { roles: [] },
  counting: { channelId: "" },
  economy: { currency: "" },
  events: { events: [] },
  fun: {},
  generators: { password: false, number: false, dice: false, coin: false },
  goodbye: { channelId: "" },
  leveling: { roles: [] },
  logs: { channelId: "" },
  moderation: { ban: false, kick: false, mute: false, warn: false, report: false },
  music: { maxQueueLength: 0, djRoleId: "" },
  security: { verification: { enabled: false, roleId: "" } },
  suggestions: { voting: false },
  tickets: { categoryId: "" },
  utility: { translator: false },
  welcome: { channelId: "" },
  dynamicVoice: { categoryId: "", channelId: "" },
};

export const featuresSchema = Object.values(featureData).reduce((acc, feature) => {
  return acc.merge(featureWithEnabledSchema(feature));
}, z.object({}));

export const statisticsSchema = z.object({
  featureToggles: z.number(),
  messagesSent: z.number(),
  commandsUsed: z.number(),
  voiceConnections: z.number(),
  ticketsOpened: z.number(),
  ticketsClosed: z.number(),
  suggestions: z.number(),
  votesCast: z.number(),
  moderationActions: z.number(),
  reports: z.number(),
  warnings: z.number(),
  bans: z.number(),
  kicks: z.number(),
  mutes: z.number(),
  songsPlayed: z.number(),
  generatorsUsed: z.number(),
  usersJoined: z.number(),
  usersLeft: z.number(),
  xpEarned: z.number(),
  levelsGained: z.number(),
});

export const apiKeySchema = z.object({
  id: z.string(),
  key: z.string().refine(validateApiKey, { message: "Invalid API key" }),
  userId: z.string(),
  uses: z.number(),
  maxUses: z.number().optional(),
  active: z.boolean(),
  rateLimit: z.number(),
  createdAt: z.date({ coerce: true }),
  lastUsed: z.date({ coerce: true }),
  expiresAt: z.date({ coerce: true }).optional(),
});

export const ticketMessageSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.date({ coerce: true }),
});

export const ticketSchema = z.object({
  id: z.string(),
  userId: z.string(),
  channelId: z.string().optional(),
  guildId: z.string(),
  createdAt: z.date({ coerce: true }),
  claimedById: z.string().optional(),
  closedById: z.string().optional(),
  claimedAt: z.date({ coerce: true }).optional(),
  closedAt: z.date({ coerce: true }).optional(),
});

export const memberSchema = z.object({
  guildId: z.string(),
  userId: z.string(),
  xp: z.number(),
  xpCooldown: z.date({ coerce: true }),
});

export const valorantUserSchema = z.object({
  puuid: z.string(),
  region: z.nativeEnum($Enums.Region),
  platform: z.nativeEnum($Enums.Platform),
  userId: z.string(),
});

export const feedbackSchema = z.object({
  id: z.string(),
  userId: z.string(),
  content: z.string(),
  verified: z.boolean(),
  createdAt: z.date({ coerce: true }),
});

export const feedbackWithUserSchema = feedbackSchema.extend({
  user: z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string(),
  }),
});

export const addFeedbackSchema = z.object({
  content: z.string(),
  userId: z.string(),
});

export const updateFeedbackSchema = z.object({
  id: z.string(),
  content: z.string(),
});

export const verifyFeedbackSchema = z.object({
  id: z.string(),
  verified: z.boolean(),
});

export const deleteFeedbackSchema = z.string(); 

export const getFeedbackSchema = z.object({
  limit: z.number({ coerce: true }).optional().default(20),
  page: z.number({ coerce: true }).optional().default(0),
});