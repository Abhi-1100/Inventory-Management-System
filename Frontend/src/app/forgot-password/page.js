'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, KeyRound, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';
import Logo from '@/components/shared/Logo';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // 1. Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email.'); return; }
    setError(''); setSuccess(''); setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('OTP sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) { setError('Please enter the OTP.'); return; }
    setError(''); setSuccess(''); setLoading(true);

    try {
      await api.post('/auth/verify-otp', { email, otp });
      setSuccess('OTP verified. Please set a new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setSuccess(''); setLoading(true);

    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf8f4] p-4">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl shadow-[#393939]/5 border border-[#A4B6C2]/10 p-8 sm:p-12 relative overflow-hidden">
        
        {/* Progress header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#A4B6C2]/10">
          <div 
            className="h-full bg-[#f07c28] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="text-center mb-10">
          <Link href="/landing" className="inline-block transition-transform hover:scale-105 active:scale-95 mb-6">
            <Logo size={40} className="drop-shadow-sm" />
          </Link>
          <h1 className="text-3xl font-black text-[#393939] tracking-tight mb-2">
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'New Password'}
          </h1>
          <p className="text-[#A4B6C2] font-medium text-sm">
            {step === 1 && "Enter your email and we'll send a code to reset."}
            {step === 2 && `We sent a code to ${email}`}
            {step === 3 && "Create a new strong password for your account."}
          </p>
        </div>

        {(error || success) && (
          <div className={`p-4 rounded-xl mb-8 flex items-start gap-3 animate-fade-in-up ${error ? 'bg-red-50 border border-red-100 text-red-800' : 'bg-green-50 border border-green-100 text-green-800'}`}>
            {error ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium leading-snug">{error || success}</p>
          </div>
        )}

        {/* STEP 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6 animate-fade-in-up">
            <div className="space-y-2 group">
              <label className="text-xs font-bold text-[#393939] ml-1 uppercase tracking-wide">Account Email</label>
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
            
            <button
              type="submit" disabled={loading}
              className="w-full p-4 bg-[#f07c28] text-white font-bold rounded-xl hover:bg-[#d96a1e] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : <>Send Reset Code <ArrowRight className="w-4 h-4" /></>}
            </button>
            <div className="text-center pt-2">
              <Link href="/login" className="text-sm font-bold text-[#A4B6C2] hover:text-[#393939] transition-colors">Return to login</Link>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in-up">
            <div className="space-y-2 group">
              <label className="text-xs font-bold text-[#393939] ml-1 uppercase tracking-wide">6-Digit Code</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4B6C2] group-focus-within:text-[#f07c28] transition-colors" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#fdf8f4] border border-[#f07c28]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f07c28]/40 focus:bg-white text-[#393939] font-bold tracking-widest text-center transition-all"
                  placeholder="• • • • • •"
                />
              </div>
            </div>
            
            <button
              type="submit" disabled={loading}
              className="w-full p-4 bg-[#f07c28] text-white font-bold rounded-xl hover:bg-[#d96a1e] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : <>Verify Code <ArrowRight className="w-4 h-4" /></>}
            </button>
            <div className="text-center pt-2">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-[#A4B6C2] hover:text-[#393939] transition-colors">Use a different email</button>
            </div>
          </form>
        )}

        {/* STEP 3: New Password Form */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in-up">
            <div className="space-y-2 group">
              <label className="text-xs font-bold text-[#393939] ml-1 uppercase tracking-wide">New Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4B6C2] group-focus-within:text-[#f07c28] transition-colors" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#fdf8f4] border border-[#f07c28]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f07c28]/40 focus:bg-white text-[#393939] font-mono tracking-wider transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button
              type="submit" disabled={loading}
              className="w-full p-4 bg-[#393939] text-white font-bold rounded-xl hover:bg-black hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group-hover:bg-[#f07c28]"
            >
              {loading ? 'Resetting...' : <>Save New Password <CheckCircle className="w-4 h-4" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
