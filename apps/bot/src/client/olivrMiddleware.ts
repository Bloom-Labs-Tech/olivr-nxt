import type { CommandInteraction } from 'discord.js';
import { client } from '~/index';

export class OliverMiddleware {
  public readonly client = client;

  public async run(_: CommandInteraction): Promise<boolean> {
    return true;
  }
}