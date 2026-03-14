'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { User, Lock, Edit2, LayoutDashboard, Package, PackageOpen, Truck, History, Settings, Bell, HelpCircle, LogOut } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

export default function ProfilePage() {
  const { user, setAuth, token, clearAuth } = useAuthStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: '+1 (555) 123-4567', title: 'System Administrator' },
  });
  const passwordForm = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user) {
      profileForm.setValue('name', user.name);
      profileForm.setValue('email', user.email);
    }
  }, [user, profileForm]);

  const onSaveProfile = async (data) => {
    setSavingProfile(true);
    try {
      const res = await api.put('/profile', { name: data.name, email: data.email });
      setAuth(res.data, token);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed', { duration: 5000 });
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match', { duration: 4000 });
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/profile/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully!');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed', { duration: 5000 });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const inputStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #E5E7EB',
    color: '#393939',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s'
  };

  const inputFocusStyle = (e) => {
    e.target.style.borderColor = '#393939';
    e.target.style.boxShadow = '0 0 0 2px rgba(57,57,57,0.1)';
  };

  const inputBlurStyle = (e) => {
    e.target.style.borderColor = '#E5E7EB';
    e.target.style.boxShadow = 'none';
  };

  return (
    <AppLayout>
      <Toaster position="top-right" />
      


      <div className="pt-8 pb-12 max-w-[1200px] mx-auto">
        {/* Page Header */}
        <div className="mb-8 pl-1">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1" style={{ color: '#393939' }}>My Profile</h1>
          <p className="text-sm font-medium" style={{ color: '#A4B6C2' }}>Manage your personal information and security settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT COLUMN - USER CARD & PREFS */}
          <div className="w-full lg:w-[340px] flex flex-col gap-6 shrink-0">
            
            {/* User Avatar Card */}
            <div className="rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden" 
                 style={{ backgroundColor: '#F8F9FA', border: '1px solid #F0F0F0' }}>
              <div className="relative mb-5">
                <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center" 
                     style={{ backgroundColor: '#F2C18D', borderColor: '#ffffff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  {/* Blank avatar filler */}
                </div>
                {/* Edit avatar button */}
                <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
                        style={{ backgroundColor: '#393939', border: '2px solid #ffffff' }}>
                  <Edit2 size={12} fill="currentColor" />
                </button>
              </div>

              <h2 className="text-xl font-bold mb-1" style={{ color: '#393939' }}>{user?.name || 'Alex Thompson'}</h2>
              <p className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: '#A4B6C2' }}>{user?.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'STAFF MEMBER'}</p>

              <div className="flex gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full" 
                      style={{ backgroundColor: '#FFF3E0', color: '#F27D21' }}>
                  Superuser
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full" 
                      style={{ backgroundColor: '#E2E8F0', color: '#64748B' }}>
                  HQ-London
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex gap-4">
              <div className="flex-1 rounded-2xl p-5" style={{ backgroundColor: '#F8F9FA', border: '1px solid #F0F0F0' }}>
                <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: '#A4B6C2' }}>Total Actions</p>
                <p className="text-2xl font-extrabold" style={{ color: '#393939' }}>1,284</p>
              </div>
              <div className="flex-1 rounded-2xl p-5" style={{ backgroundColor: '#F8F9FA', border: '1px solid #F0F0F0' }}>
                <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: '#A4B6C2' }}>Last Login</p>
                <p className="text-2xl font-extrabold" style={{ color: '#393939' }}>2h ago</p>
              </div>
            </div>

            {/* Preferences Modal style block */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#F8F9FA', border: '1px solid #F0F0F0' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#393939' }}>Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: '#393939' }}>Stock alerts</span>
                  <div className="w-11 h-6 bg-[#393939] rounded-full relative cursor-pointer flex items-center border-2 border-[#393939]">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0 shadow-sm" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: '#393939' }}>New deliveries</span>
                  <div className="w-11 h-6 bg-[#393939] rounded-full relative cursor-pointer flex items-center border-2 border-[#393939]">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0 shadow-sm" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: '#393939' }}>System updates</span>
                  <div className="w-11 h-6 bg-[#E5E7EB] rounded-full relative cursor-pointer flex items-center">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - FORMS */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Personal Info Form */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #F0F0F0', backgroundColor: '#ffffff' }}>
              <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: '#F8F9FA', borderBottom: '1px solid #F0F0F0' }}>
                <User size={18} style={{ color: '#A4B6C2' }} />
                <h2 className="text-sm font-bold" style={{ color: '#393939' }}>Personal Information</h2>
              </div>
              
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#A4B6C2' }}>Full Name</label>
                    <input {...profileForm.register('name', { required: true })} style={inputStyle} onFocus={inputFocusStyle} onBlur={inputBlurStyle} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#A4B6C2' }}>Email Address</label>
                    <input {...profileForm.register('email', { required: true })} type="email" style={inputStyle} onFocus={inputFocusStyle} onBlur={inputBlurStyle} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#A4B6C2' }}>Phone Number</label>
                    <input {...profileForm.register('phone')} style={inputStyle} onFocus={inputFocusStyle} onBlur={inputBlurStyle} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#A4B6C2' }}>Job Title</label>
                    <input {...profileForm.register('title')} style={inputStyle} onFocus={inputFocusStyle} onBlur={inputBlurStyle} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={savingProfile} className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#393939' }}>
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security & Authentication Form */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #F0F0F0', backgroundColor: '#ffffff' }}>
              <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: '#F8F9FA', borderBottom: '1px solid #F0F0F0' }}>
                <Lock size={18} style={{ color: '#A4B6C2' }} />
                <h2 className="text-sm font-bold" style={{ color: '#393939' }}>Security & Authentication</h2>
              </div>
              
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#A4B6C2' }}>Current Password</label>
                    <input {...passwordForm.register('currentPassword', { required: true })} type="password" placeholder="••••••••" style={inputStyle} onFocus={inputFocusStyle} onBlur={inputBlurStyle} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#A4B6C2' }}>New Password</label>
                    <input {...passwordForm.register('newPassword', { required: true, minLength: 6 })} type="password" placeholder="Min. 8 chars" style={inputStyle} onFocus={inputFocusStyle} onBlur={inputBlurStyle} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#A4B6C2' }}>Confirm New Password</label>
                    <input {...passwordForm.register('confirmPassword', { required: true })} type="password" placeholder="Repeat password" style={inputStyle} onFocus={inputFocusStyle} onBlur={inputBlurStyle} />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px dashed #E5E7EB' }}>
                  <p className="text-xs italic" style={{ color: '#A4B6C2' }}>
                    <span className="inline-block w-4 h-4 rounded-full text-center leading-4 font-bold mr-1" style={{ backgroundColor: '#E5E7EB', color: '#ffffff' }}>i</span>
                    Changing password will log you out of all devices.
                  </p>
                  <button type="submit" disabled={savingPassword} className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors hover:bg-gray-200 disabled:opacity-50" style={{ backgroundColor: '#E5E7EB', color: '#393939' }}>
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl overflow-hidden mt-2" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
              <div className="px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: '#991B1B' }}>Danger Zone</h3>
                  <p className="text-xs mt-1" style={{ color: '#DC2626' }}>Deactivating your account will immediately revoke all access.</p>
                </div>
                <button type="button" className="px-5 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors hover:bg-red-50" style={{ color: '#DC2626', border: '1px solid #FCA5A5', backgroundColor: '#ffffff' }}>
                  Deactivate
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
}
