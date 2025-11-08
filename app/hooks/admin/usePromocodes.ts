import { useState, useEffect } from 'react';
import { promocodesAPI, Promocode } from '@/app/lib/api';

export function usePromocodes() {
  const [promocodes, setPromocodes] = useState<Promocode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromocodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const allPromocodes = await promocodesAPI.getAll();
      setPromocodes(allPromocodes);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching promocodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPromocode = async (data: Omit<Promocode, 'id' | 'created_at' | 'updated_at' | 'uses_count'>) => {
    setLoading(true);
    setError(null);
    try {
      const newPromocode = await promocodesAPI.create(data);
      setPromocodes([...promocodes, newPromocode]);
      return newPromocode;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating promocode:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePromocode = async (id: number, data: Partial<Promocode>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await promocodesAPI.update(id, data);
      setPromocodes(promocodes.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating promocode:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePromocode = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await promocodesAPI.delete(id);
      setPromocodes(promocodes.filter(p => p.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting promocode:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromocodes();
  }, []);

  return {
    promocodes,
    loading,
    error,
    createPromocode,
    updatePromocode,
    deletePromocode,
    refreshPromocodes: fetchPromocodes,
  };
}

