'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import Logo from '@/components/shared/Logo';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      router.push('/login?registered=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
          <p className="text-sm" style={{ color: '#A4B6C2' }}>Create your account</p>
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
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
                onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
                onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
                onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#A4B6C2' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#f07c28' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
