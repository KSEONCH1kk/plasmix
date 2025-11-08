import { useState, useEffect } from 'react';
import { leaderboardsAPI, LeaderboardResponse, LeaderboardEntry } from '@/app/lib/api';

export function useLeaderboard(
  leaderboardId: number | null,
  period: string = 'daily',
  date?: string,
  limit: number = 100
) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!leaderboardId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response: LeaderboardResponse = await leaderboardsAPI.getData(
          leaderboardId,
          period,
          date,
          limit
        );
        setLeaderboard(response.leaderboard);
        setTotal(response.total);
      } catch (err: any) {
        console.error('Failed to fetch leaderboard:', err);
        setError(err.message || 'Ошибка загрузки топа');
        setLeaderboard([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardId, period, date, limit]);

  return { leaderboard, loading, error, total };
}

