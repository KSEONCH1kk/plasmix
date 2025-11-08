import { useState, useEffect } from 'react';
import { donationsAPI, itemsAPI, Donation, Item } from '@/app/lib/api';

export interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  discount?: string;
  image: string;
  chat_prefix?: string;
  command?: string;
  features?: any[];
}

export function useProducts(mode: string, category: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data: (Donation | Item)[] = [];
        
        if (category === 'privileges') {
          data = await donationsAPI.getAll(mode);
        } else {
          data = await itemsAPI.getAll(mode, category);
        }
        const formattedProducts: Product[] = data.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          old_price: 'old_price' in item ? item.old_price : undefined,
          discount: 'discount' in item ? item.discount : undefined,
          image: item.image || 'https://placehold.co/400',
          chat_prefix: 'chat_prefix' in item ? item.chat_prefix : undefined,
          command: item.command,
          features: 'features' in item ? item.features : undefined,
        }));
        
        setProducts(formattedProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [mode, category]);

  return { products, loading, error };
}

