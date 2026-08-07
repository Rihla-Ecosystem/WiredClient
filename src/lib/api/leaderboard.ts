import { coreClient } from "./client";

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
}

export const leaderboardApi = {
  get: async (limit = 50): Promise<LeaderboardEntry[]> => {
    const { data } = await coreClient.get<LeaderboardEntry[]>("/leaderboard", {
      params: { limit },
    });
    return Array.isArray(data) ? data : [];
  },
};
