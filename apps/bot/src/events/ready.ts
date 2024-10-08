import { OliverEvent } from "~/client";

export default class Event extends OliverEvent<"ready", "client"> {
  constructor() {
    super("ready", "client", { runOnce: true });
  }

  async execute(): Promise<void> {
    this.client.logger.info("Oliver is ready!");
  }
}