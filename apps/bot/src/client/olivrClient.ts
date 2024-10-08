import { Player } from "discord-music-player";
import {
  ActivityType,
  Client,
  Collection,
  Message,
  type PartialMessage,
  Partials,
  type Snowflake
} from 'discord.js';
import { db, redis } from '~/client/database';
import { OliverLogger } from '~/client/olivrLogger';
import { env } from '~/env';
import EncodingService from "~/services/crpyto";
import { updateGuildStatistic } from "~/services/statistics";
import { CommandHandler } from './handlers/commands';
import { EventHandler } from './handlers/events';

export class OliverBot extends Client {
  private static instance: OliverBot;
  public uptimeSince = new Date();
  public encoding = EncodingService.getInstance();
  public logger = OliverLogger.getInstance();
  public db = db;
  public redis = redis;
  public player = new Player(this, {
    deafenOnJoin: true,
    leaveOnEmpty: true,
    volume: 20,
    quality: "high"
  });

  public commandHandler = new CommandHandler(this);
  public eventHandler = new EventHandler(this);
  
  public snipes = new Collection<Snowflake, Message | PartialMessage>();

  public static getInstance(): OliverBot {
    if (!OliverBot.instance) {
      OliverBot.instance = new OliverBot();
    }

    return OliverBot.instance;
  }
  
  private constructor() {
    super({
      intents: [
        'GuildMembers',
        'Guilds',
        'GuildMessages',
        'MessageContent',
        'GuildInvites',
        'GuildVoiceStates',
        'GuildEmojisAndStickers',
      ],
      partials: [Partials.Channel, Partials.User, Partials.GuildMember, Partials.Message, Partials.GuildScheduledEvent],
      presence: {
        activities: [
          {
            name: 'Tending to the garden',
            type: ActivityType.Custom,
          },
        ],
      },
      allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true,
      },
    });
  }

  async login(_token?: string): Promise<string> {
    return this.init();
  }

  async init(): Promise<string> {
    await this.eventHandler.registerEvents();
    await super.login(env.DISCORD_TOKEN);

    this.once('ready', async () => {
      await this.commandHandler.registerCommands();
      await this.updateGuilds();
      await this.updateMembers();
    });

    return env.DISCORD_TOKEN;
  }

  private async updateGuilds() {
    const cachedGuilds = await this.guilds.fetch();
    const savedGuilds = await this.db.guild.findMany();

    const guilds = cachedGuilds.map((guild) => guild.id);

    const guildsToUpdate = savedGuilds.filter((guild) => guilds.includes(guild.id));
    const guildsToLeave = savedGuilds.filter((guild) => !guilds.includes(guild.id));

    await this.db.guild.createMany({
      data: guilds.map((guild) => ({
        id: guild,
      })),
      skipDuplicates: true,
    });

    this.db.guild.updateMany({
      where: {
        id: {
          in: guildsToUpdate.map((guild) => guild.id),
        },
      },
      data: {
        leftAt: null,
      },
    });

    this.db.guild.updateMany({
      where: {
        id: {
          in: guildsToLeave.map((guild) => guild.id),
        },
      },
      data: {
        leftAt: new Date(),
      },
    });
  }

  private async updateMembers() {
    return this.db.$transaction(async (tx) => {
      const guilds = await tx.guild.findMany();
      for (const guild of guilds) {
        this.logger.info(`Updating members for guild ${guild.id}`);
        const cachedGuild = await this.guilds.fetch(guild.id);
        const cachedMembers = await cachedGuild.members.fetch();

        const savedMembers = await tx.guildMember.findMany({
          where: { guildId: guild.id },
        });

        const members = cachedMembers.map((member) => member.id);

        const membersToUpdate = savedMembers.filter((member) => members.includes(member.userId));
        const membersToLeave = savedMembers.filter((member) => !members.includes(member.userId));

        await tx.user.createMany({
          data: members.map((member) => ({
            id: member,
          })),
          skipDuplicates: true,
        });

        await tx.guildMember.updateMany({
          where: {
            guildId: guild.id,
            userId: {
              in: membersToUpdate.map((member) => member.userId),
            },
          },
          data: {
            leftAt: null,
          },
        });

        await tx.guildMember.updateMany({
          where: {
            guildId: guild.id,
            userId: {
              in: membersToLeave.map((member) => member.userId),
            },
          },
          data: {
            leftAt: new Date(),
          },
        });

        await updateGuildStatistic(tx, guild.id, 
          { statistic: 'usersLeft', value: membersToLeave.length },
          { statistic: 'usersJoined', value: membersToUpdate.length },
        );
      }
    });
  }
}