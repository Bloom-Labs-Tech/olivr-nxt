import type { CommandInteraction } from 'discord.js';
import { OliverBot } from './olivrClient';

export class OliverMiddleware {
  public readonly client = OliverBot.getInstance();

  public async run(_: CommandInteraction): Promise<boolean> {
    return true;
  }
}