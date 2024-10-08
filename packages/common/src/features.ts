import { $Enums, Prisma, type PrismaClient } from "@olivr-nxt/database";
import type { z } from "zod";
import { validate } from ".";
import { defaultFeatureData, featureData } from "./schemas";

export type Feature = keyof typeof $Enums.Feature;

export async function getGuildFeature<N extends keyof typeof featureData>(db: PrismaClient | Prisma.TransactionClient, guildId: string, name: N) {
  const guildFeature = await db.guildFeature.upsert({
    where: { name_guildId: { name, guildId } },
    create: {
      name,
      guildId,
      data: defaultFeatureData[name],
    },
    update: {},
  });

  const data = validate(featureData[name], guildFeature.data) as z.infer<typeof featureData[N]>;

  return {
    enabled: guildFeature.enabled,
    data,
  }
}

export async function getGuildFeatures(db: PrismaClient | Prisma.TransactionClient, guildId: string) {
  // Fetch existing guild features from the database
  const guildFeatures = await db.guildFeature.findMany({
    where: { guildId },
  });

  // Map fetched features for usage
  const mappedFeatures = guildFeatures.map((feature) => ({
    name: feature.name,
    enabled: feature.enabled,
    data: feature.data,
  }));

  // Identify any missing features that are not in the database
  const missingFeatures = Object.keys(featureData).filter(
    (feature) => !guildFeatures.some((f) => f.name === feature)
  ) as $Enums.Feature[];

  // Insert missing features into the database with default data
  if (missingFeatures.length > 0) {
    await db.guildFeature.createMany({
      data: missingFeatures.map((feature) => ({
        name: feature,
        guildId,
        data: defaultFeatureData[feature],
      })),
    });
  }

  // Combine existing features with newly created ones (set to disabled by default)
  const allFeatures = [
    ...mappedFeatures,
    ...missingFeatures.map((feature) => ({
      name: feature,
      enabled: false,
      data: defaultFeatureData[feature],
    })),
  ];

  // Validate and return all features
  return allFeatures.map((feature) => {
    const validatedData = validate(featureData[feature.name], feature.data) as z.infer<
      typeof featureData[keyof typeof featureData]
    >;

    return {
      name: feature.name,
      enabled: feature.enabled,
      data: validatedData,
    };
  });
}