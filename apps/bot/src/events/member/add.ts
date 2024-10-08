import { replaceText } from "@olivr-nxt/common";
import { createEmbed } from "@olivr-nxt/common/embeds";
import { getGuildFeature } from "@olivr-nxt/common/features";
import type { GuildMember, HexColorString } from "discord.js";
import { GreetingsCard } from "~/cards/greetingCard";
import { OliverEvent, isTextBasedChannel } from "~/client";
import { fetchChannel, fetchRoles } from "~/services/cache";
import { updateGuildStatistic } from "~/services/statistics";

export default class Event extends OliverEvent<'guildMemberAdd', 'client'> {
  constructor() {
    super('guildMemberAdd', 'client');
  }

  async execute(member: GuildMember) {
    this.client.logger.debug(`Member joined: ${member.user.tag} (${member.id})`);

    try {
      const autoRoleFeature = await getGuildFeature(this.client.db, member.guild.id, 'autorole');
      if (autoRoleFeature?.enabled) {
        const roles = await fetchRoles(member.guild.id, autoRoleFeature.data.roles.map(role => role.id));
        if (roles.length === 0) return;
        
        const availableRoles = autoRoleFeature.data.roles.map(role => {
          const roleData = roles.find(r => r.id === role.id);
          if (!roleData) return null;
          return { id: roleData.id, type: role.type };
        }).filter(role => role !== null);
        
        if (member.user.bot) {
          const roles = availableRoles.filter(role => role.type === 'bot');
          if (roles.length > 0) await member.roles.add(roles.map(role => role.id));
        } else {
          const roles = availableRoles.filter(role => role.type === 'user');
          if (roles.length > 0) await member.roles.add(roles.map(role => role.id));
        }
      }
    } catch (error) {
      const logsFeature = await getGuildFeature(this.client.db, member.guild.id, 'logs');
      if (logsFeature?.enabled) {
        const channel = await fetchChannel(member.guild.id, logsFeature.data.channelId);
        if (channel && isTextBasedChannel(channel)) {
          const embed = createEmbed()
            .setTitle('Error processing autorole')
            .setDescription(`An error occurred while processing autorole for ${member.toString()}`)
            .addField('Most likely cause', 'The bot does not have the required permissions to assign roles.\nPlease make sure the bot has the "Manage Roles" permission.\n\nIf the issue persists, please contact the bot owner.')
            .setColor('#F75555');
          await channel.send({ embeds: [embed] });
        }
      }
      this.client.logger.error(`Error processing guild member add for ${member.id}:`, error);
    }
    
    try {
      await this.client.db.$transaction(async (tx) => {
        // Update guild statistics
        await updateGuildStatistic(tx, member.guild.id, { statistic: 'usersJoined', value: 1 });

        // Upsert user information into the database
        await tx.user.upsert({
          where: { id: member.id },
          create: {
            id: member.id,
            guilds: {
              connectOrCreate: {
                where: { guildId_userId: { guildId: member.guild.id, userId: member.id } },
                create: { guildId: member.guild.id },
              },
            },
          },
          update: {},
        });

        const guild = member.guild;
        if (!guild) return;

        // Fetch and handle welcome feature
        const welcomeFeature = await getGuildFeature(tx, guild.id, 'welcome');
        if (welcomeFeature?.enabled) {

          // Fetch the welcome channel
          const channel = await fetchChannel(guild.id, welcomeFeature.data.channelId);
          if (!channel || !isTextBasedChannel(channel)) return;

          // Handle text message
          if (welcomeFeature.data.message && welcomeFeature.data.message.length > 0) {
            const message = replaceText(welcomeFeature.data.message, {
              member: member.toString(),
              guild: guild.name,
            });
            return channel.send(message);
          }

          // Handle embed message
          if (welcomeFeature.data.embed?.title) {
            const embed = createEmbed()
              .setTitle(welcomeFeature.data.embed.title)
              .setDescription(replaceText(welcomeFeature.data.embed.description, {
                member: member.toString(),
                guild: guild.name,
              }))
              .setColor(welcomeFeature.data.embed.color as HexColorString | undefined || "#F75555")
              .setThumbnail(member.user.displayAvatarURL());

            return channel.send({ embeds: [embed] });
          }

          // Handle greeting card image
          const greeting = new GreetingsCard()
            .setAvatar(member.user.displayAvatarURL())
            .setDisplayName(member.displayName)
            .setMessage(`Welcome to ${guild.name}!`)
            .setType('welcome');

          const image = await greeting.build({ format: "png" });
          return channel.send({ files: [image] });
        }
      });
    } catch (error) {
      this.client.logger.error(`Error processing guild member add for ${member.id}:`, error);
    }
  }
}