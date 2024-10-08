import { getGuildFeatures } from "@olivr-nxt/common/features";
import type { Guild } from "discord.js";
import { OliverEvent } from "~/client";

export default class Event extends OliverEvent<'guildCreate', 'client'> {
  constructor() {
    super('guildCreate', 'client');
  }

  async execute(guild: Guild) {
    this.client.logger.debug(`Joined guild: ${guild.name} (${guild.id})`);
    await this.client.db.guild.upsert({
      where: { id: guild.id },
      create: {
        id: guild.id,
      },
      update: {
        leftAt: null,
      },
    });

    await getGuildFeatures(this.client.db, guild.id);
  }
}