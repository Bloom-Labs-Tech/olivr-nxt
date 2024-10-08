import type { Guild } from "discord.js";
import { OliverEvent } from "~/client";

export default class Event extends OliverEvent<'guildDelete', 'client'> {
  constructor() {
    super('guildDelete', 'client');
  }

  async execute(guild: Guild) {
    this.client.logger.debug(`Left guild: ${guild.name} (${guild.id})`);
    await this.client.db.guild.upsert({
      where: { id: guild.id },
      create: {
        id: guild.id,
        leftAt: new Date(),
      },
      update: {
        leftAt: new Date(),
      },
    });
  }
}