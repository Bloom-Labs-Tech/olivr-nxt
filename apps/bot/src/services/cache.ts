import type { Guild, GuildMember, OAuth2Guild, Role } from "discord.js";
import { OliverBot } from "~/client";

export async function fetchGuilds(): Promise<Guild[] | OAuth2Guild[]> {
  const guilds = OliverBot.getInstance().guilds.cache.map(guild => guild);
  if (!guilds || guilds.length === 0) {
    const guilds = await OliverBot.getInstance().guilds.fetch().catch(() => null);
    return guilds ? guilds.map(guild => guild) : [];
  }

  return guilds;
}

export async function fetchGuild(guildId: string): Promise<Guild | null> {
  const cachedGuild = OliverBot.getInstance().guilds.cache.get(guildId);
  if (!cachedGuild) {
    const guild = await OliverBot.getInstance().guilds.fetch(guildId).catch(() => null);
    return guild;
  }

  return cachedGuild;
}

export async function fetchMembers(guildId: string): Promise<GuildMember[]> {
  const guild = await fetchGuild(guildId);
  if (!guild) return [];

  const members = guild.members.cache.map(member => member);
  if (!members || members.length === 0) {
    const members = await guild.members.fetch().catch(() => null);
    return members ? members.map(member => member) : [];
  }

  return members;
}

export async function fetchMember(guildId: string, userId: string): Promise<GuildMember | null> {
  const guild = await fetchGuild(guildId);
  if (!guild) return null;

  const member = await guild.members.fetch(userId).catch(() => null);
  return member;
}

export async function fetchUser(userId: string) {
  const user = OliverBot.getInstance().users.cache.get(userId);
  if (!user) {
    const user = await OliverBot.getInstance().users.fetch(userId).catch(() => null);
    return user;
  }

  return user;
}

export async function fetchRoles(guildId: string, roleIds?: string[]): Promise<Role[]> {
  const guild = await fetchGuild(guildId);
  if (!guild) return [];

  // Fetch roles from cache first
  let roles = guild.roles.cache.map(role => role);

  // If cache is empty, fetch roles from API
  if (!roles || roles.length === 0) {
    try {
      const fetchedRoles = await guild.roles.fetch();
      roles = fetchedRoles.map(role => role);
    } catch (error) {
      console.error(`Failed to fetch roles for guild ${guildId}:`, error);
      return [];
    }
  }

  // If roleIds are provided, filter the roles based on those IDs
  if (roleIds) {
    roles = roles.filter(role => roleIds.includes(role.id));
  }

  // Return an array of role IDs
  return roles;
}

export async function fetchRole(guildId: string, roleId: string): Promise<Role | null> {
  const guild = await fetchGuild(guildId);
  if (!guild) return null;

  const role = guild.roles.cache.get(roleId);
  if (!role) {
    const role = await guild.roles.fetch(roleId).catch(() => null);
    return role;
  }

  return role;
}

export async function fetchChannels(guildId: string) {
  const guild = await fetchGuild(guildId);
  if (!guild) return [];

  const channels = guild.channels.cache.map(channel => channel);
  if (!channels || channels.length === 0) {
    const channels = await guild.channels.fetch().catch(() => null);
    return channels ? channels.map(channel => channel) : [];
  }

  return channels;
}

export async function fetchChannel(guildId: string, channelId: string) {
  const guild = await fetchGuild(guildId);
  if (!guild) return null;

  const channel = guild.channels.cache.get(channelId);
  if (!channel) {
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    return channel;
  }

  return channel;
}