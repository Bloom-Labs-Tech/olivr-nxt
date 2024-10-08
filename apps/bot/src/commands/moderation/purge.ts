import { OliverError } from "@olivr-nxt/common";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { OliverCommand, isGuildBasedChannel, isTextBasedChannel } from "~/client";

export default class HelpCommand extends OliverCommand {
  constructor() {
    super({
      name: 'purge',
      description: 'Delete a number of messages from a channel',
      category: 'moderation',
      type: 'moderation',
      examples: ['purge amount:10'],
    });
  };

  public registerApplicationCommands() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addIntegerOption((option) =>
        option
          .setName('amount')
          .setDescription('The number of messages to delete')
          .setMaxValue(100)
          .setMinValue(1)
          .setRequired(true),
      );
  }

  public async run(interaction: ChatInputCommandInteraction) {
    if (!isGuildBasedChannel(interaction.channel) || !isTextBasedChannel(interaction.channel)) throw new OliverError('This command only works in a server and in a text channel.');
    const amount = interaction.options.getInteger('amount', true);

    const messages = await interaction.channel.messages.fetch({ limit: amount });
    const filteredMessages = messages.filter((message) => message.deletable && !message.pinned);

    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(filteredMessages, true);

    return interaction.editReply({ content: `Deleted ${deleted.size} messages.` });
  }
}