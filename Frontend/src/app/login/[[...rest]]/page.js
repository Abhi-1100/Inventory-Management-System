'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import Logo from '@/components/shared/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.user, res.data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#fdf8f4' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo size={40} className="drop-shadow-lg" />
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#393939' }}>
              Core<span style={{ color: '#A4B6C2' }}>Inventory</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: '#A4B6C2' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: '1px solid #e2e8f0' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold" style={{ color: '#393939' }}>Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold transition-colors hover:opacity-80" style={{ color: '#f07c28' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#f07c28' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#A4B6C2' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#f07c28' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
