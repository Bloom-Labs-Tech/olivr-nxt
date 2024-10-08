import { type AutocompleteInteraction, type ButtonInteraction, type CommandInteraction, type Interaction, type ModalSubmitInteraction, type StringSelectMenuInteraction } from "discord.js";
import { OliverCommand, OliverEvent } from "~/client";
import { updateStatistic } from "~/services/statistics";

export default class Event extends OliverEvent<"interactionCreate", "client"> {
  constructor() {
    super("interactionCreate", "client");
  }

  async execute(interaction: Interaction) {
    if (interaction.isCommand()) return await this.handleCommand(interaction);
    if (interaction.isAutocomplete()) return await this.handleAutocomplete(interaction);
    if (interaction.customId.startsWith('local:')) return await this.handleCommandCollector(interaction);
    if (interaction.isButton()) return await this.handleButtonInteraction(interaction);
    if (interaction.isModalSubmit()) return await this.handleModalSubmit(interaction);
    if (interaction.isStringSelectMenu()) return await this.handleSelectMenu(interaction);

    this.client.logger.warn(`Unhandled interaction type: ${interaction.type}`);
    return interaction.deferUpdate();
  }

  private async handleCommandCollector(interaction: Interaction) {
    if (!interaction.isMessageComponent()) return;

    if ((interaction.customId.startsWith("local:mmr:") || interaction.customId.startsWith("local:stats:")) && interaction.isStringSelectMenu()) return await this.handleValorantCollector(interaction);
    if (interaction.customId.startsWith("local:help-select-") && interaction.isStringSelectMenu()) return await this.handleHelpCollector(interaction);
  }

  private async handleHelpCollector(interaction: StringSelectMenuInteraction) {
    await interaction.deferUpdate();

    // command = help, subcommand = category
    const command = this.client.commandHandler.commands.get('help');
    if (!command) {
      this.client.logger.warn('Command not found: help');
      return;
    }

    try {
      await OliverCommand.runCollector(command, interaction);
    } catch (error) {
      this.client.logger.error(`Failed to execute command: ${command.name}`, error);
      await interaction.reply({ content: 'Failed to execute command.', ephemeral: true });
    }
  }

  private async handleValorantCollector(interaction: StringSelectMenuInteraction) {
    await interaction.deferUpdate();

    // command = valorant, subcommand = mmr
    const command = this.client.commandHandler.commands.get('valorant');
    if (!command) {
      this.client.logger.warn('Command not found: valorant');
      return;
    }

    const subCommand = interaction.customId.split(':')[1];

    try {
      await OliverCommand.runCollector(command, interaction, subCommand);
    } catch (error) {
      this.client.logger.error(`Failed to execute command: ${command.name}`, error);
      await interaction.reply({ content: 'Failed to execute command.', ephemeral: true });
    }
  }

  private async handleAutocomplete(interaction: AutocompleteInteraction) {
    const command = this.client.commandHandler.commands.get(interaction.commandName);
    if (!command) {
      this.client.logger.warn(`Command not found: ${interaction.commandName}`);
      return;
    }

    try {
      await OliverCommand.runAutocomplete(command, interaction);
    } catch (error) {
      this.client.logger.error(`Failed to execute autocomplete: ${interaction.commandName}`, error);
      await interaction.respond([]);
    }
  }

  private async handleModalSubmit(interaction: ModalSubmitInteraction) {
    return interaction.deferUpdate();
  }

  private async handleButtonInteraction(interaction: ButtonInteraction) {
    return interaction.deferUpdate();
  }

  private async handleCommand(interaction: CommandInteraction) {
    const command = this.client.commandHandler.commands.get(interaction.commandName);
    if (!command) {
      this.client.logger.warn(`Command not found: ${interaction.commandName}`);
      return;
    }

    await updateStatistic(this.client.db, interaction.user.id, interaction.guild?.id, 
      { statistic: 'commandsUsed', value: 1 },
      (command.type === "moderation") ? { statistic: 'moderationActions', value: 1 } : undefined
    );

    try {
      await OliverCommand.runCommand(command, interaction);
    } catch (error) {
      this.client.logger.error(`Failed to execute command: ${interaction.commandName}`, error);
      await interaction.reply({ content: 'Failed to execute command.', ephemeral: true });
    }
  }

  private async handleSelectMenu(interaction: StringSelectMenuInteraction) {
    return interaction.deferUpdate();
  }
}