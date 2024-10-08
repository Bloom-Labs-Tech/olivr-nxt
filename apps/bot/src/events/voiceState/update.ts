import { getGuildFeature } from '@olivr-nxt/common/features';
import { ChannelType, GuildMember, type VoiceBasedChannel, type VoiceState } from 'discord.js';
import { OliverEvent } from '~/client';
import { handleXPGain } from '~/services/levels';
import { updateGuildStatistic } from '~/services/statistics';

export default class Event extends OliverEvent<'voiceStateUpdate', 'client'> {
  public constructor() {
    super('voiceStateUpdate', 'client');
  }

  public async execute(oldState: VoiceState, newState: VoiceState) {
    if (!newState.member || newState.member.user.bot) return;

    if (!oldState.channelId && newState.channelId) {
      return this.handleJoin(newState);
    }

    if (oldState.channelId && !newState.channelId) {
      return this.handleLeave(oldState);
    }

    if (oldState.channelId !== newState.channelId) {
      return this.handleSwitch(oldState, newState);
    }
  }

  private async handleJoin(newState: VoiceState) {
    const member = newState.member;
    if (!member) return;
    const feature = await this.getDynamicVoiceFeature(newState.guild.id);
    if (!feature?.enabled) return;

    await this.updateVoiceJoinTime(member.id, member.guild.id);

    const channel = newState.channel;
    if (!channel || channel.id !== feature.data.channelId) return;

    const newChannel = await this.createUserVoiceChannel(member, feature);
    await member.voice.setChannel(newChannel);
  }

  private async handleLeave(oldState: VoiceState) {
    const member = oldState.member;
    if (!member) return;
    const feature = await this.getDynamicVoiceFeature(oldState.guild.id);
    if (!feature?.enabled) return;

    const leftVoiceAt = new Date();
    await this.handleXPForLeaving(member, leftVoiceAt);

    const channel = oldState.channel;
    if (channel && this.isTemporaryVoiceChannel(channel, feature) && !channel.members.size) {
      await channel.delete();
    }
  }

  private async handleSwitch(oldState: VoiceState, newState: VoiceState) {
    const member = newState.member;
    if (!member) return;
    const feature = await this.getDynamicVoiceFeature(newState.guild.id);
    if (!feature?.enabled) return;

    const leftVoiceAt = new Date();
    await this.handleXPForLeaving(member, leftVoiceAt);

    const oldChannel = oldState.channel;
    if (oldChannel && this.isTemporaryVoiceChannel(oldChannel, feature) && !oldChannel.members.size) {
      await oldChannel.delete();
    }

    const newChannel = newState.channel;
    if (newChannel && newChannel.id === feature.data.channelId) {
      const createdChannel = await this.createUserVoiceChannel(member, feature);
      await member.voice.setChannel(createdChannel);
    }
  }

  private async getDynamicVoiceFeature(guildId: string) {
    try {
      return await getGuildFeature(this.client.db, guildId, 'dynamicVoice');
    } catch (error) {
      console.error(`Error fetching dynamic voice feature for guild ${guildId}:`, error);
      return null;
    }
  }

  private async updateVoiceJoinTime(userId: string, guildId: string) {
    try {
      await this.client.db.guildMember.upsert({
        where: { guildId_userId: { userId, guildId } },
        update: { joinedVoiceAt: new Date() },
        create: { userId, guildId, joinedVoiceAt: new Date() },
      });
    } catch (error) {
      console.error(`Error updating voice join time for user ${userId} in guild ${guildId}:`, error);
    }
  }

  private async handleXPForLeaving(member: GuildMember, leftVoiceAt: Date) {
    try {
      await this.client.db.$transaction(async (tx) => {
        const user = await tx.guildMember.findUnique({
          where: { guildId_userId: { userId: member.id, guildId: member.guild.id } },
        });
        if (user) {
          await handleXPGain(
            this.client.db,
            member.id,
            member.guild.id,
            user.level,
            user.xp,
            'Voice',
            user.joinedVoiceAt,
            leftVoiceAt
          );
        }
      });
    } catch (error) {
      console.error(`Error handling XP for leaving voice for user ${member.id}:`, error);
    }
  }

  private isTemporaryVoiceChannel(channel: VoiceBasedChannel, feature: Awaited<ReturnType<typeof getGuildFeature<'dynamicVoice'>>>) {
    return channel.parentId === feature.data.categoryId && channel.name.endsWith("'s Channel");
  }

  private async createUserVoiceChannel(member: GuildMember, feature: Awaited<ReturnType<typeof getGuildFeature<'dynamicVoice'>>>) {
    try {
      return await this.client.db.$transaction(async (tx) => {
        await updateGuildStatistic(tx, member.guild.id, {
          statistic: 'dynamicVoicesCreated',
          value: 1,
        }).catch(() => null);
        return await member.guild.channels.create({
          name: `${member.displayName}'s Channel`,
          type: ChannelType.GuildVoice,
          parent: feature.data.categoryId,
          permissionOverwrites: [
            {
              id: member.id,
              allow: ['ManageChannels', 'ManageRoles', 'ViewChannel', 'Connect', 'Speak', 'Stream'],
            },
          ],
        });
      });
    } catch (error) {
      console.error(`Error creating voice channel for user ${member.id}:`, error);
      return null;
    }
  }
}