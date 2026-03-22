'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import Logo from '@/components/shared/Logo';
import { ArrowLeft, Mail, KeyRound, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP, 3 = new password, 4 = success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
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
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: '1px solid #e2e8f0' }}>
          {/* Step indicator */}
          {step < 4 && (
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                    style={{
                      backgroundColor: step >= s ? '#f07c28' : '#f1f5f9',
                      color: step >= s ? '#fff' : '#94a3b8',
                    }}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div className="flex-1 h-0.5 rounded" style={{ backgroundColor: step > s ? '#f07c28' : '#e2e8f0' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm font-medium mb-4" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {/* Step 1: Enter email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="text-center mb-2">
                <Mail size={32} className="mx-auto mb-3" style={{ color: '#f07c28' }} />
                <h1 className="text-xl font-extrabold" style={{ color: '#393939' }}>Reset your password</h1>
                <p className="text-sm mt-1" style={{ color: '#A4B6C2' }}>Enter your email to receive an OTP</p>
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
                  style={inputStyle}
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
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center mb-2">
                <KeyRound size={32} className="mx-auto mb-3" style={{ color: '#f07c28' }} />
                <h1 className="text-xl font-extrabold" style={{ color: '#393939' }}>Enter verification code</h1>
                <p className="text-sm mt-1" style={{ color: '#A4B6C2' }}>We sent a code to <b>{email}</b></p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="Enter 6-digit code"
                  className="w-full rounded-xl px-4 py-3 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 transition-colors"
                  style={inputStyle}
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
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-center font-medium py-2 transition-colors"
                style={{ color: '#94a3b8' }}
              >
                ← Use a different email
              </button>
            </form>
          )}

          {/* Step 3: Set new password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-2">
                <h1 className="text-xl font-extrabold" style={{ color: '#393939' }}>Set new password</h1>
                <p className="text-sm mt-1" style={{ color: '#A4B6C2' }}>Choose a strong password</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                  style={inputStyle}
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
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                  style={inputStyle}
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
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <CheckCircle size={48} className="mx-auto" style={{ color: '#16a34a' }} />
              <h1 className="text-xl font-extrabold" style={{ color: '#393939' }}>Password reset!</h1>
              <p className="text-sm" style={{ color: '#A4B6C2' }}>
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 rounded-xl font-bold text-white text-sm text-center transition-all hover:opacity-90"
                style={{ backgroundColor: '#f07c28' }}
              >
                Go to Sign In
              </Link>
            </div>
          )}

          {step === 1 && (
            <p className="text-center text-sm mt-6" style={{ color: '#A4B6C2' }}>
              <Link href="/login" className="font-semibold transition-colors hover:opacity-80 flex items-center justify-center gap-1" style={{ color: '#475569' }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
