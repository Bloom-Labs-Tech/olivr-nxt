import { capitalize, generateRandomString } from "@olivr-nxt/common";
import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, type Interaction, StringSelectMenuBuilder } from "discord.js";
import { type CommandJSON, OliverCommand } from "~/client";

export default class HelpCommand extends OliverCommand {
  constructor() {
    super({
      name: 'help',
      description: 'Show the help menu',
      category: 'general',
      type: 'other',
      examples: ['help'],
    })
  }

  public async run(interaction: ChatInputCommandInteraction) {
    const uniqueId = generateRandomString(10);

    const categories = this.getCommandCategories();
    const embed = this.formatEmbed(this.getCommandsByCategory(categories[0]), categories[0]);
    const selectMenu = this.createCategorySelectMenu(categories, uniqueId, capitalize(categories[0]));

    const row = (menu: StringSelectMenuBuilder) => new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row(selectMenu)],
    });
  }

  public collector(interaction: Interaction) {
    this.client.logger.debug('Collector called');
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.startsWith('local:help-select-')) return;

    const selectedCategory = interaction.values[0];
    const commands = this.getCommandsByCategory(selectedCategory);

    const embed = this.formatEmbed(commands, selectedCategory);
    const uniqueId = interaction.customId.split('local:help-select-')[1];
    const components = [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(this.createCategorySelectMenu(this.getCommandCategories(), uniqueId, capitalize(selectedCategory)))];
    
    interaction.editReply({
      embeds: [embed],
      components
    });
  }

  private getCommandCategories(): string[] {
    const commands = Array.from(this.client.commandHandler.commands.values());
    const categories = [...new Set(commands.map((command) => command.category))];
    return categories;
  }

  private createCategorySelectMenu(
    categories: string[],
    uniqueId: string,
    placeholder = 'Select a command category',
  ): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder()
      .setCustomId(`local:help-select-${uniqueId}`)
      .setPlaceholder(placeholder)
      .addOptions(
        categories.map((category) => ({
          label: category.charAt(0).toUpperCase() + category.slice(1),
          value: category,
        })),
      );
  }

  private getCommandsByCategory(category: string): CommandJSON[] {
    const commands = Array.from(this.client.commandHandler.commands.values());
    return commands.filter((command) => command.category === category).map((command) => command.toJSONHelp());
  }

  private formatEmbed(commands: CommandJSON[], category: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`${capitalize(category)} Commands`)
      .setDescription(`Here are the available commands in the **${category}** category:`)
      .setColor('#5865F2');
  
    for (const command of commands) {
      let value = `${command.description}`;
  
      if (command.examples.length > 0) {
        value += `\n\n**Examples:**\n${command.examples.map((example) => `- \`${example}\``).join('\n')}`;
      }
  
      if (command.subcommands && command.subcommands.length > 0) {
        value += `\n\n**Subcommands:**\n${command.subcommands.map(
          (subcommand) => `- \`${subcommand.name}\`: ${subcommand.description}`
        ).join('\n')}`;
      }
  
      embed.addFields({
        name: `\`/${command.name}\``,
        value: value,
        inline: false,
      });
    }
  
    return embed;
  }  
}