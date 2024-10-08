import { getGuildFeature } from "@olivr-nxt/common/features";
import {
  ActionMultiplier,
  XP_COOLDOWN,
  calculateLevelFromXP,
  calculateTimeBonus,
  calculateXP,
  createLevelUpEmbed,
  hasLeveledUp
} from "@olivr-nxt/common/levels";
import type { Prisma, PrismaClient } from "@olivr-nxt/database";
import { isTextBasedChannel } from "~/client";
import { fetchChannel } from "./cache";

// Define the result type to be returned after XP calculation
type XPGainResult = {
  oldXP: number;
  addedXP: number;
  newXP: number;
  oldLevel: number;
  addedLevel: number;
  newLevel: number;
};

// Helper function to handle XP calculation and updates
async function updateUserXP(
  db: PrismaClient | Prisma.TransactionClient,
  userId: string,
  guildId: string,
  xpIncrement: number,
) {
  return db.guildMember.upsert({
    where: { guildId_userId: { userId, guildId } },
    create: {
      userId,
      guildId,
      xp: xpIncrement,
      xpCooldown: new Date(Date.now() + XP_COOLDOWN),
    },
    update: {
      xp: { increment: xpIncrement },
      xpCooldown: new Date(Date.now() + XP_COOLDOWN),
    },
  }).catch(() => null);
}

// Function to handle XP gain for actions other than Voice
export const addXP = async (
  db: PrismaClient | Prisma.TransactionClient,
  userId: string,
  guildId: string,
  currentLevel: number,
  currentXP: number,
  type: keyof typeof ActionMultiplier
): Promise<XPGainResult> => {
  const feature = await getGuildFeature(db, guildId, 'leveling');
  if (!feature || !feature.enabled) {
    return {
      oldXP: currentXP,
      addedXP: 0,
      newXP: currentXP,
      oldLevel: currentLevel,
      addedLevel: 0,
      newLevel: currentLevel,
    };
  }

  const newXp = calculateXP(10, ActionMultiplier[type], currentLevel, [5, 9]);
  const user = await updateUserXP(db, userId, guildId, newXp);
  if (!user) return {
    oldXP: currentXP,
    addedXP: 0,
    newXP: currentXP,
    oldLevel: currentLevel,
    addedLevel: 0,
    newLevel: currentLevel,
  };

  const oldLevel = currentLevel;
  const newLevel = calculateLevelFromXP(user.xp);
  const addedLevel = newLevel - oldLevel;
  
  await handleLevelUp(db, user.xp, currentXP, feature, userId, guildId);

  return {
    oldXP: currentXP,
    addedXP: newXp,
    newXP: user.xp,
    oldLevel,
    addedLevel,
    newLevel,
  };
};

// Function to handle XP gain for Voice activities
export const addXPForVoice = async (
  db: PrismaClient | Prisma.TransactionClient,
  userId: string,
  guildId: string,
  currentLevel: number,
  currentXP: number,
  joinedVoiceAt: Date | null,
  leftVoiceAt: Date
): Promise<XPGainResult> => {
  const feature = await getGuildFeature(db, guildId, 'leveling');
  if (!feature || !feature.enabled) {
    return {
      oldXP: currentXP,
      addedXP: 0,
      newXP: currentXP,
      oldLevel: currentLevel,
      addedLevel: 0,
      newLevel: currentLevel,
    };
  }

  const bonus = calculateTimeBonus(joinedVoiceAt, leftVoiceAt);
  const newXp = calculateXP(10, ActionMultiplier.Voice, currentLevel, bonus);

  const user = await updateUserXP(db, userId, guildId, newXp);
  if (!user) return {
    oldXP: currentXP,
    addedXP: 0,
    newXP: currentXP,
    oldLevel: currentLevel,
    addedLevel: 0,
    newLevel: currentLevel,
  };

  const oldLevel = currentLevel;
  const newLevel = calculateLevelFromXP(user.xp);
  const addedLevel = newLevel - oldLevel;

  handleLevelUp(db, user.xp, currentXP, feature, userId, guildId);

  return {
    oldXP: currentXP,
    addedXP: newXp,
    newXP: user.xp,
    oldLevel,
    addedLevel,
    newLevel,
  };
};

// Common function to handle level-up logic
async function handleLevelUp(db: PrismaClient | Prisma.TransactionClient, newXp: number, currentXP: number, feature: Awaited<ReturnType<typeof getGuildFeature<'leveling'>>>, userId: string, guildId: string) {
  const level = calculateLevelFromXP(newXp);
  if (hasLeveledUp(newXp, currentXP)) {
    const newRole = feature.data?.roles.find((role) => role.level === level)?.roleId;
    await sendLevelEmbed(db, userId, guildId, newRole);
    return true;
  }
  return false;
}

// Unified handler for XP gain
export async function handleXPGain(
  db: PrismaClient | Prisma.TransactionClient,
  userId: string,
  guildId: string | undefined,
  currentLevel: number,
  currentXP: number,
  type: keyof typeof ActionMultiplier,
  joinedVoiceAt?: Date | null,
  leftVoiceAt?: Date
): Promise<XPGainResult> {
  if (!guildId) {
    return {
      oldXP: currentXP,
      addedXP: 0,
      newXP: currentXP,
      oldLevel: currentLevel,
      addedLevel: 0,
      newLevel: currentLevel,
    };
  }

  if (type === 'Voice' && joinedVoiceAt && leftVoiceAt) {
    return addXPForVoice(db, userId, guildId, currentLevel, currentXP, joinedVoiceAt, leftVoiceAt);
  }

  return addXP(db, userId, guildId, currentLevel, currentXP, type);
}

async function sendLevelEmbed(
  db: PrismaClient | Prisma.TransactionClient,
  userId: string,
  guildId: string,
  roleId?: string
) {
  const user = await db.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });

  if (!user) return;

  const embed = createLevelUpEmbed(userId, user.xp, roleId);
  
  const levelingFeature = await getGuildFeature(db, guildId, 'leveling');
  if (!levelingFeature || !levelingFeature.enabled) return;

  const channelId = levelingFeature.data.channelId;
  if (!channelId) return;

  const channel = await fetchChannel(guildId, channelId);
  if (!channel || !isTextBasedChannel(channel)) return;

  await channel.send({ embeds: [embed] });
}