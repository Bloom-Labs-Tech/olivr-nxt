import { createEmbed } from "./embeds";

export const XP_COOLDOWN = 30 * 1000;

export enum ActionMultiplier {
  Interaction = 1.2,
  Message = 1.1,
  Task = 1.5,
  Voice = 1.3,
}

export const calculateTimeBonus = (start: Date | null, end: Date): [number, number] => {
  const diff = end.getTime() - (start?.getTime() || end.getTime());
  const minutes = diff / 1000 / 60;
  const bonus = Math.floor(minutes / 10) + 1;
  return [bonus, bonus * 1.5];
};

export const calculateXP = (
  baseXP: number,
  actionMultiplier: ActionMultiplier,
  userLevel: number,
  randomBonusRange: [number, number],
): number => {
  const randomBonus = Math.floor(Math.random() * (randomBonusRange[1] - randomBonusRange[0] + 1)) + randomBonusRange[0];
  return Math.floor(baseXP * actionMultiplier * (1 + userLevel / 10) + randomBonus);
} 

export const calculateXPForNextLevel = (level: number): number => {
  return Math.floor(100 * 1.2 ** level);
}

export const calculateLevelFromXP = (xp: number): number => {
  let level = 0;
  let remainingXP = xp;

  while (remainingXP >= calculateXPForNextLevel(level)) {
    remainingXP -= calculateXPForNextLevel(level);
    level++;
  }

  return level;
}

export function hasLeveledUp(newXp: number, oldXp: number): boolean {
  return calculateLevelFromXP(newXp) > calculateLevelFromXP(oldXp);
}

export const calculateTimeInVoice = (joinedVoiceAt: Date | null, leftVoiceAt: Date): number => {
  if (!joinedVoiceAt) return 0;
  return Math.floor((leftVoiceAt.getTime() - joinedVoiceAt.getTime()) / 1000);
};

export function createLevelUpEmbed(userId: string, xp: number, newRole?: string) {
  const level = calculateLevelFromXP(xp);

  const embed = createEmbed()
    .setColor('#2B2D31')
    .setTitle('🎉 Level Up! 🎉')
    .setDescription(`Congratulations, <@${userId}>! You've leveled up!`)
    .addFields(
      { name: '📈 New Level', value: `${level}`, inline: true },
      { name: '🌟 Total XP', value: `${xp} XP`, inline: true },
      ...(newRole ? [{ name: '🎭 New Role', value: `You have unlocked the role ${newRole}` }] : []),
    )
    .setTimestamp();

  return embed;
}