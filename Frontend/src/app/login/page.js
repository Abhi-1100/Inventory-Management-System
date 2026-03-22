'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, AlertCircle, ShoppingCart } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import Logo from '@/components/shared/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.data.user, res.data.data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Column - Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-[420px] mx-auto space-y-10">
          
          {/* Header */}
          <div className="space-y-4">
            <Link href="/landing" className="inline-block transition-transform hover:scale-105 active:scale-95">
              <Logo size={48} className="drop-shadow-sm" />
            </Link>
            <h1 className="text-4xl font-black text-[#393939] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[#A4B6C2] text-lg font-medium">
              Enter your details to access your workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 animate-fade-in-up">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-red-800 leading-snug">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2 group">
                <label className="text-sm font-bold text-[#393939] ml-1 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4B6C2] group-focus-within:text-[#f07c28] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#fdf8f4] border border-[#f07c28]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f07c28]/40 focus:bg-white text-[#393939] font-medium transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-[#393939] uppercase tracking-wide">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm font-bold text-[#f07c28] hover:text-[#d96a1e] transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4B6C2] group-focus-within:text-[#f07c28] transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#fdf8f4] border border-[#f07c28]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f07c28]/40 focus:bg-white text-[#393939] font-medium transition-all font-mono tracking-wider"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center p-4 bg-[#f07c28] text-white rounded-xl hover:bg-[#d96a1e] hover:shadow-lg hover:shadow-[#f07c28]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform ease-out duration-300 pointer-events-none" />
              <span className="relative font-bold text-lg tracking-wide flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
            
            <p className="text-center text-[#A4B6C2] font-medium pt-4">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#f07c28] font-bold hover:underline underline-offset-4">
                Create workspace
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Column - Graphic */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#fdf8f4] p-12 relative overflow-hidden">
        {/* Abstract shapes matching logo style */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#f07c28]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#393939]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-[#393939]/5 border border-white/50 backdrop-blur-sm -rotate-2 transform hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#fdf8f4]">
              <div className="w-12 h-12 bg-[#f07c28]/10 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-[#f07c28]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#393939]">Smart Inventory</h3>
                <p className="text-[#A4B6C2] font-medium">Real-time tracking enabled</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[75, 45, 90].map((width, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-[#fdf8f4] border border-[#A4B6C2]/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#A4B6C2]/10 rounded-full" style={{ width: `${width}%` }} />
                    <div className="h-2 bg-[#A4B6C2]/10 rounded-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-[#fdf8f4]">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#f07c28]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#f07c28]" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#393939] flex items-center justify-center text-xs font-bold text-white">
                  +12
                </div>
              </div>
              <p className="text-sm font-bold text-[#A4B6C2] mt-4">Join 1500+ supply chain leaders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
