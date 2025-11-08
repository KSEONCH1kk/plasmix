import { useState } from 'react';
import { ordersAPI, Order } from '@/app/lib/api';

export function useOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      const order = await ordersAPI.create(orderData);
      return order;
    } catch (err: any) {
      setError(err.message || 'Ошибка создания заказа');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
}

