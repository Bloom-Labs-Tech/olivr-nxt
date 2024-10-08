import type { Statistic } from "@olivr-nxt/common/types";
import type { Prisma, PrismaClient } from "@olivr-nxt/database";

type StatisticValuePair = {
  statistic: Statistic;
  value: number;
};

const GUILD_STATISTICS: Statistic[] = [
  "messagesSent",
  "usersJoined",
  "usersLeft",
  "dynamicVoicesCreated",
];

export async function updateStatistic(
  db: PrismaClient | Prisma.TransactionClient,
  userId: string,
  guildId: string | undefined,
  ...statisticValuePairs: (StatisticValuePair | undefined)[]
): Promise<boolean> {
  const pairs = statisticValuePairs.filter((pair) => pair !== undefined).filter((pair) => pair.value !== 0);
  if (!guildId || pairs.length === 0) return false;

  // Dynamically build the update object for user and guild statistics
  const updateData: Prisma.GuildMemberUpdateInput = {};
  const guildUpdateData: Prisma.GuildUpdateInput = {};

  for (const { statistic, value } of pairs) {
    if (!GUILD_STATISTICS.includes(statistic)) {
      updateData[statistic as keyof Prisma.GuildMemberUpdateInput] = {
        increment: value,
      };
    }

    // Update for guild statistics
    guildUpdateData[statistic] = {
      increment: value,
    };
  }

  try {
    // Perform the update for the guild member and the guild
    await db.guildMember.update({
      where: { guildId_userId: { userId, guildId } },
      data: updateData,
    });

    await db.guild.update({
      where: { id: guildId },
      data: guildUpdateData,
    });

    return true;
  } catch (error) {
    console.error('Failed to update statistics:', error);
    return false;
  }
}

export async function updateGuildStatistic(
  db: PrismaClient | Prisma.TransactionClient,
  guildId: string,
  ...statisticValuePairs: StatisticValuePair[]
): Promise<boolean> {
  if (statisticValuePairs.length === 0) return false;

  // Dynamically build the update object for guild statistics
  const updateData: Prisma.GuildUpdateInput = {};

  for (const { statistic, value } of statisticValuePairs) {
    updateData[statistic] = {
      increment: value,
    };
  }

  try {
    // Perform the update for the guild
    await db.guild.update({
      where: { id: guildId },
      data: updateData,
    });

    return true;
  } catch (error) {
    console.error('Failed to update guild statistics:', error);
    return false;
  }
}