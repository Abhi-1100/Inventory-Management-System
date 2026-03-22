'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, AlertCircle, ShoppingCart } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import Logo from '@/components/shared/Logo';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // API call to custom backend register endpoint
      const res = await api.post('/auth/register', { name, email, password });
      // Automatically log the user in after registration (assuming register returns token)
      setAuth(res.data.data.user, res.data.data.token);
      router.push('/login'); // Backend might not return token on register, safe to redirect to login
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Column - Graphic */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-[#f07c28] to-[#d96a1e] p-12 relative overflow-hidden">
        {/* Abstract shapes matching logo style */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#393939]/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 w-full max-w-lg text-white">
          <Logo size={64} className="text-white drop-shadow-md mb-8" />
          <h2 className="text-5xl font-black tracking-tight mb-6">
            Scale your supply chain operations
          </h2>
          <p className="text-xl font-medium text-white/80 leading-relaxed mb-12 max-w-md">
            Join thousands of modern enterprises using CoreInventory to transform their warehouse management.
          </p>
          
          <div className="grid grid-cols-2 gap-6 border-t border-white/20 pt-12">
            <div className="space-y-2">
              <div className="text-3xl font-black tracking-tighter">99.9%</div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Uptime SLA</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-black tracking-tighter">2.5s</div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Sync Latency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10 bg-[#fdf8f4]">
        <div className="w-full max-w-[420px] mx-auto space-y-10">
          
          <div className="space-y-4">
            <div className="lg:hidden mb-12">
              <Link href="/landing" className="inline-block transition-transform hover:scale-105 active:scale-95">
                <Logo size={48} className="drop-shadow-sm" />
              </Link>
            </div>
            <h1 className="text-4xl font-black text-[#393939] tracking-tight">
              Create account
            </h1>
            <p className="text-[#A4B6C2] text-lg font-medium">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 animate-fade-in-up shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-red-800 leading-snug">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2 group">
                <label className="text-sm font-bold text-[#393939] ml-1 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4B6C2] group-focus-within:text-[#f07c28] transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#A4B6C2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f07c28]/40 focus:border-[#f07c28] text-[#393939] font-medium transition-all shadow-sm"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-bold text-[#393939] ml-1 uppercase tracking-wide">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4B6C2] group-focus-within:text-[#f07c28] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#A4B6C2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f07c28]/40 focus:border-[#f07c28] text-[#393939] font-medium transition-all shadow-sm"
                    placeholder="jane@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-bold text-[#393939] ml-1 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4B6C2] group-focus-within:text-[#f07c28] transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#A4B6C2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f07c28]/40 focus:border-[#f07c28] text-[#393939] font-medium transition-all font-mono tracking-wider shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-bold text-[#393939] ml-1 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4B6C2] group-focus-within:text-[#f07c28] transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#A4B6C2]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f07c28]/40 focus:border-[#f07c28] text-[#393939] font-medium transition-all font-mono tracking-wider shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center p-4 bg-[#393939] text-white rounded-xl hover:bg-black hover:shadow-xl hover:shadow-[#393939]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#f07c28] translate-y-full group-hover:translate-y-0 transition-transform ease-out duration-300 pointer-events-none" />
              <span className="relative font-bold text-lg tracking-wide flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
            
            <p className="text-center text-[#A4B6C2] font-medium pt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-[#393939] font-bold hover:text-[#f07c28] transition-colors underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
