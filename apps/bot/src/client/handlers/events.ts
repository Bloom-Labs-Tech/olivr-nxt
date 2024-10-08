import type { PlayerEvents } from 'discord-music-player';
import type { ClientEvents } from 'discord.js';
import { getFiles } from '~/utils/helpers';
import type { OliverBot } from '../olivrClient';
import { OliverEvent, type OliverEventEmitterType, type OliverEventType } from '../olivrEvent';

export class EventHandler {
  constructor(private client: OliverBot) {}
  private clientEvents: Map<string, OliverEvent<keyof ClientEvents, 'client'>> = new Map();
  private playerEvents: Map<string, OliverEvent<keyof PlayerEvents, 'player'>> = new Map();

  public async registerEvent<T extends OliverEventEmitterType>(event: OliverEvent<keyof OliverEventType<T>, T>): Promise<void> {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const eventHandler = (...args: any[]) =>
      event.execute(...args).catch((error) => this.client.logger.error(`${String(event.name)} error: `, error));

    if (event.emitter === 'client') {
      if (event.runOnce) {
        this.client.once(event.name as keyof ClientEvents, eventHandler);
      } else {
        this.client.on(event.name as keyof ClientEvents, eventHandler);
      }
      this.clientEvents.set(event.name as string, event as OliverEvent<keyof ClientEvents, 'client'>);
    } else if (event.emitter === 'player') {
      if (event.runOnce) {
        this.client.player.once(event.name as keyof PlayerEvents, eventHandler);
      } else {
        this.client.player.on(event.name as keyof PlayerEvents, eventHandler);
      }
      this.playerEvents.set(event.name as string, event as OliverEvent<keyof PlayerEvents, 'player'>);
    }
  }

  public async unregisterEvent<T extends OliverEventEmitterType>(event: OliverEvent<keyof OliverEventType<T>, T>): Promise<void> {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const eventHandler = (...args: any[]) =>
      event.execute(...args).catch((error) => this.client.logger.error(`${String(event.name)} error: `, error));

    if (event.emitter === 'client') {
      this.client.off(event.name as keyof ClientEvents, eventHandler);
      this.clientEvents.delete(event.name as string);
    } else if (event.emitter === 'player') {
      this.client.player.off(event.name as keyof PlayerEvents, eventHandler);
      this.playerEvents.delete(event.name as string);
    }
  }

  public async registerEvents(): Promise<void> {
    const start = Date.now();

    const eventFiles = await getFiles('./src/events');

    for (const file of eventFiles) {
      const relativePath = `../../${file.replace('src/', '')}`;
      try {
        const EventClass = (await import(relativePath)).default;
        if (EventClass && EventClass.prototype instanceof OliverEvent) {
          const event = new EventClass();
          await this.registerEvent(event);
        } else {
          this.client.logger.warn(`Event file ${file} does not export a valid event class`);
        }
      } catch (error) {
        this.client.logger.error(`Failed to register event from file ${file}`, error);
      }
    }

    this.client.logger.info(`Registered ${this.clientEvents.size + this.playerEvents.size} events`);

    const end = Date.now();
    this.client.logger.info(`Event registration took ${end - start}ms`);
  }

  public async unregisterEvents(): Promise<void> {
    for (const event of this.clientEvents.values()) {
      await this.unregisterEvent(event);
    }
    for (const event of this.playerEvents.values()) {
      await this.unregisterEvent(event);
    }
  }

  public async reloadEvents(): Promise<void> {
    await this.unregisterEvents();
    await this.registerEvents();
  }
}