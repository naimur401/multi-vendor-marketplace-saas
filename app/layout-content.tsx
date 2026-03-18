'use client';

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, LogOut, LayoutDashboard, Package, Shield } from 'lucide-react';
import { useAuthStore } from '@/app/lib/stores/authStore';

const queryClient = new QueryClient();

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout, setUser, setToken } = useAuthStore();
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

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const hideNavbar = pathname?.startsWith('/dashboard') ||
                     pathname?.startsWith('/admin') ||
                     pathname === '/login' ||
                     pathname === '/register';

  if (!mounted || hideNavbar) return null;

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-foreground">
          MarketHub
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/marketplace" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition">
            Marketplace
          </Link>

          {mounted && user ? (
            <>
              {user.role === 'customer' && (
                <>
                  <Link href="/cart" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                  </Link>
                  <Link href="/orders" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    Orders
                  </Link>
                  <Link href="/become-vendor" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                    Become a Vendor
                  </Link>
                </>
              )}

              {user.role === 'vendor' && (
                <Link href="/dashboard" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}

              {user.role === 'admin' && (
                <Link href="/admin" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}

              {user.role !== 'admin' && (
                <Link href="/profile" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {user.firstName}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-sm text-destructive hover:text-destructive/80"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      {children}
    </QueryClientProvider>
  );
}