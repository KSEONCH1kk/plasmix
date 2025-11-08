import { useState, useEffect } from 'react';
import { itemsAPI, Item } from '@/app/lib/api';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const allItems = await itemsAPI.getAll();
      setItems(allItems);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (data: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await itemsAPI.create(data);
      setItems([...items, newItem]);
      return newItem;
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating item:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: number, data: Partial<Item>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await itemsAPI.update(id, data);
      setItems(items.map(i => i.id === id ? updated : i));
      return updated;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating item:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await itemsAPI.delete(id);
      setItems(items.filter(i => i.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting item:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refreshItems: fetchItems,
  };
}

