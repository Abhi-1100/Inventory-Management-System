'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

const publicRoutes = ['/login', '/signup', '/landing', '/forgot-password'];

export default function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const { setAuth, clearAuth, token } = useAuthStore();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ci_token') || token;
      
      if (!storedToken) {
        if (!publicRoutes.includes(pathname)) {
          router.push('/login');
        } else {
          setIsAuthChecking(false);
        }
        return;
      }

      try {
        const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${storedToken}` } });
        setAuth(res.data.data, storedToken);
        setIsAuthChecking(false);
      } catch (err) {
        clearAuth();
        if (!publicRoutes.includes(pathname)) {
          router.push('/login');
        } else {
          setIsAuthChecking(false);
        }
      }
    };

    initAuth();
  }, [pathname, router, setAuth, clearAuth, token]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If on a public route, just render the page (no sidebar/navbar)
  if (publicRoutes.includes(pathname)) {
    return <main className="min-h-screen bg-bg">{children}</main>;
  }

  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
