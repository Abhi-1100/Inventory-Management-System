'use client';
import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 flex-shrink-0 bg-bg-surface border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Quick search..."
          className="bg-bg border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors w-72"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications bell */}
        <button className="relative p-2 rounded-lg hover:bg-bg-card text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border">
          <Bell size={18} />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent/20 border border-accent/30 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-accent">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-text-primary leading-none">{user?.name || 'User'}</p>
            <p className="text-xs text-text-muted mt-0.5 capitalize">{user?.role || 'staff'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
