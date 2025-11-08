import { useState } from 'react';
import { promocodesAPI } from '@/app/lib/api';

export function usePromocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePromocode = async (code: string, username?: string): Promise<{ valid: boolean; discount: number } | null> => {
    if (!code.trim()) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await promocodesAPI.validate(code, username);
      return {
        valid: result.valid,
        discount: result.discount,
      };
    } catch (err: any) {
      setError(err.message || 'Промокод недействителен');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { validatePromocode, loading, error };
}

