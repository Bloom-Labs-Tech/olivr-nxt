import packageJson from '@olivr-nxt/bot/package.json';
import { EmbedBuilder } from 'discord.js';

export class CustomEmbedBuilder extends EmbedBuilder {
  addField(name: string, value: string, inline = false) {
    return this.addFields({ name, value, inline });
  }
}

export function createEmbed() {
  return new CustomEmbedBuilder().setFooter({
    text: `♡ from fabra - olivr-nxt v${packageJson.version}`,
  });
}