import {
  ActivityType,
  Client,
  Partials
} from 'discord.js';
import { db } from '~/client/database';
import { OliverLogger } from '~/client/olivrLogger';
import { env } from '~/env';
import { CommandHandler } from './handlers/commands';
import { EventHandler } from './handlers/events';

export class OliverBot extends Client {
  public logger = OliverLogger.getInstance();
  public db = db;

  private commandHandler = new CommandHandler();
  private eventHandler = new EventHandler();
  
  constructor() {
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
    await super.login(env.DISCORD_TOKEN);

    this.once('ready', async () => {
      await this.eventHandler.registerEvents();
      await this.commandHandler.registerCommands();
    });

    return env.DISCORD_TOKEN;
  }
}