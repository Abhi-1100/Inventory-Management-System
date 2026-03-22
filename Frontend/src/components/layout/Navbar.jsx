'use client';

import { Bell, Search, Settings, HelpCircle, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const router = useRouter();
  
  const { user, clearAuth } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const displayName = user?.name || 'User';

  return (
    <nav className="h-16 bg-surface border-b border-border/10 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search inventory, orders, or reports... (Cmd+K)" 
            className="w-full pl-10 pr-4 py-2 bg-bg border border-border/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted/50"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-text-muted bg-surface border border-border/20 rounded">⌘</kbd>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-text-muted bg-surface border border-border/20 rounded">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-border/10">
          <button className="p-2 text-text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition-all relative group">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
          </button>
          
          <button className="p-2 text-text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
          
          <Link href="/settings" className="p-2 text-text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition-all">
            <Settings className="w-5 h-5" />
          </Link>
        </div>

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-bg p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-text-primary leading-none">{displayName}</p>
              <p className="text-xs text-text-muted mt-1">{user?.email || 'user@example.com'}</p>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent overflow-hidden shadow-inner">
              <span className="font-bold text-sm tracking-wider">
                {displayName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-lg border border-border/10 py-2 animate-fade-in-up origin-top-right">
              <div className="px-4 py-2 border-b border-border/10 md:hidden">
                <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
                <p className="text-xs text-text-muted truncate">{user?.email || 'user@example.com'}</p>
              </div>
              
              <Link 
                href="/profile" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/5 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
