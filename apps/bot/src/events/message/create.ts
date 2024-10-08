import type { Message } from "discord.js";
import { OliverEvent, isGuildBasedChannel, isTextBasedChannel } from "~/client";
import { handleXPGain } from "~/services/levels";
import { updateStatistic } from "~/services/statistics";

export default class Event extends OliverEvent<'messageCreate', 'client'> {
  constructor() {
    super('messageCreate', 'client');
  }

  async execute(message: Message) {
    if (message.author.bot) return;
    if (!isGuildBasedChannel(message.channel) || !isTextBasedChannel(message.channel)) return;
    if (!message.guild) return;

    const user = await this.client.db.guildMember.upsert({
      where: { guildId_userId: { guildId: message.guild.id, userId: message.author.id } },
      create: {
        guildId: message.guild.id,
        userId: message.author.id,
        xp: 0,
        level: 0,
      },
      update: {},
    });

    await this.client.db.$transaction(async (tx) => {
      const gained = await handleXPGain(tx, message.author.id, message.guild?.id, user.level, user.xp, 'Message');
      await updateStatistic(tx, message.author.id, message.guild?.id,
        { statistic: 'messagesSent', value: 1 },
        { statistic: 'xpEarned', value: gained.addedXP },
        { statistic: 'levelsGained', value: gained.addedLevel },
      );
    });
  }
}