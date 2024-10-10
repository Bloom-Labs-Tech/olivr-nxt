import { createEmbed } from "@olivr-nxt/common/embeds";
import { type LanguageCode, type Translation, languages, languagesSorted, tl } from "@olivr-nxt/common/translate";
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { OliverCommand } from "~/client";
import { rKey } from "~/client/database";

const MAX_AUTO_COMPLETE = 25;

export default class TLCommand extends OliverCommand {
  constructor() {
    super({
      name: "translate",
      description: "Translate text to another language",
      type: "utility",
      category: "utility",
      examples: ["translate to:en from:ja こんにちは", "translate to:ja hello"],
    })
  }

  public registerApplicationCommands() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(option => option.setName("content").setDescription("The text to translate").setRequired(true))
      .addStringOption(option => option.setName("to").setDescription("The language to translate to").setRequired(true).setAutocomplete(true))
      .addStringOption(option => option.setName("from").setDescription("The language to translate from").setRequired(false).setAutocomplete(true));
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const query = interaction.options.getFocused();

    if (!query) {
      const langs = languagesSorted.slice(0, MAX_AUTO_COMPLETE);
      const options = langs.map(lang => ({ name: `(${lang.code}) ${lang.name}`, value: lang.code }));

      return await interaction.respond(options);
    };

    const queryLower = query.toLowerCase();
    const langs = languagesSorted.filter(lang => lang.name.toLowerCase().includes(queryLower) || lang.code.toLowerCase().includes(queryLower));
    const options = langs.map(lang => ({ name: `(${lang.code}) ${lang.name}`, value: lang.code })).slice(0, MAX_AUTO_COMPLETE);

    return await interaction.respond(options);
  }

  async run(interaction: ChatInputCommandInteraction) {
    const content = interaction.options.getString("content", true);
    const to = interaction.options.getString("to", true) as LanguageCode;
    const from = interaction.options.getString("from", false) as LanguageCode | undefined;

    const translated = await tl(content, from, to);

    if (!translated) {
      return await interaction.reply("Failed to translate");
    }

    await Promise.all([
      await this.updateRedis(to, "to").catch(() => null),
      await this.updateRedis(translated.src || "auto", "from").catch(() => null),
      await this.client.redis.incr(rKey("translate")).catch(() => null),
    ]);

    const fromName = this.findLanguage(translated.src)?.name || "Auto-detected";
    const toName = this.findLanguage(to)?.name || "Unknown";

    const embed = this.formatTranslatedMessage(translated, { from: fromName, to: toName });

    return await interaction.reply({ embeds: [embed] });
  }

  private findLanguage(code: string) {
    return languages.find(lang => lang.code === code);
  } 

  private async updateRedis(key: string, type: "from" | "to") {
    const redisKey = rKey("translate", key);
    const redisValue = (await this.client.redis
      .get(redisKey)
      .then((data) => (data ? JSON.parse(data) : { to: 0, from: 0 }))) as {
      to: number;
      from: number;
    };
    await this.client.redis.set(
      redisKey,
      JSON.stringify({
        to: type === "to" ? redisValue.to + 1 : redisValue.to,
        from: type === "from" ? redisValue.from + 1 : redisValue.from,
      })
    );
  }

  private formatTranslatedMessage(
    translation: Translation,
    opts: { from?: string; to: string }
  ) {
    const {
      text,
      pronunciation,
      hasCorrectedLang,
      src,
      hasCorrectedText,
      correctedText,
    } = translation;
  
    const fromLanguage = opts.from || src || "Auto-detected";
    const toLanguage = opts.to;
  
    const embed = createEmbed()
      .setAuthor({ name: 'Translation' })
      .setColor('#2ecc71')
      .setDescription(`**From**: ${fromLanguage}\n**To**: ${toLanguage}\n${text}`)
      .setFooter({ text: "Translated with ❤️ from olivr-nxt" });
  
    if (hasCorrectedLang) {
      embed.addField('Language Suggestion', `Did you mean from: **${src}** to: **${toLanguage}**?`);
    }
  
    if (hasCorrectedText) {
      embed.addField('Text Suggestion', `Did you mean: **${correctedText}**`);
    }
  
    if (pronunciation) {
      embed.addField('Pronunciation', `_${pronunciation}_`);
    }
  
    return embed;
  }
}