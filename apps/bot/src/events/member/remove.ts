import { replaceText } from "@olivr-nxt/common";
import { createEmbed } from "@olivr-nxt/common/embeds";
import { getGuildFeature } from "@olivr-nxt/common/features";
import type { GuildMember, HexColorString } from "discord.js";
import { GreetingsCard } from "~/cards/greetingCard";
import { OliverEvent, isTextBasedChannel } from "~/client";
import { fetchChannel } from "~/services/cache";
import { updateGuildStatistic } from "~/services/statistics";

export default class Event extends OliverEvent<'guildMemberRemove', 'client'> {
  constructor() {
    super('guildMemberRemove', 'client');
  }

  async execute(member: GuildMember) {
    this.client.logger.debug(`Member left: ${member.user.tag} (${member.id})`);

    try {
      await this.client.db.$transaction(async (tx) => {
        // Update guild statistics
        await updateGuildStatistic(tx, member.guild.id, { statistic: 'usersLeft', value: 1 });

        // Upsert user information into the database
        await tx.guildMember.upsert({
          where: { guildId_userId: { guildId: member.guild.id, userId: member.id } },
          create: {
            guildId: member.guild.id,
            userId: member.id,
            leftAt: new Date(),
          },
          update: {
            leftAt: new Date(),
          },
        });

        const guild = member.guild;
        if (!guild) return;

        // Fetch and handle welcome feature
        const feature = await getGuildFeature(tx, guild.id, 'welcome');
        if (!feature?.enabled) return;

        // Fetch the welcome channel
        const channel = await fetchChannel(guild.id, feature.data.channelId);
        if (!channel || !isTextBasedChannel(channel)) return;

        // Handle text message
        if (feature.data.message && feature.data.message.length > 0) {
          const message = replaceText(feature.data.message, {
            member: member.toString(),
            guild: guild.name,
          });
          return channel.send(message);
        }

        // Handle embed message
        if (feature.data.embed?.title) {
          const embed = createEmbed()
            .setTitle(feature.data.embed.title)
            .setDescription(replaceText(feature.data.embed.description, {
              member: member.toString(),
              guild: guild.name,
            }))
            .setColor(feature.data.embed.color as HexColorString | undefined || "#F75555")
            .setThumbnail(member.user.displayAvatarURL());

          return channel.send({ embeds: [embed] });
        }

        // Handle greeting card image
        const greeting = new GreetingsCard()
          .setAvatar(member.user.displayAvatarURL())
          .setDisplayName(member.displayName)
          .setType('goodbye');

        const image = await greeting.build({ format: "png" });
        return channel.send({ files: [image] });
      });
    } catch (error) {
      this.client.logger.error(`Error processing guild member remove for ${member.id}:`, error);
    }
  }
}
