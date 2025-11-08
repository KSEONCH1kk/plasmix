import { useState, useEffect } from 'react';
import { donationsAPI, Donation } from '@/app/lib/api';

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const allDonations = await donationsAPI.getAll();
      setDonations(allDonations);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDonation = async (data: Omit<Donation, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newDonation = await donationsAPI.create(data);
      setDonations([...donations, newDonation]);
      return newDonation;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating donation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDonation = async (id: number, data: Partial<Donation>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await donationsAPI.update(id, data);
      setDonations(donations.map(d => d.id === id ? updated : d));
      return updated;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating donation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDonation = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await donationsAPI.delete(id);
      setDonations(donations.filter(d => d.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting donation:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return {
    donations,
    loading,
    error,
    createDonation,
    updateDonation,
    deleteDonation,
    refreshDonations: fetchDonations,
  };
}

