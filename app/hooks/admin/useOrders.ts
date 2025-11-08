import { useState, useEffect } from 'react';
import { ordersAPI, Order } from '@/app/lib/api';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const allOrders = await ordersAPI.getAll();
      setOrders(allOrders);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await ordersAPI.update(id, { status });
      setOrders(orders.map(o => o.id === id ? updated : o));
      return updated;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refreshOrders: fetchOrders,
  };
}

