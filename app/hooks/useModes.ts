import { useState, useEffect } from 'react';
import { modesAPI, Mode } from '@/app/lib/api';

export function useModes() {
  const [modes, setModes] = useState<Mode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const data = await modesAPI.getAll();
        setModes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки режимов');
      } finally {
        setLoading(false);
      }
    };

    fetchModes();
  }, []);

  return { modes, loading, error };
}

