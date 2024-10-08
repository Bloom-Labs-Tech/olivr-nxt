import type { Message } from "discord.js";
import { OliverEvent } from "~/client";

export default class Event extends OliverEvent<'messageUpdate', 'client'> {
  constructor() {
    super('messageUpdate', 'client');
  }

  async execute(oldMessage: Message, newMessage: Message) {
    if (oldMessage.author.bot) return;
    if (!oldMessage.guild) return;

    this.client.snipes.set(oldMessage.guild.id, newMessage);
    this.client.snipes.set(oldMessage.channel.id, newMessage);
  };
}