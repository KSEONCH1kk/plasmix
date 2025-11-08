import { useState, useEffect } from 'react';
import { modesAPI, Mode } from '@/app/lib/api';

export function useModes() {
  const [modes, setModes] = useState<Mode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModes = async () => {
    setLoading(true);
    setError(null);
    try {
      const allModes = await modesAPI.getAll();
      setModes(allModes);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching modes:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMode = async (data: Omit<Mode, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newMode = await modesAPI.create(data);
      setModes([...modes, newMode]);
      return newMode;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating mode:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMode = async (id: number, data: Partial<Mode>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await modesAPI.update(id, data);
      setModes(modes.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating mode:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMode = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await modesAPI.delete(id);
      setModes(modes.filter(m => m.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting mode:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModes();
  }, []);

  return {
    modes,
    loading,
    error,
    createMode,
    updateMode,
    deleteMode,
    refreshModes: fetchModes,
  };
}

