'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    clearAuth();
    router.push('/login');
  };

  const displayName = user?.name || 'User';
  const roleName = user?.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'STAFF MEMBER';

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

        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-2 rounded-lg transition-colors focus:outline-none"
            style={{ backgroundColor: dropdownOpen ? '#f8fafc' : 'transparent' }}
            onMouseOver={(e) => { if(!dropdownOpen) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseOut={(e) => { if(!dropdownOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold truncate transition-colors" style={{ color: '#393939' }}>{displayName}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold truncate" style={{ color: '#A4B6C2' }}>
                {user?.role === 'manager' ? 'MANAGER' : roleName}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 overflow-hidden"
              style={{ backgroundColor: '#F2C18D', borderColor: '#F2C18D' }}
            >
              <span className="text-xl font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-56 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] bg-white ring-1 ring-black ring-opacity-5 overflow-hidden origin-top-right z-50 transition-all"
              style={{ border: '1px solid #e2e8f0' }}
            >
              <div className="p-3 border-b border-gray-100 sm:hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider truncate mt-0.5">{roleName}</p>
              </div>
              <div className="p-2 space-y-1">
                <Link 
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
                >
                  <User size={16} className="text-gray-400" />
                  View Profile
                </Link>
                <div className="h-px bg-gray-100 my-1 mx-2" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 w-full text-left transition-colors font-medium"
                >
                  <LogOut size={16} className="text-red-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
