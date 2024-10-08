import type { MMRDataV2Data } from '@ivanoliverfabra/valorant-api';
import Canvas from '@napi-rs/canvas';
import axios from 'axios';
import { AttachmentBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { brotliDecompressSync } from 'zlib';

Canvas.GlobalFonts.registerFromPath('assets/fonts/product_sans.ttf', 'product_sans');
Canvas.GlobalFonts.registerFromPath('assets/fonts/valorant_font.ttf', 'valorant_font');
Canvas.GlobalFonts.registerFromPath('assets/fonts/umeboshi_.ttf', 'japan2');
Canvas.GlobalFonts.registerFromPath('assets/fonts/anton.ttf', 'anton');
Canvas.GlobalFonts.registerFromPath('assets/fonts/DINNextLTPro-Bold.ttf', 'DinNext');

let valpapiagents = await axios.get('https://valorant-api.com/v1/agents?isPlayableCharacter=true').catch(error => {
  return error;
});
let valpapigamemodes = await axios.get('https://valorant-api.com/v1/gamemodes').catch(error => {
  return error;
});
let crosshairs = await axios.get('https://www.vcrdb.net/apiv3/get').catch(error => {
  return error;
});
let valpapicompetitive = await axios.get('https://valorant-api.com/v1/competitivetiers').catch(e => e);

setInterval(async () => {
  valpapiagents = await axios.get('https://valorant-api.com/v1/agents?isPlayableCharacter=true').catch(e => e);
  valpapigamemodes = await axios.get('https://valorant-api.com/v1/gamemodes').catch(e => e);
  valpapicompetitive = await axios.get('https://valorant-api.com/v1/competitivetiers').catch(e => e);
  crosshairs = await axios.get('https://www.vcrdb.net/apiv3/get').catch(error => {
    return error;
  });
}, 60000 * 5); // 5 minutes

export const clusters = {
  na: {
    status: 'https://api.henrikdev.xyz/valorant/v1/status/na',
    page: 'https://status.riotgames.com/valorant?region=na',
  },
  latam: {
    status: 'https://api.henrikdev.xyz/valorant/v1/status/latam',
    page: 'https://status.riotgames.com/valorant?region=latam',
  },
  br: {
    status: 'https://api.henrikdev.xyz/valorant/v1/status/br',
    page: 'https://status.riotgames.com/valorant?region=br',
  },
  eu: {
    status: 'https://api.henrikdev.xyz/valorant/v1/status/eu',
    page: 'https://status.riotgames.com/valorant?region=eu',
  },
  kr: {
    status: 'https://api.henrikdev.xyz/valorant/v1/status/kr',
    page: 'https://status.riotgames.com/valorant?region=kr',
  },
  ap: {
    status: 'https://api.henrikdev.xyz/valorant/v1/status/ap',
    page: 'https://status.riotgames.com/valorant?region=ap',
  },
  oce: {
    status: 'https://api.henrikdev.xyz/valorant/v1/status/ap',
    page: 'https://status.riotgames.com/valorant?region=ap',
  },
};
export const weapons = {
  'EWallPenetrationDisplayType::High': 'High',
  'EWallPenetrationDisplayType::Medium': 'Medium',
  'EWallPenetrationDisplayType::Low': 'Low',
};
export const maps: Record<string, string> = {
  '/Game/Maps/Triad/Triad': 'Haven',
  '/Game/Maps/Port/Port': 'Icebox',
  '/Game/Maps/Duality/Duality': 'Bind',
  '/Game/Maps/Bonsai/Bonsai': 'Split',
  '/Game/Maps/Ascent/Ascent': 'Ascent',
  '/Game/Maps/Foxtrot/Foxtrot': 'Breeze',
  '/Game/Maps/Canyon/Canyon': 'Fracture',
  '/Game/Maps/Pitt/Pitt': 'Pearl',
  '/Game/Maps/Jam/Jam': 'Lotus',
  '/Game/Maps/Juliett/Juliett': 'Sunset',
  '/Game/Maps/HURM/HURM_Alley/HURM_Alley': 'District',
  '/Game/Maps/HURM/HURM_Bowl/HURM_Bowl': 'Kasbah',
  '/Game/Maps/HURM/HURM_Yard/HURM_Yard': 'Piazza',
};
export const getGamemodes = () => {
  return valpapigamemodes.data.data;
};
export const getAgents = () => {
  return valpapiagents.data.data;
};
export const getCrosshairs = () => {
  return crosshairs.data;
};
export const getCompetitiveTiers = () => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return  valpapicompetitive.data.data.find((i: any) => i.uuid === '03621f52-342b-cf4e-4f86-9350a49c6d04').tiers;
};
export const getCustomBackground = (uuid: string) => {
  return brotliDecompressSync(Uint8Array.from(readFileSync(`./settings/backgrounds/${uuid}.png`)));
};

export const agents = [{ name: "Astra", id: "41fb69c1-4189-7b37-f117-bcaf1e96f1bf", discord_id: "<:controller:868803058711277598>" }, { name: "Breach", id: "5f8d3a7f-467b-97f3-062c-13acf203c006", discord_id: "<:initiator:868802616732303362>" }, { name: "Brimstone", id: "9f0d8ba9-4140-b941-57d3-a7ad57c6b417", discord_id: "<:controller:868803058711277598>" }, { name: "Cypher", id: "117ed9e3-49f3-6512-3ccf-0cada7e3823b", discord_id: "<:sentinel:868802869967597568>" }, { name: "Deadlock", id: "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235", discord_id: "<:sentinel:868802869967597568>" }, { name: "Fade", id: "dade69b4-4f5a-8528-247b-219e5a1facd6", discord_id: "<:initiator:868802616732303362>" }, { name: "Jett", id: "add6443a-41bd-e414-f6ad-e58d267f4e95", discord_id: "<:duelist:868802702258352178>" }, { name: "Omen", id: "8e253930-4c05-31dd-1b6c-968525494517", discord_id: "<:controller:868803058711277598>" }, { name: "Phoenix", id: "eb93336a-449b-9c1b-0a54-a891f7921d69", discord_id: "<:duelist:868802702258352178>" }, { name: "Raze", id: "f94c3b30-42be-e959-889c-5aa313dba261", discord_id: "<:duelist:868802702258352178>" }, { name: "Sage", id: "569fdd95-4d10-43ab-ca70-79becc718b46", discord_id: "<:sentinel:868802869967597568>" }, { name: "Sova", id: "320b2a48-4d9b-a075-30f1-1f93a9b638fa", discord_id: "<:initiator:868802616732303362>" }, { name: "Viper", id: "707eab51-4836-f488-046a-cda6bf494859", discord_id: "<:controller:868803058711277598>" }, { name: "Reyna", id: "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc", discord_id: "<:duelist:868802702258352178>" }, { name: "Killjoy", id: "1e58de9c-4950-5125-93e9-a0aee9f98746", discord_id: "<:sentinel:868802869967597568>" }, { name: "Skye", id: "6f2a04ca-43e0-be17-7f36-b3908627744d", discord_id: "<:initiator:868802616732303362>" }, { name: "Yoru", id: "7f94d92c-4234-0a36-9646-3a87eb8b5c89", discord_id: "<:duelist:868802702258352178>" }, { name: "Kay/O", id: "601dbbe7-43ce-be57-2a40-4abd24953621", discord_id: "<:initiator:868802616732303362>" }, { name: "Chamber", id: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7", discord_id: "<:initiator:868802616732303362>" }, { name: "Neon", id: "bb2a4828-46eb-8cd1-e765-15848195d751", discord_id: "<:duelist:868802702258352178>" }, { name: "Harbor", id: "95b78ed7-463786d9-7e4171ba-8c293152", discord_id: "<:controller:868803058711277598>" }, { name: "Gekko", id: "e370fa57-4757-3604-3648-499e1f642d3f", discord_id: "<:initiator:868802616732303362>" }, { name: "Iso", id: "0e38b510-41a8-5780-5e8f-568b2a4f2d6c", discord_id: "<:duelist:868802702258352178>" }];
export const gamemodes = [{ name: "Escalation", path: "escalation.png", emoji: { name: "escalation", id: "1292237945100570654", animated: false } }, { name: "Swiftplay", path: "swiftplay.png", emoji: { name: "swiftplay", id: "1292237747888586872", animated: false } }, { name: "Spike Rush", path: "spikerush.png", emoji: { name: "spikerush", id: "1292237748773851248", animated: false } }, { name: "Deathmatch", path: "deathmatch.png", emoji: { name: "deathmatch", id: "1292238053779312772", animated: false } }, { name: "Competitive", path: "competitive.png", emoji: { name: "unrated", id: "1292234241513357504", animated: false } }, { name: "Unrated", path: "unrated.png", emoji: { name: "unrated", id: "1292234241513357504", animated: false } }, { name: "Replication", path: "replication.png", emoji: { name: "replication", id: "1292237750984249396", animated: false } }, { name: "Custom Game", path: "unrated.png", emoji: { name: "unrated", id: "1292237754125647952", animated: false } }, { name: "New Map", path: "unrated.png", emoji: { name: "unrated", id: "1292234241513357504", animated: false } }, { name: "Snowball Fight", path: "snowball.png", emoji: { name: "snowball", id: "1292237751856533625", animated: false } }, { name: "Team Deathmatch", path: "teamdeathmatch.png", emoji: { name: "teamdeathmatch", id: "1292237749243478056", animated: false } }];
export const ranks = [
  { mmr: "assets/background/VALORANT_mmr.png", color: "#c5c5c5", discordid: "<:unrated:1292237754125647952>", graydiscordid: "<:unrated_gray:1292237750526935181>" },
  { mmr: "assets/background/VALORANT_mmr_iron.png", color: "#5a5959", discordid: "<:iron1:1292237949978546287>", graydiscordid: "<:iron_gray:1292237753471205498>" },
  { mmr: "assets/background/VALORANT_mmr_iron.png", color: "#5a5959", discordid: "<:iron2:1292237951278776320>", graydiscordid: "<:iron_gray:1292237753471205498>" },
  { mmr: "assets/background/VALORANT_mmr_iron.png", color: "#5a5959", discordid: "<:iron3:1292237949051732042>", graydiscordid: "<:iron_gray:1292237753471205498>" },
  { mmr: "assets/background/VALORANT_mmr_bronze.png", color: "#924e30", discordid: "<:bronze1:1292238054253269042>", graydiscordid: "<:bronze_gray:1292238055851163811>" },
  { mmr: "assets/background/VALORANT_mmr_bronze.png", color: "#924e30", discordid: "<:bronze2:1292237945385779330>", graydiscordid: "<:bronze_gray:1292238055851163811>" },
  { mmr: "assets/background/VALORANT_mmr_bronze.png", color: "#924e30", discordid: "<:bronze3:1292237955070689361>", graydiscordid: "<:bronze_gray:1292238055851163811>" },
  { mmr: "assets/background/VALORANT_mmr_silver.png", color: "#c5c4c4", discordid: "<:silver1:1292237750212497478>", graydiscordid: "<:silver_gray:1292237950347907113>" },
  { mmr: "assets/background/VALORANT_mmr_silver.png", color: "#c5c4c4", discordid: "<:silver2:1292237749637877831>", graydiscordid: "<:silver_gray:1292237950347907113>" },
  { mmr: "assets/background/VALORANT_mmr_silver.png", color: "#c5c4c4", discordid: "<:silver3:1292237755677413516>", graydiscordid: "<:silver_gray:1292237950347907113>" },
  { mmr: "assets/background/VALORANT_mmr_gold.png", color: "#dbb815", discordid: "<:gold1:1292237948644757654>", graydiscordid: "<:gold_gray:1292238054576361503>" },
  { mmr: "assets/background/VALORANT_mmr_gold.png", color: "#dbb815", discordid: "<:gold2:1292237945293639793>", graydiscordid: "<:gold_gray:1292238054576361503>" },
  { mmr: "assets/background/VALORANT_mmr_gold.png", color: "#dbb815", discordid: "<:gold3:1292237951811584073>", graydiscordid: "<:gold_gray:1292238054576361503>" },
  { mmr: "assets/background/VALORANT_mmr_platinum.png", color: "#38abc2", discordid: "<:plat1:1292238059407937639>", graydiscordid: "<:platinum_gray:1292238054974554237>" },
  { mmr: "assets/background/VALORANT_mmr_platinum.png", color: "#38abc2", discordid: "<:plat2:1292237752300994570>", graydiscordid: "<:platinum_gray:1292238054974554237>" },
  { mmr: "assets/background/VALORANT_mmr_platinum.png", color: "#38abc2", discordid: "<:plat3:1292237748522061974>", graydiscordid: "<:platinum_gray:1292238054974554237>" },
  { mmr: "assets/background/VALORANT_mmr_diamond.png", color: "#bb77f0", discordid: "<:dia1:1292237945989758996>", graydiscordid: "<:diamond_gray:1292238056325255224>" },
  { mmr: "assets/background/VALORANT_mmr_diamond.png", color: "#bb77f0", discordid: "<:dia2:1292237950842568755>", graydiscordid: "<:diamond_gray:1292238056325255224>" },
  { mmr: "assets/background/VALORANT_mmr_diamond.png", color: "#bb77f0", discordid: "<:dia3:1292238055536590911>", graydiscordid: "<:diamond_gray:1292238056325255224>" },
  { mmr: "assets/background/VALORANT_mmr_ascendant.png", color: "#6ae2af", discordid: "<:ascendant1:1292237952272826399>", graydiscordid: "<:ascendant_gray:1292238058728722674>" },
  { mmr: "assets/background/VALORANT_mmr_ascendant.png", color: "#6ae2af", discordid: "<:ascendant2:1292238057877278806>", graydiscordid: "<:ascendant_gray:1292238058728722674>" },
  { mmr: "assets/background/VALORANT_mmr_ascendant.png", color: "#6ae2af", discordid: "<:ascendant3:1292238056509931614>", graydiscordid: "<:ascendant_gray:1292238058728722674>" },
  { mmr: "assets/background/VALORANT_mmr_immortal.png", color: "#da3f76", discordid: "<:immortal1:1292237947575468152>", graydiscordid: "<:immortal_gray:1292238062755123331>" },
  { mmr: "assets/background/VALORANT_mmr_immortal.png", color: "#da3f76", discordid: "<:immortal2:1292237754951929879>", graydiscordid: "<:immortal_gray:1292238062755123331>" },
  { mmr: "assets/background/VALORANT_mmr_immortal.png", color: "#da3f76", discordid: "<:immortal3:1292237946451263599>", graydiscordid: "<:immortal_gray:1292238062755123331>" },
  { mmr: "assets/background/VALORANT_mmr_radiant.png", color: "#d3d058", discordid: "<:radiant:1292237751457943603>", graydiscordid: "<:radiant_gray:1292238057365307412>" }
];
export const map_emojis = [
  { name: "Haven", emoticon: ":triangular_flag_on_post:" },
  { name: "Icebox", emoticon: ":snowflake:" },
  { name: "Bind", emoticon: ":chains:" },
  { name: "Split", emoticon: ":scissors:" },
  { name: "Ascent", emoticon: ":mountain:" },
  { name: "Breeze", emoticon: ":wind_face:" },
  { name: "Fracture", emoticon: ":head_bandage:" },
  { name: "Pearl", emoticon: ":gem:" },
  { name: "Lotus", emoticon: ":lotus:" },
  { name: "Sunset", emoticon: ":sunset:" },
  { name: "District", emoticon: ":cityscape:" },
  { name: "Kasbah", emoticon: ":desert:" },
  { name: "Piazza", emoticon: ":fountain:" }
];
export const old_ranks = [
  { mmr: "assets/background/VALORANT_mmr.png", color: "#c5c5c5", discordid: "<:unrated:1292237754125647952>" },
  { mmr: "assets/background/VALORANT_mmr_iron.png", color: "#5a5959", discordid: "<:iron1:1292237949978546287>" },
  { mmr: "assets/background/VALORANT_mmr_iron.png", color: "#5a5959", discordid: "<:iron2:1292237951278776320>" },
  { mmr: "assets/background/VALORANT_mmr_iron.png", color: "#5a5959", discordid: "<:iron3:1292237949051732042>" },
  { mmr: "assets/background/VALORANT_mmr_bronze.png", color: "#924e30", discordid: "<:bronze1:1292238054253269042>" },
  { mmr: "assets/background/VALORANT_mmr_bronze.png", color: "#924e30", discordid: "<:bronze2:1292237945385779330>" },
  { mmr: "assets/background/VALORANT_mmr_bronze.png", color: "#924e30", discordid: "<:bronze3:1292237955070689361>" },
  { mmr: "assets/background/VALORANT_mmr_silver.png", color: "#c5c4c4", discordid: "<:silver1:1292237750212497478>" },
  { mmr: "assets/background/VALORANT_mmr_silver.png", color: "#c5c4c4", discordid: "<:silver2:1292237749637877831>" },
  { mmr: "assets/background/VALORANT_mmr_silver.png", color: "#c5c4c4", discordid: "<:silver3:1292237755677413516>" },
  { mmr: "assets/background/VALORANT_mmr_gold.png", color: "#dbb815", discordid: "<:gold1:1292237948644757654>" },
  { mmr: "assets/background/VALORANT_mmr_gold.png", color: "#dbb815", discordid: "<:gold2:1292237945293639793>" },
  { mmr: "assets/background/VALORANT_mmr_gold.png", color: "#dbb815", discordid: "<:gold3:1292237951811584073>" },
  { mmr: "assets/background/VALORANT_mmr_platinum.png", color: "#38abc2", discordid: "<:plat1:1292238059407937639>" },
  { mmr: "assets/background/VALORANT_mmr_platinum.png", color: "#38abc2", discordid: "<:plat2:1292237752300994570>" },
  { mmr: "assets/background/VALORANT_mmr_platinum.png", color: "#38abc2", discordid: "<:plat3:1292237748522061974>" },
  { mmr: "assets/background/VALORANT_mmr_diamond.png", color: "#bb77f0", discordid: "<:dia1:1292237945989758996>" },
  { mmr: "assets/background/VALORANT_mmr_diamond.png", color: "#bb77f0", discordid: "<:dia2:1292237950842568755>" },
  { mmr: "assets/background/VALORANT_mmr_diamond.png", color: "#bb77f0", discordid: "<:dia3:1292238055536590911>" },
  { mmr: "assets/background/VALORANT_mmr_immortal.png", color: "#da3f76", discordid: "<:immortal1:1292237947575468152>" },
  { mmr: "assets/background/VALORANT_mmr_immortal.png", color: "#da3f76", discordid: "<:immortal2:1292237754951929879>" },
  { mmr: "assets/background/VALORANT_mmr_immortal.png", color: "#da3f76", discordid: "<:immortal3:1292237946451263599>" },
  { mmr: "assets/background/VALORANT_mmr_radiant.png", color: "#d3d058", discordid: "<:radiant:1292237751457943603>" }
];
export const emojis = [{ name: "swiftplay", id: "1292237747888586872", animated: false }, { name: "plat3", id: "1292237748522061974", animated: false }, { name: "spikerush", id: "1292237748773851248", animated: false }, { name: "teamdeathmatch", id: "1292237749243478056", animated: false }, { name: "silver2", id: "1292237749637877831", animated: false }, { name: "silver1", id: "1292237750212497478", animated: false }, { name: "unrated_gray", id: "1292237750526935181", animated: false }, { name: "replication", id: "1292237750984249396", animated: false }, { name: "radiant", id: "1292237751457943603", animated: false }, { name: "snowball", id: "1292237751856533625", animated: false }, { name: "plat2", id: "1292237752300994570", animated: false }, { name: "sentinel", id: "1292237752821354557", animated: false }, { name: "iron_gray", id: "1292237753471205498", animated: false }, { name: "unrated", id: "1292237754125647952", animated: false }, { name: "initiator", id: "1292237754536824974", animated: false }, { name: "immortal2", id: "1292237754951929879", animated: false }, { name: "silver3", id: "1292237755677413516", animated: false }, { name: "escalation", id: "1292237945100570654", animated: false }, { name: "bronze2", id: "1292237945385779330", animated: false }, { name: "gold2", id: "1292237945293639793", animated: false }, { name: "dia1", id: "1292237945989758996", animated: false }, { name: "immortal3", id: "1292237946451263599", animated: false }, { name: "immortal1", id: "1292237947575468152", animated: false }, { name: "gold1", id: "1292237948644757654", animated: false }, { name: "iron3", id: "1292237949051732042", animated: false }, { name: "duelist", id: "1292237949521498173", animated: false }, { name: "iron1", id: "1292237949978546287", animated: false }, { name: "silver_gray", id: "1292237950347907113", animated: false }, { name: "dia2", id: "1292237950842568755", animated: false }, { name: "iron2", id: "1292237951278776320", animated: false }, { name: "gold3", id: "1292237951811584073", animated: false }, { name: "ascendant1", id: "1292237952272826399", animated: false }, { name: "bronze3", id: "1292237955070689361", animated: false }, { name: "deathmatch", id: "1292238053779312772", animated: false }, { name: "bronze1", id: "1292238054253269042", animated: false }, { name: "gold_gray", id: "1292238054576361503", animated: false }, { name: "platinum_gray", id: "1292238054974554237", animated: false }, { name: "dia3", id: "1292238055536590911", animated: false }, { name: "bronze_gray", id: "1292238055851163811", animated: false }, { name: "diamond_gray", id: "1292238056325255224", animated: false }, { name: "ascendant3", id: "1292238056509931614", animated: false }, { name: "controller", id: "1292238056799207475", animated: false }, { name: "radiant_gray", id: "1292238057365307412", animated: false }, { name: "ascendant2", id: "1292238057877278806", animated: false }, { name: "ascendant_gray", id: "1292238058728722674", animated: false }, { name: "plat1", id: "1292238059407937639", animated: false }, { name: "immortal_gray", id: "1292238062755123331", animated: false }, { name: "astra", id: "1292326553321213962", animated: false }, { name: "breach", id: "1292326554319458426", animated: false }, { name: "brimstone", id: "1292326555162513521", animated: false }, { name: "chamber", id: "1292326555967684630", animated: false }, { name: "clove", id: "1292326556785709097", animated: false }, { name: "cypher", id: "1292326557574238259", animated: false }, { name: "deadlock", id: "1292326558429872179", animated: false }, { name: "fade", id: "1292326559159681035", animated: false }, { name: "gekko", id: "1292326560166314026", animated: false }, { name: "harbour", id: "1292326561378472047", animated: false }, { name: "iso", id: "1292326562154283068", animated: false }, { name: "jett", id: "1292326563416772679", animated: false }, { name: "kayo", id: "1292326564310028389", animated: false }, { name: "killjoy", id: "1292326565199478835", animated: false }, { name: "neon", id: "1292326566109511732", animated: false }, { name: "omen", id: "1292326567036583936", animated: false }, { name: "phoenix", id: "1292326567308951705", animated: false }, { name: "raze", id: "1292326568286355547", animated: false }, { name: "reyna", id: "1292326568638808116", animated: false }, { name: "sage", id: "1292326569729069138", animated: false }, { name: "skye", id: "1292326570807267328", animated: false }, { name: "sova", id: "1292326571750719528", animated: false }, { name: "viper", id: "1292326572547899535", animated: false }, { name: "vyse", id: "1292326573281775717", animated: false }, { name: "yoru", id: "1292326573994676296", animated: false }];

interface BuildMMRImageParams {
  mmrdata: MMRDataV2Data;
  bgcanvas?: Canvas.Canvas;
  seasonid?: string;
}

export const buildBackground = async (data: string, type: string) => {
  const canvas = Canvas.createCanvas(3840, 2160);
  const ctx = canvas.getContext('2d');
  const background = await Canvas.loadImage(data);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  const stats = await Canvas.loadImage(`assets/background/VALORANT_${type}_template.png`);
  ctx.drawImage(stats, 0, 0, canvas.width, canvas.height);
  return canvas;
};

export const buildText = async ({ctx, text, size, x, y, color, align, font, rotate}: {
  ctx: Canvas.SKRSContext2D;
  text: string;
  size: number;
  x: number;
  y: number;
  color?: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  align?: any;
  font?: string;
  rotate?: boolean;
}) => {
  ctx.font = `${size}px ${font ? font : 'DinNext'}`;
  ctx.fillStyle = color ? color : '#ffffff';
  ctx.textAlign = align ? align : 'left';
  if (rotate) {
      ctx.save();
      ctx.translate(200, 1080);
      ctx.rotate(-0.5 * Math.PI);
      ctx.fillText(text, x, y);
  } else {
      ctx.fillText(text, x, y);
  }
};

export const buildMMRImage = async ({
  mmrdata,
  bgcanvas,
  seasonid,
}: BuildMMRImageParams): Promise<AttachmentBuilder> => {
  const canvas = Canvas.createCanvas(3840, 2160);
  const ctx = canvas.getContext('2d');
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let seasonValue: any[];
  let seasonKey: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let  entries: [string, any] | undefined;

  if (!seasonid) {
    entries = Object.entries(mmrdata.by_season).find(
      (item) => !item[1].error && item[1].wins !== 0
    );
    if (entries === undefined) console.error(mmrdata.by_season);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    seasonValue = entries?.[1].act_rank_wins.filter((item: any) => item.tier !== 0);
    seasonKey = entries?.[0] || '';
  } else {
    entries = Object.entries(mmrdata.by_season).find(
      (item) => item[0] === seasonid && item[1].wins !== 0
    );
    if (entries === undefined) console.error(mmrdata.by_season);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    seasonValue = entries?.[1].act_rank_wins.filter((item: any) => item.tier !== 0);
    seasonKey = entries?.[0] || '';
  }

  const multiplier = {
    triangle: 1.25,
    x: 1375.5,
    y: 200,
  };

  const background = bgcanvas
    ? bgcanvas
    : await Canvas.loadImage(
        (entries?.[1].old
          ? old_ranks[seasonValue[0]?.tier || 0]
          : ranks[seasonValue[0]?.tier || 0]
        ).mmr
      );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const wins = entries?.[1].wins;
  const color = (entries?.[1].old ? old_ranks[seasonValue[0].tier] : ranks[seasonValue[0].tier])
    .color;

  let border: Canvas.Image;
  if (wins < 9) border = await Canvas.loadImage('assets/mmr/border0.png');
  else if (9 <= wins && wins < 25) border = await Canvas.loadImage('assets/mmr/border1.png');
  else if (25 <= wins && wins < 50) border = await Canvas.loadImage('assets/mmr/border2.png');
  else if (50 <= wins && wins < 75) border = await Canvas.loadImage('assets/mmr/border3.png');
  else if (75 <= wins && wins < 100) border = await Canvas.loadImage('assets/mmr/border4.png');
  else border = await Canvas.loadImage('assets/mmr/border5.png');

  ctx.drawImage(border, 1135, 200, 1765, 1765);

  buildText({
    ctx,
    text: seasonKey.toUpperCase(),
    size: 200,
    x: multiplier.x + ((125 * multiplier.triangle) / 2) * 8.25,
    y: 325,
    color: color,
    align: 'center',
    font: 'anton',
  });

  buildText({
    ctx,
    text: seasonValue[0].patched_tier.toUpperCase(),
    size: 200,
    x: multiplier.x + ((125 * multiplier.triangle) / 2) * 8.25,
    y: 2025,
    color: color,
    align: 'center',
    font: 'anton',
  });

  buildText({
    ctx,
    text: mmrdata.current_data.currenttier_patched,
    size: 125,
    x: 400,
    y: 1245,
    color: color,
    align: 'left',
    font: 'anton',
  });

  buildText({
    ctx,
    text: `${mmrdata.current_data.ranking_in_tier} RR`,
    size: 125,
    x: 675,
    y: 1445,
    color: color,
    align: 'left',
    font: 'anton',
  });

  buildText({
    ctx,
    text: mmrdata.current_data.mmr_change_to_last_game.toString(),
    size: 125,
    x: 800,
    y: 1645,
    color: color,
    align: 'left',
    font: 'anton',
  });

  buildText({
    ctx,
    text: mmrdata.current_data.elo.toString(),
    size: 125,
    x: 325,
    y: 1845,
    color: color,
    align: 'left',
    font: 'anton',
  });

  buildText({
    ctx,
    text: wins.toString(),
    size: 110,
    x: 3700,
    y: 437.5,
    color: color,
    align: 'right',
    font: 'anton',
  });

  buildText({
    ctx,
    text: entries?.[1].number_of_games.toString(),
    size: 110,
    x: 3700,
    y: 737.5,
    color: color,
    align: 'right',
    font: 'anton',
  });

  buildText({
    ctx,
    text: `${((wins / entries?.[1].number_of_games) * 100).toFixed(2)}%`,
    size: 110,
    x: 3700,
    y: 1037.5,
    color: color,
    align: 'right',
    font: 'anton',
  });

  buildText({
    ctx,
    text: seasonValue[0].patched_tier,
    size: 110,
    x: 3700,
    y: 1337.5,
    color: color,
    align: 'right',
    font: 'anton',
  });

  buildText({
    ctx,
    text: seasonValue[seasonValue.length - 1].patched_tier,
    size: 110,
    x: 3700,
    y: 1637.5,
    color: color,
    align: 'right',
    font: 'anton',
  });

  buildText({
    ctx,
    text: entries?.[1].final_rank_patched,
    size: 110,
    x: 3700,
    y: 1937.5,
    color: color,
    align: 'right',
    font: 'anton',
  });

  const squareroot = Math.ceil(Math.sqrt(wins));
  const rowcount = squareroot >= 8 ? 7 : squareroot;

  for (let i = 0; rowcount > i; i++) {
    const tierCount = i * 2 + 1;
    const tiers = seasonValue.splice(0, tierCount);
    for (let k = 0; tiers.length > k; k++) {
      const triangle = `assets/mmr/${tiers[k].tier >= 21 && entries?.[1].old ? tiers[k].tier + 3 : tiers[k].tier}_${k % 2 === 0 ? 'up' : 'down'}.png`;
      const triangleimage = await Canvas.loadImage(triangle);
      const x = (125 * multiplier.triangle) / 2 + 2.75;
      ctx.drawImage(
        triangleimage,
        k * x + (rowcount - i) * x + (multiplier.x + ((125 * multiplier.triangle) / 2) * (7 - rowcount)),
        i * (111 * multiplier.triangle + 2.75) + (multiplier.y + 400),
        125 * multiplier.triangle,
        111 * multiplier.triangle
      );
    }
  }

  return new AttachmentBuilder(canvas.toBuffer("image/png"), { name: 'valorant-mmr.png', description: 'VALORANT LABS MMR' });
};