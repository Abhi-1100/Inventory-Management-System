'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { Boxes, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from '@/schemas/auth.schema';
import api from '@/lib/axios';
import Link from 'next/link';

const STEPS = ['email', 'otp', 'reset'];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');

  // Step 1 form
  const emailForm = useForm({ resolver: zodResolver(forgotPasswordSchema) });
  // Step 2 form
  const otpForm = useForm({ resolver: zodResolver(verifyOtpSchema) });
  // Step 3 form
  const resetForm = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const handleEmailSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      toast.success('OTP sent to your email!', { duration: 4000 });
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: data.otp });
      if (res.data.valid) {
        setOtp(data.otp);
        setStep(2);
      } else {
        toast.error('Invalid OTP. Please try again.', { duration: 5000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'OTP verification failed', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: data.newPassword });
      toast.success('Password reset successfully!', { duration: 4000 });
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password reset failed', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Enter Email', 'Verify OTP', 'New Password'];

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

        <div className="bg-bg-card border border-border rounded-2xl p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? 'bg-success text-white' : i === step ? 'bg-accent text-white' : 'bg-bg-surface text-text-muted border border-border'
                }`}>
                  {i < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`h-px w-8 transition-colors ${i < step ? 'bg-success' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Email */}
          {step === 0 && (
            <>
              <h1 className="text-2xl font-bold text-text-primary mb-1">Forgot password?</h1>
              <p className="text-sm text-text-secondary mb-6">Enter your email to receive a one-time passcode.</p>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Email address</label>
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    placeholder="name@company.com"
                    className={`w-full bg-bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${emailForm.formState.errors.email ? 'border-danger' : 'border-border'}`}
                  />
                  {emailForm.formState.errors.email && <p className="text-xs text-danger mt-1">{emailForm.formState.errors.email.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: OTP */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-text-primary mb-1">Enter OTP</h1>
              <p className="text-sm text-text-secondary mb-6">We sent a passcode to <span className="text-text-primary font-medium">{email}</span></p>
              <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">One-time passcode</label>
                  <input
                    {...otpForm.register('otp')}
                    type="text"
                    placeholder="Enter OTP"
                    className={`w-full bg-bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${otpForm.formState.errors.otp ? 'border-danger' : 'border-border'}`}
                  />
                  {otpForm.formState.errors.otp && <p className="text-xs text-danger mt-1">{otpForm.formState.errors.otp.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
              <button onClick={() => setStep(0)} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary mt-4 transition-colors">
                <ArrowLeft size={12} /> Back
              </button>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-text-primary mb-1">Set new password</h1>
              <p className="text-sm text-text-secondary mb-6">Choose a strong password for your account.</p>
              <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">New password</label>
                  <input
                    {...resetForm.register('newPassword')}
                    type="password"
                    placeholder="Min 6 characters"
                    className={`w-full bg-bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${resetForm.formState.errors.newPassword ? 'border-danger' : 'border-border'}`}
                  />
                  {resetForm.formState.errors.newPassword && <p className="text-xs text-danger mt-1">{resetForm.formState.errors.newPassword.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm password</label>
                  <input
                    {...resetForm.register('confirmPassword')}
                    type="password"
                    placeholder="Repeat password"
                    className={`w-full bg-bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${resetForm.formState.errors.confirmPassword ? 'border-danger' : 'border-border'}`}
                  />
                  {resetForm.formState.errors.confirmPassword && <p className="text-xs text-danger mt-1">{resetForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-text-muted mt-6">
            <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
