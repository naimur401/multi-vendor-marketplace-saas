'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/stores/authStore';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'customer' | 'vendor' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, token, setUser, setToken } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user || !token) {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
      return;
    }
    if (user && requiredRole && user.role !== requiredRole) {
      router.push('/');
    }
  }, [mounted, user, requiredRole, router]);

  if (!mounted) return <div className="min-h-screen" />;

  const storedToken = localStorage.getItem('token');
  if (!storedToken) return null;
  if (requiredRole && user && user.role !== requiredRole) return null;

  return <>{children}</>;
}