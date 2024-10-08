import { getTimeBetweenDates } from "@olivr-nxt/common";
import authRoutes from "~/api/auth";
import feedbackRoutes from "~/api/feedback";
import { fetchOrSet, rKey } from "~/client/database";
import { createFactory } from "~/utils/api";

const app = createFactory();

app.get("/", async (c) => {
  const client = c.get('client');
  const stats = {
    guilds: client.guilds.cache.size,
    users: client.users.cache.size,
    channels: client.channels.cache.size,
    uptime: Number(getTimeBetweenDates(client.uptimeSince, new Date(), 's').toFixed(0)),
  }

  return c.json(stats);
});

app.get("/stats", async (c) => {
  const client = c.get('client');

  const guilds = await client.db.guild.count();
  const users = await client.db.user.count();
  const stats = await fetchOrSet(rKey('stats'), async () => {
    return await client.db.guild.aggregate({
      _sum: {
        bans: true,
        kicks: true,
        mutes: true,
        commandsUsed: true,
        dynamicVoicesCreated: true,
        featureToggles: true,
        generatorsUsed: true,
        levelsGained: true,
        messagesSent: true,
        moderationActions: true,
        reports: true,
        songsPlayed: true,
        suggestions: true,
        ticketsClosed: true,
        ticketsOpened: true,
        usersJoined: true,
        usersLeft: true,
        voiceConnections: true,
        votesCast: true,
        warnings: true,
        xpEarned: true,
      }
    }).then((res) => res._sum).catch(() => null);
  }, 180);

  if (!stats) {
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }

  return c.json({ ...stats, guilds, users });
});

app.route("/auth", authRoutes);
app.route("/feedback", feedbackRoutes);

export default app;