'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LoadingSpinner from '../shared/LoadingSpinner';
import api from '@/lib/axios';

export default function AppLayout({ children }) {
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // If we have a token but no user object yet, validate with backend
    const storedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('ci_token') : null);

    if (!storedToken) {
      router.replace('/login');
      return;
    }

    if (!user) {
      api.get('/auth/me')
        .then((res) => {
          setAuth(res.data, storedToken);
        })
        .catch(() => {
          clearAuth();
          router.replace('/login');
        });
    }
  }, [token, user, setAuth, clearAuth, router]);

  if (!user) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#fdf8f4' }}>
      <Sidebar />
      {/* Offset for fixed sidebar */}
      <div className="flex flex-col flex-1 ml-64 min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
