'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { Boxes, ArrowRight, Mail, KeyRound, Lock } from 'lucide-react';
import { forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from '@/schemas/auth.schema';
import api from '@/lib/axios';
import Link from 'next/link';

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#F3F4F6' }}>
      <Toaster position="top-right" />
      
      {/* Branding Header */}
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: '#F27D21' }}>
          <Boxes size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#393939' }}>CoreInventory</h1>
        <p className="text-sm mt-1" style={{ color: '#A4B6C2' }}>Manage your inventory with precision</p>
      </header>

      <main className="w-full max-w-md">
        <div 
          className="bg-white p-8 md:p-10"
          style={{ 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            borderRadius: '1rem'
          }}
        >
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            {/* Step 1 */}
            <div className="flex items-center">
              <span 
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors"
                style={step >= 0 ? { backgroundColor: '#393939', color: '#fff' } : { border: '2px solid #A4B6C2', color: '#A4B6C2' }}
              >
                1
              </span>
              <div className="h-px w-8 mx-2" style={{ backgroundColor: '#A4B6C2' }} />
            </div>
            {/* Step 2 */}
            <div className="flex items-center">
              <span 
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors"
                style={step >= 1 ? { backgroundColor: '#393939', color: '#fff' } : { border: '2px solid #A4B6C2', color: '#A4B6C2' }}
              >
                2
              </span>
              <div className="h-px w-8 mx-2" style={{ backgroundColor: '#A4B6C2' }} />
            </div>
            {/* Step 3 */}
            <div className="flex items-center">
              <span 
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors"
                style={step >= 2 ? { backgroundColor: '#393939', color: '#fff' } : { border: '2px solid #A4B6C2', color: '#A4B6C2' }}
              >
                3
              </span>
            </div>
          </div>

          {/* Step 1: Email */}
          {step === 0 && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#393939' }}>Forgot password?</h2>
                <p className="text-sm" style={{ color: '#A4B6C2' }}>Enter your email to receive a one-time passcode.</p>
              </div>

              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#393939' }}>Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail size={18} style={{ color: '#A4B6C2' }} />
                    </div>
                    <input
                      {...emailForm.register('email')}
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all"
                      style={{ 
                        backgroundColor: 'rgba(249,250,251,0.5)', 
                        borderColor: emailForm.formState.errors.email ? '#ef4444' : '#E5E7EB',
                        color: '#393939'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#393939'; e.target.style.boxShadow = '0 0 0 2px rgba(57,57,57,0.2)'; }}
                      onBlur={(e) => { e.target.style.borderColor = emailForm.formState.errors.email ? '#ef4444' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {emailForm.formState.errors.email && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{emailForm.formState.errors.email.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
                  style={{ backgroundColor: '#393939' }}
                  onMouseOver={(e) => { if(!loading) e.currentTarget.style.opacity = '0.9'; }}
                  onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <span>{loading ? 'Sending...' : 'Send OTP'}</span>
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 1 && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#393939' }}>Verify OTP</h2>
                <p className="text-sm" style={{ color: '#A4B6C2' }}>We sent a passcode to <span className="font-semibold" style={{ color: '#393939' }}>{email}</span></p>
              </div>

              <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium mb-2" style={{ color: '#393939' }}>One-time passcode</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <KeyRound size={18} style={{ color: '#A4B6C2' }} />
                    </div>
                    <input
                      {...otpForm.register('otp')}
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all"
                      style={{ 
                        backgroundColor: 'rgba(249,250,251,0.5)', 
                        borderColor: otpForm.formState.errors.otp ? '#ef4444' : '#E5E7EB',
                        color: '#393939',
                        letterSpacing: '0.2em',
                        fontWeight: 'bold'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#393939'; e.target.style.boxShadow = '0 0 0 2px rgba(57,57,57,0.2)'; }}
                      onBlur={(e) => { e.target.style.borderColor = otpForm.formState.errors.otp ? '#ef4444' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {otpForm.formState.errors.otp && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{otpForm.formState.errors.otp.message}</p>}
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
                    style={{ backgroundColor: '#393939' }}
                    onMouseOver={(e) => { if(!loading) e.currentTarget.style.opacity = '0.9'; }}
                    onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
                    {!loading && <ArrowRight size={18} />}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep(0)}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition-all disabled:opacity-50 hover:bg-gray-50 text-sm"
                    style={{ color: '#393939', border: '1px solid #E5E7EB' }}
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 2 && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#393939' }}>Set new password</h2>
                <p className="text-sm" style={{ color: '#A4B6C2' }}>Choose a strong password for your account.</p>
              </div>

              <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-2" style={{ color: '#393939' }}>New password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock size={18} style={{ color: '#A4B6C2' }} />
                    </div>
                    <input
                      {...resetForm.register('newPassword')}
                      id="newPassword"
                      type="password"
                      placeholder="Min 6 characters"
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all"
                      style={{ 
                        backgroundColor: 'rgba(249,250,251,0.5)', 
                        borderColor: resetForm.formState.errors.newPassword ? '#ef4444' : '#E5E7EB',
                        color: '#393939'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#393939'; e.target.style.boxShadow = '0 0 0 2px rgba(57,57,57,0.2)'; }}
                      onBlur={(e) => { e.target.style.borderColor = resetForm.formState.errors.newPassword ? '#ef4444' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {resetForm.formState.errors.newPassword && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{resetForm.formState.errors.newPassword.message}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#393939' }}>Confirm password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock size={18} style={{ color: '#A4B6C2' }} />
                    </div>
                    <input
                      {...resetForm.register('confirmPassword')}
                      id="confirmPassword"
                      type="password"
                      placeholder="Repeat password"
                      className="block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all"
                      style={{ 
                        backgroundColor: 'rgba(249,250,251,0.5)', 
                        borderColor: resetForm.formState.errors.confirmPassword ? '#ef4444' : '#E5E7EB',
                        color: '#393939'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#393939'; e.target.style.boxShadow = '0 0 0 2px rgba(57,57,57,0.2)'; }}
                      onBlur={(e) => { e.target.style.borderColor = resetForm.formState.errors.confirmPassword ? '#ef4444' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {resetForm.formState.errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{resetForm.formState.errors.confirmPassword.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98] mt-2"
                  style={{ backgroundColor: '#393939' }}
                  onMouseOver={(e) => { if(!loading) e.currentTarget.style.opacity = '0.9'; }}
                  onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </div>
          )}

          {/* Bottom Divider and Link */}
          <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: '#F0F0F0' }}>
            <Link 
              href="/login" 
              className="text-sm font-medium hover:underline transition-colors" 
              style={{ color: '#A4B6C2' }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#393939'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#A4B6C2'; }}
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 flex space-x-6 text-xs" style={{ color: '#A4B6C2' }}>
        <a href="#" className="transition-colors hover:text-gray-600">Privacy Policy</a>
        <a href="#" className="transition-colors hover:text-gray-600">Terms of Service</a>
        <a href="#" className="transition-colors hover:text-gray-600">Help Center</a>
      </footer>
    </div>
  );
}
