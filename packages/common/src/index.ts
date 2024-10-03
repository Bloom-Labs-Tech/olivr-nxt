import { z } from "zod";

export type Feature = "moderation" | "welcome" | "goodbye" | "autorole" | "logs" | "music" | "fun" | "utility" | "leveling" | "economy" | "tickets" | "announcement" | "events" | "generators" | "suggestions" | "security" | "counting";

const embedSchema = z.object({
  color: z.string(),
  title: z.string(),
  description: z.string(),
  footer: z.string(),
});

export const featuresSchema = z.object({
  announcement: z.object({
    enabled: z.boolean(),
    announcements: z.array(z.object({
      channelId: z.string(),
      message: z.string(),
      embed: embedSchema.optional(),
      date: z.string(), // ISO date string
    })),
  }),
  autorole: z.object({
    roles: z.array(z.object({
      id: z.string(),
      type: z.enum(["bot", "user"]),
    })),
  }),
  counting: z.object({
    channelId: z.string(),
    count: z.number(),
  }),
  economy: z.object({
    enabled: z.boolean(),
    currency: z.string(),
  }),
  events: z.object({
    enabled: z.boolean(),
    events: z.array(z.object({
      channelId: z.string(),
      message: z.string().optional(),
      embed: embedSchema.optional(),
      repeat: z.string().optional(), // Cron string
    })),
  }),
  fun: z.object({
    enabled: z.boolean(),
  }),
  generators: z.object({
    enabled: z.boolean(),
    password: z.boolean(),
    number: z.boolean(),
    dice: z.boolean(),
    coin: z.boolean()
  }),
  goodbye: z.object({
    enabled: z.boolean(),
    channelId: z.string(),
    message: z.string().optional(),
    embed: embedSchema.optional(),
  }),
  leveling: z.object({
    enabled: z.boolean(),
    roles: z.array(z.object({
      level: z.number(),
      roleId: z.string(),
    })),
  }),
  logs: z.object({
    enabled: z.boolean(),
    channelId: z.string(),
  }),
  moderation: z.object({
    enabled: z.boolean(),
    ban: z.boolean(),
    kick: z.boolean(),
    mute: z.boolean(),
    warn: z.boolean(),
    report: z.boolean(),
  }),
  music: z.object({
    enabled: z.boolean(),
    maxQueueLength: z.number(),
    djRoleId: z.string().optional(),
  }),
  security: z.object({
    enabled: z.boolean(),
    verification: z.object({
      enabled: z.boolean(),
      roleId: z.string(),
    }),
  }),
  suggestions: z.object({
    enabled: z.boolean(),
    voting: z.boolean()
  }),
  tickets: z.object({
    enabled: z.boolean(),
    categoryId: z.string(),
  }),
  utility: z.object({
    enabled: z.boolean(),
    translator: z.boolean(),
  }),
  welcome: z.object({
    enabled: z.boolean(),
    channelId: z.string(),
    message: z.string().optional(),
    embed: embedSchema.optional(),
  }),
});

const announcement = featuresSchema['announcement']

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
})

export const guildSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  memberCount: z.number(),
  features: featuresSchema,
  statistics: statisticsSchema,
});