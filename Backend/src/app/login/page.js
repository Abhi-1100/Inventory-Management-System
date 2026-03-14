'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { loginSchema } from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  // ─── Demo Credentials ─────────────────────────────────────────────────────
  const DEMO_EMAIL = 'admin@demo.com';
  const DEMO_PASS = 'demo1234';
  const DEMO_USER = { id: 'demo', name: 'Demo Admin', email: DEMO_EMAIL, role: 'admin' };
  const DEMO_TOKEN = 'demo_token_no_backend';
  // ──────────────────────────────────────────────────────────────────────────

  const onSubmit = async (data) => {
    setLoading(true);

    // Demo bypass — works without a backend
    if (data.email === DEMO_EMAIL && data.password === DEMO_PASS) {
      setAuth(DEMO_USER, DEMO_TOKEN);
      toast.success('Welcome, Demo Admin! 🚀');
      router.push('/dashboard');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.token);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #e8e8e8 0%, #f0f0f0 100%)' }}
    >
      <Toaster position="bottom-right" />

      {/* Main card */}
      <div
        className="w-full flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxWidth: '900px', border: '1px solid #ddd' }}
      >
        {/* ─── LEFT PANEL (Charcoal) ─── */}
        <div
          className="hidden md:flex md:w-[45%] relative flex-col justify-between p-10 text-white overflow-hidden"
          style={{ backgroundColor: '#393939' }}
        >
          {/* Subtle blobs */}
          <div
            className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl"
            style={{ backgroundColor: 'rgba(162,178,193,0.07)', marginRight: '-5rem', marginTop: '-5rem' }}
          />
          <div
            className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl"
            style={{ backgroundColor: 'rgba(242,125,33,0.07)', marginLeft: '-4rem', marginBottom: '-4rem' }}
          />

          {/* Top: Logo + Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <Logo size={38} className="drop-shadow-sm" />
              <span className="text-lg font-bold tracking-tight text-white">CoreInventory</span>
            </div>

            <h1 className="text-4xl font-bold leading-snug mb-5 text-white">
              A better way to
            </h1>
            <p
              className="text-5xl font-extrabold uppercase tracking-widest mb-6"
              style={{ color: '#a2b2c1' }}
            >
              MANAGE
            </p>
            <p className="text-base leading-relaxed max-w-[240px]" style={{ color: '#a2b2c1' }}>
              Streamline your operations with precision-engineered inventory solutions.
            </p>
          </div>

          {/* Bottom: dots + version */}
          <div className="relative z-10">
            <div className="flex gap-1.5 mb-3">
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: '#f27d21' }} />
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: '#606060' }} />
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: '#606060' }} />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#606060' }}>
              System V4.2.0
            </p>
          </div>
        </div>

        {/* ─── RIGHT PANEL (White) ─── */}
        <div className="w-full md:w-[55%] bg-white p-10 md:p-12">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <Logo size={36} className="drop-shadow-sm" />
            <span className="font-bold text-[#393939]">CoreInventory</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1.5" style={{ color: '#1a1a1a' }}>
              Welcome Back
            </h1>
            <p className="text-sm" style={{ color: '#7a8fa6' }}>
              Please enter your details to sign in
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: '#9aa5ae' }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} style={{ color: '#a2b2c1' }} />
                </div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#ffffff',
                    border: `1.5px solid ${errors.email ? '#ef4444' : '#dce0e4'}`,
                    color: '#1a1a1a',
                    boxShadow: errors.email ? 'none' : undefined,
                  }}
                  onFocus={(e) => { if (!errors.email) e.target.style.borderColor = '#f27d21'; e.target.style.boxShadow = 'none'; }}
                  onBlur={(e) => { if (!errors.email) e.target.style.borderColor = '#dce0e4'; }}
                />
              </div>
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9aa5ae' }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold transition-colors hover:opacity-80"
                  style={{ color: '#f27d21' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} style={{ color: '#a2b2c1' }} />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-11 py-3 rounded-lg text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    backgroundColor: '#ffffff',
                    border: `1.5px solid ${errors.password ? '#ef4444' : '#dce0e4'}`,
                    color: '#1a1a1a',
                  }}
                  onFocus={(e) => { if (!errors.password) e.target.style.borderColor = '#f27d21'; }}
                  onBlur={(e) => { if (!errors.password) e.target.style.borderColor = '#dce0e4'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors hover:opacity-70"
                  style={{ color: '#a2b2c1' }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Keep me signed in */}
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded"
                style={{ accentColor: '#f27d21', borderColor: '#dce0e4' }}
              />
              <label htmlFor="remember-me" className="text-sm" style={{ color: '#555' }}>
                Keep me signed in
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                backgroundColor: '#f27d21',
                color: '#ffffff',
                boxShadow: '0 6px 20px rgba(242,125,33,0.3)',
              }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#e06d14'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f27d21'; }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-7 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#e8e8e8' }} />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span
                className="px-4 bg-white uppercase tracking-widest font-semibold"
                style={{ color: '#b0bec5' }}
              >
                Alternative
              </span>
            </div>
          </div>

          {/* Create Account Button */}
          <Link
            href="/signup"
            className="mt-5 w-full flex items-center justify-center font-semibold py-3.5 px-4 rounded-xl text-sm transition-all duration-200 border"
            style={{
              backgroundColor: '#f5f5f5',
              borderColor: '#e0e0e0',
              color: '#1a1a1a',
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ebebeb'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
          >
            Create account
          </Link>

          {/* Footer */}
          <footer className="mt-8 flex justify-center gap-6">
            <span
              className="text-[10px] uppercase tracking-widest font-bold cursor-default"
              style={{ color: '#b0bec5' }}
            >
              Privacy
            </span>
            <span
              className="text-[10px] uppercase tracking-widest font-bold cursor-default"
              style={{ color: '#b0bec5' }}
            >
              Terms
            </span>
            <Link
              href="/forgot-password"
              className="text-[10px] uppercase tracking-widest font-bold transition-colors hover:text-[#393939]"
              style={{ color: '#b0bec5' }}
            >
              Support
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
