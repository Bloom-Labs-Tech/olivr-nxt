import {
  type AccountDataV2,
  type MMRDataV2Data,
  type MatchHistoryV4Data,
  type Platform as ValorantPlatform,
  getAccountDataV2,
  getMMRDataV2,
  getMatchHistoryV4
} from "@ivanoliverfabra/valorant-api";
import { createEmbed } from "@olivr-nxt/common/embeds";
import { Platform, Prisma, Region, type ValorantUser } from "@olivr-nxt/database";
import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  type Interaction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction
} from "discord.js";
import moment from "moment";
import { OliverCommand } from "~/client";
import { fetchOrSet, rKey } from "~/client/database";
import { formatEmoji } from "~/utils/helpers";
import { buildMMRImage, emojis, gamemodes, map_emojis, old_ranks, ranks } from "~/utils/methods";

export default class ValorantCommand extends OliverCommand {
  constructor() {
    super({
      name: "valorant",
      description: "Get Valorant stats for a player",
      category: "utility",
      type: "other",
      subcommands: [
        {
          name: "mmr",
          description: "Get the MMR of a Valorant player",
          examples: ["valorant mmr username:username#tag region:na"],
        },
        {
          name: "link",
          description: "Link your Valorant account",
          examples: ["valorant link username:username#tag"],
        },
        {
          name: "unlink",
          description: "Unlink your Valorant account",
          examples: ["valorant unlink username:username#tag"],
        },
        {
          name: "stats",
          description: "Get the stats of a Valorant player",
          examples: ["valorant stats username:username#tag region:na platform:pc"],
        },
      ],
    });
  }

  public registerApplicationCommands() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("mmr")
          .setDescription("Get the MMR of a Valorant player")
          .addStringOption((option) =>
            option
              .setName("username")
              .setDescription("The Valorant username (e.g. username#tag)")
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addStringOption((option) =>
            option
              .setName("region")
              .setDescription("The region of the Valorant account (default: na)")
              .setRequired(false)
              .addChoices(
                Object.values(Region).map((region) => ({
                  name: region,
                  value: region,
                }))
              )
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("link")
          .setDescription("Link your Valorant account")
          .addStringOption((option) =>
            option
              .setName("username")
              .setDescription("The Valorant username (e.g. username#tag)")
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("unlink")
          .setDescription("Unlink your Valorant account")
          .addStringOption((option) =>
            option
              .setName("username")
              .setDescription("The Valorant username (e.g. username#tag)")
              .setRequired(true)
              .setAutocomplete(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("stats")
          .setDescription("Get the stats of a Valorant player")
          .addStringOption((option) =>
            option
              .setName("username")
              .setDescription("The Valorant username (e.g. username#tag)")
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addStringOption((option) =>
            option
              .setName("region")
              .setDescription("The region of the Valorant account (default: na)")
              .setRequired(false)
              .addChoices(
                Object.values(Region).map((region) => ({
                  name: region,
                  value: region,
                }))
              )
          )
          .addStringOption((option) =>
            option
              .setName("platform")
              .setDescription("The platform of the Valorant account (default: PC)")
              .setRequired(false)
              .addChoices(Object.values(Platform).map((platform) => ({ name: platform, value: platform.toLowerCase() })))
          )
      );
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const query = interaction.options.getString("username", true);

    const accounts = await this.getValorantAccounts(query, subcommand, interaction);

    return interaction.respond(
      accounts.map((account) => ({
        name: `${account.tag}#${account.tagLine}`,
        value: `${account.tag}#${account.tagLine}`,
      }))
    );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    this.client.logger.debug(`Valorant ${subcommand} command`);

    switch (subcommand) {
      case "mmr":
        return this.handleMMR(interaction);
      case "link":
        return this.handleLink(interaction);
      case "unlink":
        return this.handleUnlink(interaction);
      case "stats":
        return this.handleStats(interaction);
      default:
        return interaction.reply({ content: "Unknown subcommand.", ephemeral: true });
    }
  }

  // Helper method for fetching Valorant accounts
  private async getValorantAccounts(
    query: string,
    subcommand: string,
    interaction: AutocompleteInteraction
  ) {
    const isUnlinkCommand = subcommand === "unlink";
    const conditions: Prisma.ValorantUserWhereInput = {
      OR: [
        { tagLine: { contains: query, mode: "insensitive" } },
        { tag: { contains: query, mode: "insensitive" } },
      ],
      ...(isUnlinkCommand && { userId: interaction.user.id }),
    };

    return this.client.db.valorantUser.findMany({
      where: conditions,
      select: { tagLine: true, tag: true, userId: true },
      take: 10,
    }).then((accounts) => accounts.sort((a, b) => a.tag.localeCompare(b.tag)).sort((a, b) => a.userId === interaction.user.id ? -1 : b.userId === interaction.user.id ? 1 : 0));
  }

  // Centralized username validation
  private validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9 ]{3,16}#[a-zA-Z0-9]{4,5}$/;
    return usernameRegex.test(username);
  }

  private async handleMMR(interaction: ChatInputCommandInteraction) {
    const username = interaction.options.getString("username", true);
    const region = (interaction.options.getString("region") as Region) || Region.na;

    if (!this.validateUsername(username)) {
      return this.sendErrorEmbed(
        interaction,
        "Valorant MMR",
        "Invalid username. Please provide a valid Valorant username."
      );
    }

    const [name, tag] = username.split("#");
    const mmr = await this.fetchMMRData(name, tag, region);
    
    if (!mmr) {
      return this.sendErrorEmbed(interaction, "Valorant MMR", "No data found for this player.");
    }

    const seasonsComponents = this.buildSeasonOptions(mmr);
    const attachment = await buildMMRImage({ mmrdata: mmr });

    const response = await interaction.reply({
      files: [attachment],
      components: [this.buildActionRow(seasonsComponents, region, name, tag, seasonsComponents[0]?.value)],
    });
  }

  private async fetchMMRData(name: string, tag: string, region: Region) {
    return fetchOrSet<MMRDataV2Data | null>(
      rKey("valorant", "mmr", name, tag, region),
      async () => {
        const res = await getMMRDataV2(region, name, tag).catch(() => null);
        return res?.success ? res.data : null;
      },
      60 * 60 * 24
    );
  }

  private buildSeasonOptions(mmr: MMRDataV2Data) {
    const seasonsValues = Object.entries(mmr.by_season).filter(
      (item) =>
        !item[1].error &&
        typeof item[1].wins === "number" &&
        item[1].wins !== 0
    );

    return seasonsValues.map(([season, data]) => {
      const cRank = data.old
        ? old_ranks[data.final_rank]
        : ranks[data.final_rank];
      const emoji = cRank.discordid?.substring(2, cRank.discordid.length - 1).split(":") || ["❔", ""];

      return {
        label: season,
        value: season,
        description: `${data.act_rank_wins[0].patched_tier}`,
        emoji: { name: emoji[0], id: emoji[1] },
      };
    });
  }

  private buildActionRow(seasonsComponents: ReturnType<typeof this.buildSeasonOptions>, region: Region, name: string, tag: string, seasonId?: string) {
    const seasonIdRegex = /^E(\d+)A(\d+)$/;
    const seasonIdMatch = seasonIdRegex.exec(seasonId || "");
    const season = seasonIdMatch ? `Episode ${seasonIdMatch[1]} Act ${seasonIdMatch[2]}` : "Select an Episode/Act";
    const select = new StringSelectMenuBuilder()
      .setCustomId(`local:mmr:${region}:${name}:${tag}`)
      .setPlaceholder(season)
      .addOptions(seasonsComponents)
      .setDisabled(!seasonsComponents.length);

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
  }

  async collector(interaction: Interaction, subcommand: string) {
    if (interaction.isStringSelectMenu() && subcommand === "mmr") return this.handleMMRSelectMenu(interaction);
    if (interaction.isStringSelectMenu() && subcommand === "stats") return this.handleStatsSelectMenu(interaction);
    throw new Error("Method not implemented.");
  }

  private async handleMMRSelectMenu(interaction: StringSelectMenuInteraction) {
    if (!interaction.isStringSelectMenu()) return;

    const [region, name, tag] = interaction.customId.split(":").slice(2);
    const mmr = await this.fetchMMRData(name, tag, region as Region);

    if (!mmr) {
      return interaction.editReply({ content: "No data found for this player.", components: [] });
    }

    const seasonId = interaction.values[0];
    const attachment = await buildMMRImage({ mmrdata: mmr, seasonid: seasonId });
    await interaction.editReply({ files: [attachment], components: [this.buildActionRow(this.buildSeasonOptions(mmr), region as Region, name, tag, seasonId)] });
  }

  private async handleLink(interaction: ChatInputCommandInteraction) {
    const username = interaction.options.getString("username", true);

    if (!this.validateUsername(username)) {
      return this.sendErrorEmbed(
        interaction,
        "Valorant Link",
        "Invalid username. Please provide a valid Valorant username."
      );
    }

    const [name, tag] = username.split("#");
    const account = await this.fetchValorantAccount(name, tag);

    if (!account?.success) {
      return this.sendErrorEmbed(
        interaction,
        "Valorant Link",
        "No data found for this player."
      );
    }

    const profile = await this.linkValorantAccount(interaction, account.data);

    if (!profile) {
      return this.sendErrorEmbed(
        interaction,
        "Valorant Link",
        "An error occurred while linking your Valorant account."
      );
    }

    return this.sendLinkSuccessEmbed(interaction, account.data);
  }

  private async fetchValorantAccount(name: string, tag: string) {
    return getAccountDataV2(name, tag).catch(() => null);
  }

  private async linkValorantAccount(interaction: ChatInputCommandInteraction, account: AccountDataV2) {
    return this.client.db.valorantUser.upsert({
      where: { puuid: account.puuid, userId: interaction.user.id },
      create: {
        puuid: account.puuid,
        tag: account.name,
        tagLine: account.tag,
        userId: interaction.user.id,
        region: account.region as Region,
        platforms: account.platforms,
      },
      update: {
        tag: account.name,
        tagLine: account.tag,
        userId: interaction.user.id,
        region: account.region as Region,
        platforms: account.platforms,
      },
    }).catch(() => null);
  }

  private async handleUnlink(interaction: ChatInputCommandInteraction) {
    const username = interaction.options.getString("username", true);

    if (!this.validateUsername(username)) {
      return this.sendErrorEmbed(
        interaction,
        "Valorant Unlink",
        "Invalid username. Please provide a valid Valorant username."
      );
    }

    const [name, tag] = username.split("#");
    const account = await this.client.db.valorantUser.findFirst({
      where: { tag: name, tagLine: tag, userId: interaction.user.id },
    });

    if (!account) {
      return this.sendErrorEmbed(
        interaction,
        "Valorant Unlink",
        "No account found for this player."
      );
    }

    await this.unlinkValorantAccount(interaction, account);
    return this.sendUnlinkSuccessEmbed(interaction);
  }

  private async unlinkValorantAccount(interaction: ChatInputCommandInteraction, account: ValorantUser) {
    await this.client.db.valorantUser.delete({
      where: { puuid: account.puuid, userId: interaction.user.id },
    });
  }

  // Helper method to send error embed
  private sendErrorEmbed(
    interaction: ChatInputCommandInteraction,
    title: string,
    description: string
  ) {
    const embed = createEmbed()
      .setTitle(title)
      .setDescription(description)
      .setColor("#F75555");
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Helper method to send link success embed
  private sendLinkSuccessEmbed(interaction: ChatInputCommandInteraction, account: AccountDataV2) {
    const embed = createEmbed()
      .setTitle("Valorant Link")
      .setDescription("Your Valorant account has been linked successfully.")
      .setThumbnail(`https://media.valorant-api.com/playercards/${account.card}/displayicon.png`)
      .addField("Username", `${account.name}#${account.tag}`, true)
      .addField("Region", account.region, true)
      .addField("Platforms", account.platforms.join(", "), true)
      .setColor("#F75555");
    
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Helper method to send unlink success embed
  private sendUnlinkSuccessEmbed(interaction: ChatInputCommandInteraction) {
    const embed = createEmbed()
      .setTitle("Valorant Unlink")
      .setDescription("Your Valorant account has been unlinked successfully.")
      .setColor("#F75555");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  private async handleStats(interaction: ChatInputCommandInteraction) {
    const username = interaction.options.getString("username", true);
    const region = (interaction.options.getString("region") as Region) || Region.na;
    const platform = (interaction.options.getString("platform") as ValorantPlatform) || "pc";

    if (!this.validateUsername(username)) {
      return this.sendErrorEmbed(
        interaction,
        "Valorant Stats",
        "Invalid username. Please provide a valid Valorant username."
      );
    }

    const [name, tag] = username.split("#");

    const profile = await fetchOrSet<AccountDataV2 | null>(
      rKey("valorant", "profile", name, tag),
      async () => {
        const res = await getAccountDataV2(name, tag).catch(() => null);
        return res?.success ? res.data : null;
      },
      60 * 60 * 24
    );

    if (!profile) {
      return this.sendErrorEmbed(
        interaction,
        "Valorant Stats",
        "No data found for this player."
      );
    }

    const matchlist = await getMatchHistoryV4(region, platform, name, tag).catch(() => null);
    if (!matchlist?.success) {
      return this.sendErrorEmbed(
        interaction,
        "Valorant Stats",
        "No data found for this player."
      );
    }

    this.client.logger.debug(`Valorant Stats: ${name}#${tag}`, matchlist.data[0].players[0]);

    const select = this.handleStatsSelector(matchlist.data, profile.puuid, region, name, tag);

    return interaction.reply({
      embeds: [],
      components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)],
    });
  };

  private async handleStatsEmbed(match: MatchHistoryV4Data, puuid: string) {
    const emojiMode = gamemodes.find((mode) => mode.name === match.metadata.queue.name)?.emoji;
    console.log(match.metadata.map)
    const emojiMap = map_emojis.find((map) => map.name === match.metadata.map.name)?.emoticon;
    const embed = createEmbed()
      .setTitle(`Game | ID: ${match.metadata.match_id}`)
      .setDescription(`${formatEmoji(emojiMode)} ${match.metadata.queue.name} | ${match.metadata.map.name} | ${moment(match.metadata.started_at).format("lll")}`)
      .setColor("#F75555");

    match.players.sort((a, b) => b.stats.score - a.stats.score);

    const winner = match.teams.find((team) => team.won)?.team_id;
    const teamOne = match.players.filter((player) => player.team_id === winner);
    const teamTwo = match.players.filter((player) => player.team_id !== winner);

    embed.addField(
      `${winner === teamOne[0].team_id ? "🏆 " : ""}Team ${teamOne[0].team_id}`,
      teamOne.map((player) => {
        const name = `${player.name}#${player.tag}`;
        const agent = player.agent.name;
        const score = player.stats.score;
        const kda = `${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}`;
        const emojiRank = ranks[player.tier.id];
        const emojiAgent = emojis.find((emoji) => emoji.name.toLowerCase() === agent.toLowerCase());

        return `${emojiAgent ? `${formatEmoji(emojiAgent)}` : agent} | ${emojiRank.discordid} ${puuid === player.puuid ? `__${name}__` : name} | Score: ${score} | KDA: ${kda}`;
      }).join("\n"),
    )

    embed.addField(
      `${winner === teamTwo[0].team_id ? "🏆 " : ""}Team ${teamTwo[0].team_id}`,
      teamTwo.map((player) => {
        const name = `${player.name}#${player.tag}`;
        const agent = player.agent.name;
        const score = player.stats.score;
        const kda = `${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}`;
        const emojiRank = ranks[player.tier.id];
        const emojiAgent = emojis.find((emoji) => emoji.name.toLowerCase() === agent.toLowerCase());

        return `${emojiAgent ? `${formatEmoji(emojiAgent)}` : agent} | ${emojiRank.discordid} ${puuid === player.puuid ? `__${name}__` : name} | Score: ${score} | KDA: ${kda}`;
      }).join("\n"),
    )

    return embed;
  };

  private handleStatsSelector(matchHistory: MatchHistoryV4Data[], puuid: string, region: Region, name: string, tag: string) {
    const components = [];

    for (const match of matchHistory) {
      const self = match?.players?.find((player) => player.puuid === puuid);

      components.push({
        label: match.metadata.match_id,
        value: match.metadata.match_id,
        description: `${match.metadata.map.name} | ${match.metadata.queue.name}${self ? ` | ${self.agent.name}` : ""} | ${moment(match.metadata.started_at).format("lll")}`,
        emoji: Object.values(gamemodes).find((mode) => mode.name === match.metadata.queue.name)?.emoji,
      })
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId(`local:stats:${region}:${name}:${tag}:${puuid}`)
      .setPlaceholder("Select a match")
      .addOptions(components)
      .setDisabled(!components.length);

    return select;
  };

  private async handleStatsSelectMenu(interaction: StringSelectMenuInteraction) {
    if (!interaction.isStringSelectMenu()) return;

    const [region, name, tag, puuid] = interaction.customId.split(":").slice(2);
    const matchList = await getMatchHistoryV4(region as Region, "pc", name, tag).catch(() => null);
    if (!matchList?.success) {
      return interaction.editReply({ content: "No data found for this player.", components: [] });
    }

    const matchId = interaction.values[0];
    const matchData = matchList.data.find((match) => match.metadata.match_id === matchId);

    if (!matchData) {
      return interaction.editReply({ content: "No data found for this match.", components: [] });
    }

    const matchEmbed = await this.handleStatsEmbed(matchData, puuid);
    const matchComponents = this.handleStatsSelector(matchList.data, puuid, region as Region, name, tag);
    await interaction.editReply({ embeds: [matchEmbed], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(matchComponents)] });
  };
}