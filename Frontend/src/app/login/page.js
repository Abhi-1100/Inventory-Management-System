'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, Boxes } from 'lucide-react';
import { loginSchema } from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    
    if (result.success) {
      toast.success('Welcome back! Redirecting...');
      // Navigation is handled inside login() method in AuthContext
    } else {
      toast.error(result.error || 'Login failed', { duration: 5000 });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="p-2 bg-accent rounded-xl">
            <Boxes size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-text-primary">
            Core<span className="text-accent">Inventory</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-bg-card border border-border rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Sign in</h1>
          <p className="text-sm text-text-secondary mb-6">Enter your credentials to continue</p>


          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="name@company.com"
                className={`w-full bg-bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${errors.email ? 'border-danger' : 'border-border'}`}
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-bg-surface border rounded-lg px-3 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${errors.password ? 'border-danger' : 'border-border'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-accent hover:text-accent-hover">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent hover:text-accent-hover font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
