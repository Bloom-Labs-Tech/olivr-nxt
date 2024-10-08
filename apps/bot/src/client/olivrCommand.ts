import { OliverError } from '@olivr-nxt/common';
import type { $Enums } from '@olivr-nxt/database';
import {
  type ApplicationCommandDataResolvable,
  ApplicationCommandType,
  type AutocompleteInteraction,
  type ChatInputApplicationCommandData,
  type CommandInteraction,
  type Interaction,
  type InteractionResponse,
  type Message,
  SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
  type SlashCommandSubcommandBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import type { OliverMiddleware } from '~/client/olivrMiddleware';
import { OliverBot } from './olivrClient';
import { OliverLogger } from './olivrLogger';

export type CommandBuilder =
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | SlashCommandBuilder
  | SlashCommandSubcommandBuilder;

// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
type  CommandResponse = Promise<Message | InteractionResponse | void> | Message | InteractionResponse | void;

type Subcommand = {
  name: string;
  description: string;
  examples?: string[];
};

export type CommandJSON = {
  name: string;
  description: string;
  examples: string[];
  category: string;
  subcommands?: Subcommand[];
};

type CommandOptions = {
  name: string;
  description: string;
  category?: string;
  examples?: string[];
  middlewares?: OliverMiddleware | OliverMiddleware[];
  type: keyof typeof $Enums.Feature | 'other';
  subcommands?: Subcommand[];
};

export class OliverCommand {
  client = OliverBot.getInstance();
  public readonly name: string;
  public readonly type: keyof typeof $Enums.Feature | 'other';
  public readonly description: string;
  public readonly category: string;
  public readonly examples: string[];
  public readonly middlewares: OliverMiddleware[];
  public readonly subcommands: Subcommand[];

  constructor(options: CommandOptions) {
    this.name = options.name;
    this.type = options.type;
    this.description = options.description;
    this.category = options.category || 'other';
    this.examples = options.examples || [];
    this.middlewares = Array.isArray(options.middlewares) ? options.middlewares : [options.middlewares].filter((m) => !!m);
    this.subcommands = options.subcommands || [];
  }

  public registerApplicationCommands(): ApplicationCommandDataResolvable {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
  }

  public run(interaction: CommandInteraction): CommandResponse {
    throw new Error('Method not implemented.');
  }

  public autocomplete(interaction: AutocompleteInteraction): CommandResponse {
    if (!interaction.responded) {
      return interaction.respond([]);
    }
  }

  public collector(interaction: Interaction, subcommand?: string): CommandResponse {
    throw new Error('Method not implemented.');
  }

  private static async runMiddlewares(commandInstance: OliverCommand, interaction: CommandInteraction): Promise<boolean> {
    for (const middleware of commandInstance.middlewares) {
      const passed = await middleware.run(interaction);
      if (!passed) {
        throw new OliverError('You do not have permission to run this command.');
      }
    }
    return true;
  }

  private static async isCommandEnabled(commandInstance: OliverCommand, interaction: CommandInteraction): Promise<boolean> {
    if (!interaction.guild) return true;
    // Command feature check could be added here if implemented
    return true;
  }

  public static async runCommand(commandInstance: OliverCommand, interaction: CommandInteraction): Promise<void> {
    try {
      const isEnabled = await OliverCommand.isCommandEnabled(commandInstance, interaction);
      if (!isEnabled) throw new OliverError('This command is disabled in this server.');

      await OliverCommand.runMiddlewares(commandInstance, interaction);
      await commandInstance.run(interaction);
    } catch (error) {
      const errorMessage = error instanceof OliverError ? error.message : 'There was an error executing this command.';
      OliverLogger.getInstance().error(`Error running command "${commandInstance.name}":`, error);
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }

  public static async runCollector(commandInstance: OliverCommand, interaction: Interaction, subcommand?: string): Promise<void> {
    try {
      await commandInstance.collector(interaction, subcommand);
    } catch (error) {
      OliverLogger.getInstance().error(`Error running collector for command "${commandInstance.name}":`, error);
    }
  }

  public static async runAutocomplete(commandInstance: OliverCommand, interaction: AutocompleteInteraction): Promise<void> {
    try {
      if (!interaction.responded) {
        await commandInstance.autocomplete(interaction);
      }
    } catch (error) {
      OliverLogger.getInstance().error(`Error running autocomplete for command "${commandInstance.name}":`, error);
      await interaction.respond([]);
    }
  }

  public toJSONHelp(): CommandJSON {
    return {
      name: this.name,
      description: this.description,
      examples: this.examples,
      category: this.category,
      subcommands: this.subcommands,
    };
  }

  public toJSON(): ChatInputApplicationCommandData {
    return {
      name: this.name,
      description: this.description,
      type: ApplicationCommandType.ChatInput,
    };
  }
}