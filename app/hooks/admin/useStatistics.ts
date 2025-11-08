import { useState, useEffect } from 'react';
import { statisticsAPI, Statistics } from '@/app/lib/api';

export function useStatistics() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async (days: number = 7) => {
    setLoading(true);
    setError(null);
    try {
      const stats = await statisticsAPI.get(days);
      setStatistics(stats);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refreshStatistics: fetchStatistics,
  };
}

