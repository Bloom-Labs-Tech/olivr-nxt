import type { PlayerEvents } from 'discord-music-player';
import type { ClientEvents, InteractionResponse, Message } from 'discord.js';
import { OliverBot } from './olivrClient';

export type OliverEventEmitterType = "client" | "player";
export type OliverEventType<T extends OliverEventEmitterType> = T extends "client" ? ClientEvents : PlayerEvents;
type OliverEventOptions = {
  runOnce: boolean;
};
type OliverEventExecuteParams<K extends keyof T, T> = T extends ClientEvents ? ClientEvents[K & keyof ClientEvents] : PlayerEvents[K & keyof PlayerEvents];

const defaultOptions: OliverEventOptions = {
  runOnce: false,
};

export abstract class OliverEvent<K extends keyof T, E extends OliverEventEmitterType, T = OliverEventType<E>> {
  public readonly name: K;
  public readonly runOnce: boolean;
  public readonly client = OliverBot.getInstance();
  public readonly emitter: E;

  constructor(name: K, emitter: E, options?: Partial<OliverEventOptions>) {
    this.name = name;
    this.emitter = emitter;
    this.runOnce = this.parseOption('runOnce', options);
  }

  private parseOption<T extends keyof OliverEventOptions>(option: T, options?: Partial<OliverEventOptions>): OliverEventOptions[T] {
    return options?.[option] !== undefined ? options[option] : defaultOptions[option];
  }

  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  public  async execute(..._args: OliverEventExecuteParams<K, T>): Promise<void | InteractionResponse | null | Message> {
    throw new Error('Method not implemented.');
  }
}