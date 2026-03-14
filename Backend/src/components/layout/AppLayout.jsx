'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LoadingSpinner from '../shared/LoadingSpinner';
import api from '../../lib/axios';

export default function AppLayout({ children }) {
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('ci_token') : null;

    if (!storedToken) {
      router.replace('/login');
      return;
    }

    // Demo mode — skip API call
    if (storedToken === 'demo_token_no_backend') {
      if (!user) {
        setAuth({ id: 'demo', name: 'Demo Admin', email: 'admin@demo.com', role: 'admin' }, storedToken);
      }
      return;
    }

    // Real token — verify with backend
    if (!user) {
      api.get('/auth/me')
        .then((res) => setAuth(res.data, storedToken))
        .catch(() => {
          clearAuth();
          router.replace('/login');
        });
    }
  }, []);

  if (!token && typeof window !== 'undefined' && !localStorage.getItem('ci_token')) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
