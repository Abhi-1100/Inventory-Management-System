'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { registerSchema } from '@/schemas/auth.schema';
import api from '@/lib/axios';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword: _, ...payload } = data;
      await api.post('/auth/register', payload);
      toast.success('Account created! Please sign in.', { duration: 4000 });
      router.push('/login');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-[#f6f6f8]">
      <Toaster position="top-right" />

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-[#f07c28] p-1.5 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">CoreInventory</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span className="text-sm font-medium text-slate-600">Inventory Management</span>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-bold text-[#f07c28] border border-[#f07c28]/30 rounded-lg hover:bg-[#f07c28]/5 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[1100px] grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

          {/* ── Left: Form ───────────────────────────────────────── */}
          <div className="p-8 md:p-12 lg:p-16">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-slate-900 mb-2">Create your account</h1>
              <p className="text-slate-500">Start managing your inventory smarter today with our intuitive platform.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl select-none">person</span>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="John Doe"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#f07c28]/20 focus:border-[#f07c28] outline-none transition-all placeholder:text-slate-400 ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl select-none">mail</span>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="john@company.com"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#f07c28]/20 focus:border-[#f07c28] outline-none transition-all placeholder:text-slate-400 ${errors.email ? 'border-red-400' : 'border-slate-200'}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
              </div>

              {/* Password + Confirm side-by-side */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl select-none">lock</span>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-10 py-3.5 rounded-xl border bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#f07c28]/20 focus:border-[#f07c28] outline-none transition-all placeholder:text-slate-400 ${errors.password ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl select-none">shield</span>
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-10 py-3.5 rounded-xl border bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#f07c28]/20 focus:border-[#f07c28] outline-none transition-all placeholder:text-slate-400 ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#f07c28] accent-[#f07c28] focus:ring-[#f07c28] cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-slate-500 cursor-pointer">
                  I agree to the{' '}
                  <span className="text-[#f07c28] hover:underline cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-[#f07c28] hover:underline cursor-pointer">Privacy Policy</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f07c28] hover:bg-[#e06d18] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-[#f07c28]/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-500 tracking-wider">Or continue with</span>
                </div>
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-800" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 22c-1.33.04-1.76-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">Apple</span>
                </button>
              </div>

              {/* Sign In link */}
              <p className="text-center text-sm text-slate-600 mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-[#f07c28] font-bold hover:underline">
                  Sign in instead
                </Link>
              </p>
            </form>
          </div>

          {/* ── Right: Marketing panel ───────────────────────────── */}
          <div className="hidden md:flex flex-col justify-between p-12 bg-[#333333] relative overflow-hidden">
            {/* Abstract bg */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="80" cy="20" r="30" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M0 100 Q 50 50 100 100" fill="none" stroke="white" strokeWidth="0.5" />
              </svg>
            </div>

            {/* Top content */}
            <div className="relative z-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6">
                <span className="material-symbols-outlined text-xs mr-1" style={{ fontSize: '14px' }}>star</span>
                Trusted by 10,000+ businesses
              </div>
              <h2 className="text-4xl font-black text-white leading-tight mb-6">
                Master your inventory with precision and ease.
              </h2>
              <ul className="space-y-4 text-white/90">
                {[
                  'Real-time stock tracking across locations',
                  'Automated purchase order generation',
                  'Advanced analytics and reporting',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="material-symbols-outlined bg-white/20 p-1 rounded-full text-sm select-none" style={{ fontSize: '16px' }}>check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonial card */}
            <div className="relative z-10 mt-auto pt-12">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <p className="text-white italic mb-4">
                  &ldquo;CoreInventory has transformed our warehouse operations. We&apos;ve reduced stockouts by 45% in just three months.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-sm">
                    DC
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-none">David Chen</p>
                    <p className="text-white/60 text-xs">COO at LogiCore Global</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="py-8 px-6 text-center">
        <p className="text-slate-400 text-sm">© 2024 CoreInventory Inc. All rights reserved.</p>
      </footer>

      {/* Google Material Icons font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet"
      />
    </div>
  );
}
