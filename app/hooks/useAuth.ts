import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const adminAuth = localStorage.getItem('adminAuth');
      
      if (token && adminAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push('/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  return { isAuthenticated, loading };
}

