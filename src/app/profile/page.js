'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { User, Lock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });
  const passwordForm = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user) {
      profileForm.setValue('name', user.name);
      profileForm.setValue('email', user.email);
    }
  }, [user]);

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

  const cls = `w-full bg-bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors`;

  return (
    <AppLayout>
      <Toaster position="bottom-right" />
      <PageHeader title="My Profile" subtitle="Manage your account settings" />

      <div className="max-w-lg space-y-5">
        {/* Profile info */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <User size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Personal Information</h2>
              <p className="text-xs text-text-muted capitalize">{user?.role}</p>
            </div>
          </div>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full name</label>
              <input {...profileForm.register('name', { required: true })} className={cls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email address</label>
              <input {...profileForm.register('email', { required: true })} type="email" className={cls} />
            </div>
            <button type="submit" disabled={savingProfile} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-bg-surface border border-border flex items-center justify-center">
              <Lock size={18} className="text-text-muted" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">Change Password</h2>
          </div>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Current password</label>
              <input {...passwordForm.register('currentPassword', { required: true })} type="password" className={cls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">New password</label>
              <input {...passwordForm.register('newPassword', { required: true, minLength: 6 })} type="password" className={cls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm new password</label>
              <input {...passwordForm.register('confirmPassword', { required: true })} type="password" className={cls} />
            </div>
            <button type="submit" disabled={savingPassword} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
