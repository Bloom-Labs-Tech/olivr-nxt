import { createEmbed } from "@olivr-nxt/common/embeds";
import { isGuildBasedChannel, isTextBasedChannel } from "@sapphire/discord.js-utilities";
import { type ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { OliverCommand } from "../../client/olivrCommand";

export default class SnipeCommand extends OliverCommand {
  constructor() {
    super({
      name: 'snipe',
      description: 'Snipe the last deleted message',
      category: 'fun',
      type: 'fun',
      examples: ['snipe', 'snipe type:guild', 'snipe type:channel channel:#general'],
    });
  };

  public registerApplicationCommands() {
      return new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) => option.setName('type').setDescription('The type of snipe (default: channel)').setRequired(false).addChoices([{ name: 'Guild', value: 'guild' }, { name: 'Channel', value: 'channel' }]))
        .addChannelOption((option) => option.setName('channel').setDescription('The channel to snipe (default: current channel Id)').setRequired(false));
  }

  public async run(interaction: ChatInputCommandInteraction) {
    if (!isGuildBasedChannel(interaction.channel)) return interaction.reply({ content: 'This command only works in a server and in a text channel.' });

    const type = interaction.options.getString('type') ?? 'channel';
    const channel = interaction.options.getChannel('channel') as TextChannel ?? interaction.channel as TextChannel;

    if (!channel || !isGuildBasedChannel(channel) && !isTextBasedChannel(channel)) return interaction.reply({ content: 'This command only works in a text channel.' });

    const snipedMessage = this.client.snipes.get(type === 'guild' ? channel.guild.id : channel.id);
    if (!snipedMessage) return interaction.reply({ content: 'There is nothing to snipe!' });

    const { content, author, attachments, createdAt } = snipedMessage;
    const embed = createEmbed()
      .setAuthor({
        name: author?.tag ?? 'Unknown User',
        iconURL: author?.displayAvatarURL(),
      })
      .setDescription(content)
      .setTimestamp(createdAt);

    return interaction.reply({ embeds: [embed], files: attachments.map((attachment) => attachment.url) });
  }
}