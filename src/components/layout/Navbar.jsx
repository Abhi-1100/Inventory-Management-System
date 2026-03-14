'use client';
import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { user } = useAuthStore();

  return (
    <header
      className="h-16 flex-shrink-0 flex items-center justify-between px-8 sticky top-0 z-10"
      style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}
    >
      {/* Search */}
      <div className="relative w-96">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search inventory, orders..."
          className="w-full rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: '#64748b' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Bell size={20} />
          {/* Orange dot */}
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-white"
            style={{ backgroundColor: '#f07c28' }}
          />
        </button>

        {/* Divider */}
        <div className="h-8 w-px" style={{ backgroundColor: '#e2e8f0' }} />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{user?.name || 'User'}</p>
            <p className="text-xs capitalize" style={{ color: '#94a3b8' }}>{user?.role || 'staff'}</p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0"
            style={{ backgroundColor: 'rgba(240,124,40,0.15)', borderColor: 'rgba(240,124,40,0.2)' }}
          >
            <span className="text-sm font-bold" style={{ color: '#f07c28' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
