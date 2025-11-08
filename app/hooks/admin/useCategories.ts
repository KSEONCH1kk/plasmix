import { useState, useEffect } from 'react';
import { categoriesAPI, Category } from '@/app/lib/api';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const allCategories = await categoriesAPI.getAll();
      setCategories(allCategories);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await categoriesAPI.create(data);
      setCategories([...categories, newCategory]);
      return newCategory;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, data: Partial<Category>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await categoriesAPI.update(id, data);
      setCategories(categories.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await categoriesAPI.delete(id);
      setCategories(categories.filter(c => c.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting category:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories,
  };
}

