import { useQuery } from "@tanstack/react-query";
import { env } from "~/env";

export type Stats = {
  bans: number;
  kicks: number;
  mutes: number;
  commandsUsed: number;
  dynamicVoicesCreated: number;
  featureToggles: number;
  generatorsUsed: number;
  levelsGained: number;
  messagesSent: number;
  moderationActions: number;
  reports: number;
  songsPlayed: number;
  suggestions: number;
  ticketsClosed: number;
  ticketsOpened: number;
  usersJoined: number;
  usersLeft: number;
  voiceConnections: number;
  votesCast: number;
  warnings: number;
  xpEarned: number;
  users: number;
  guilds: number;
};

const fetchStats = async (): Promise<Stats> => {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/stats`);
  return res.json();
}

function useStats() {
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: fetchStats,
    initialData: {
      bans: 0,
      kicks: 0,
      mutes: 0,
      commandsUsed: 0,
      dynamicVoicesCreated: 0,
      featureToggles: 0,
      generatorsUsed: 0,
      levelsGained: 0,
      messagesSent: 0,
      moderationActions: 0,
      reports: 0,
      songsPlayed: 0,
      suggestions: 0,
      ticketsClosed: 0,
      ticketsOpened: 0,
      usersJoined: 0,
      usersLeft: 0,
      voiceConnections: 0,
      votesCast: 0,
      warnings: 0,
      xpEarned: 0,
      guilds: 0,
      users: 0,
    },
  });
}

export { fetchStats, useStats };
