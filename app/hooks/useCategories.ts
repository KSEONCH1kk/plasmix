import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://77.90.33.66:8000';

interface Category {
  id: number;
  category_id: string;
  name: string;
  icon: string;
  mode: string;
}

export function useCategories(mode: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/categories`, {
          params: { mode }
        });
        setCategories(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setCategories([
          { id: 1, category_id: "privileges", name: "Привилегии", icon: "fa-trophy", mode: "lite" },
          { id: 2, category_id: "currency", name: "Сапфиры и Коины", icon: "fa-gem", mode: "lite" },
          { id: 3, category_id: "cases", name: "Кейс с донатом", icon: "fa-gift", mode: "lite" },
          { id: 4, category_id: "titles", name: "Кейс с титулами", icon: "fa-crown", mode: "lite" },
          { id: 5, category_id: "containers", name: "Контейнеры", icon: "fa-box", mode: "lite" },
          { id: 6, category_id: "other", name: "Разное", icon: "fa-star", mode: "lite" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [mode]);

  return { categories, loading, error };
}


