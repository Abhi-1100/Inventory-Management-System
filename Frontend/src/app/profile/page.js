'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { User, Mail, Phone, Briefcase, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    title: ''
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch complete profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me'); // Gets fresh user data including phone/title
        const userData = res.data.data;
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          title: userData.title || ''
        });
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.put('/profile', profileData);
      setAuth(res.data.data, token); // Update store
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.put('/profile/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setMessage('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Your Profile</h1>
        <p className="text-text-muted mt-2">Manage your personal information and security settings.</p>
      </div>

      {(message || error) && (
        <div className={`p-4 rounded-lg flex items-start gap-3 shadow-sm ${message ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
          {message ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
          <p className={`text-sm font-medium leading-snug ${message ? 'text-green-800' : 'text-red-800'}`}>
            {message || error}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Col - Avatar & Basic Info summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface rounded-2xl shadow-sm border border-border/10 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 rounded-full bg-accent/10 border-4 border-white shadow-xl flex items-center justify-center text-accent overflow-hidden mb-6 relative">
              <span className="font-bold text-4xl tracking-wider">
                {profileData.name ? profileData.name.substring(0, 2).toUpperCase() : 'U'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-1">{profileData.name || 'User'}</h3>
            <p className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full inline-block mb-2">
              {profileData.title || 'Role Unassigned'}
            </p>
            <p className="text-sm text-text-muted">{profileData.email}</p>
          </div>
        </div>

        {/* Right Col - Forms */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Profile Form */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border/10 overflow-hidden">
            <div className="p-6 border-b border-border/10 bg-bg/50">
              <h3 className="text-lg font-bold text-text-primary">Personal Information</h3>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2 group col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-text-primary ml-1 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg/50 border border-border/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:bg-surface text-text-primary transition-all"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2 group col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-text-primary ml-1 uppercase tracking-wide">Email</label>
                  <div className="relative cursor-not-allowed">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-border/5 border border-border/10 rounded-xl text-text-muted transition-all cursor-not-allowed"
                      value={profileData.email}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted ml-1 italic">Email cannot be changed directly.</p>
                </div>

                <div className="space-y-2 group col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-text-primary ml-1 uppercase tracking-wide">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                    <input
                      type="text"
                      placeholder="e.g. Warehouse Manager"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg/50 border border-border/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:bg-surface text-text-primary transition-all"
                      value={profileData.title}
                      onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2 group col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-text-primary ml-1 uppercase tracking-wide">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg/50 border border-border/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:bg-surface text-text-primary transition-all"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-bold rounded-lg hover:bg-accent-hover hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border/10 overflow-hidden">
            <div className="p-6 border-b border-border/10 bg-bg/50">
              <h3 className="text-lg font-bold text-text-primary">Change Password</h3>
            </div>
            
            <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2 group">
                  <label className="text-xs font-bold text-text-primary ml-1 uppercase tracking-wide">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg/50 border border-border/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:bg-surface text-text-primary font-mono tracking-wider transition-all"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-xs font-bold text-text-primary ml-1 uppercase tracking-wide">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg/50 border border-border/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:bg-surface text-text-primary font-mono tracking-wider transition-all"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-xs font-bold text-text-primary ml-1 uppercase tracking-wide">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent transition-colors" />
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg/50 border border-border/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:bg-surface text-text-primary font-mono tracking-wider transition-all"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-start pt-4">
                <button
                  type="submit"
                  disabled={loading || !passwords.currentPassword || !passwords.newPassword}
                  className="px-6 py-2.5 bg-bg border-2 border-border/20 text-text-primary font-bold rounded-lg hover:border-accent hover:text-accent transition-all disabled:opacity-50 disabled:hover:border-border/20"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
