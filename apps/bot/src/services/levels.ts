import { ActionMultiplier, calculateLevelFromXP, calculateTimeBonus, calculateTimeInVoice, calculateXP, createLevelUpEmbed, hasLeveledUp } from "@olivr-nxt/common/levels";
import { db } from "~/client/database";

export const addXP = async (userId: string, guildId: string, currentLevel: number, currentXP: number, type: keyof typeof ActionMultiplier) => {
  const newXp = calculateXP(10, ActionMultiplier[type], currentLevel, [5, 9]);

  const user = await db.guildMember.upsert({
    where: { guildId_userId: { userId, guildId } },
    create: {
      userId,
      guildId,
      xp: newXp
    },
    update: {
      xp: {
        increment: newXp,
      },
    },
  }).catch(() => null);

  if (!user) return false;

  const level = calculateLevelFromXP(user.xp);
  if (hasLeveledUp(user.xp, currentXP)) {
    const newRole = level >= 5 ? 'Member' : undefined;
    const embed = createLevelUpEmbed(userId, user.xp, newRole);
    return { level, embed };
  }

  return { level, embed: null };
};

export const addXPForVoice = async (userId: string, guildId: string, currentLevel: number, currentXP: number, joinedVoiceAt: Date | null, leftVoiceAt: Date) => {
  const timeInVoice = calculateTimeInVoice(joinedVoiceAt, leftVoiceAt);
  const [bonus, bonusXP] = calculateTimeBonus(joinedVoiceAt, leftVoiceAt);
  const newXp = calculateXP(10, ActionMultiplier.Voice, currentLevel, [5, 9]) + bonusXP;

  const user = await db.guildMember.upsert({
    where: { guildId_userId: { userId, guildId } },
    create: {
      userId,
      guildId,
      xp: newXp
    },
    update: {
      xp: {
        increment: newXp,
      },
    },
  }).catch(() => null);

  if (!user) return false;

  const level = calculateLevelFromXP(user.xp);
  if (hasLeveledUp(user.xp, currentXP)) {
    const newRole = level >= 5 ? 'Member' : undefined;
    const embed = createLevelUpEmbed(userId, user.xp, newRole);
    return { level, embed };
  }

  return { level, embed: null };
};

export async function handleXPGain(userId: string, guildId: string, currentLevel: number, currentXP: number, type: keyof typeof ActionMultiplier, joinedVoiceAt: Date | null, leftVoiceAt: Date) {
  if (type === 'Voice') {
    return addXPForVoice(userId, guildId, currentLevel, currentXP, joinedVoiceAt, leftVoiceAt);
  }

  return addXP(userId, guildId, currentLevel, currentXP, type);
}