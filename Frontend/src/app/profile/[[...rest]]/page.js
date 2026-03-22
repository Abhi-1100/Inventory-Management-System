'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { User, Mail, Phone, Briefcase, Lock, Save } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    api.get('/profile')
      .then((res) => {
        setProfile(res.data);
        setName(res.data.name || '');
        setEmail(res.data.email || '');
        setPhone(res.data.phone || '');
        setTitle(res.data.title || '');
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/profile', { name, email, phone, title });
      setProfile(res.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put('/profile/password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
  };

  return (
    <AppLayout>
      <Toaster position="bottom-right" />
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#0f172a' }}>Profile Settings</h1>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Manage your account information</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 animate-pulse" style={{ border: '1px solid #e2e8f0' }}>
            <div className="h-6 w-48 bg-slate-100 rounded mb-6" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Profile Info Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: '1px solid #e2e8f0' }}>
              {/* Header with avatar */}
              <div className="flex items-center gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#F2C18D' }}
                >
                  <span className="text-2xl font-bold text-white">
                    {(name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>{name || 'User'}</h2>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>
                    {profile?.role?.toUpperCase() || 'STAFF'} · {profile?.totalActions || 0} actions performed
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>
                      <User size={14} style={{ color: '#94a3b8' }} /> Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>
                      <Mail size={14} style={{ color: '#94a3b8' }} /> Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>
                      <Phone size={14} style={{ color: '#94a3b8' }} /> Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Optional"
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>
                      <Briefcase size={14} style={{ color: '#94a3b8' }} /> Job Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Optional"
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: '#f07c28' }}
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Change Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: '1px solid #e2e8f0' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Lock size={20} style={{ color: '#64748b' }} />
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#0f172a' }}>Password</h3>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Update your password</p>
                  </div>
                </div>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                  >
                    Change Password
                  </button>
                )}
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-4 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <div className="pt-4">
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
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
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#393939' }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}
                      className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                      style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ backgroundColor: '#f07c28' }}
                    >
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
