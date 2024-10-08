import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";
import { OliverEvent } from "~/client";

export default class Event extends OliverEvent<'messageDelete', 'client'> {
  constructor() {
    super('messageDelete', 'client');
  }

  async execute(message: OmitPartialGroupDMChannel<Message<true> | PartialMessage>) {
    if (message.author?.bot) return;
    if (!message.guild) return;

    this.client.snipes.set(message.guild.id, message);
    this.client.snipes.set(message.channel.id, message);
  };
}