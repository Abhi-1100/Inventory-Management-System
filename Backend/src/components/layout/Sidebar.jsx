'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PackageOpen,
  Truck,
  ArrowLeftRight,
  ClipboardList,
  History,
  Settings,
  UserCircle,
  LogOut,
  Boxes,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Receipts', href: '/operations/receipts', icon: PackageOpen },
  { label: 'Deliveries', href: '/operations/deliveries', icon: Truck },
  { label: 'Transfers', href: '/operations/transfers', icon: ArrowLeftRight },
  { label: 'Adjustments', href: '/operations/adjustments', icon: ClipboardList },
  { label: 'Move History', href: '/move-history', icon: History },
  { label: 'Settings', href: '/settings/warehouses', icon: Settings },
  { label: 'My Profile', href: '/profile', icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-60 h-screen flex-shrink-0 bg-bg-surface border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="p-1.5 bg-accent rounded-lg">
          <Boxes size={18} className="text-white" />
        </div>
        <span className="text-base font-bold text-text-primary tracking-tight">
          Core<span className="text-accent">Inventory</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${active
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card border border-transparent'
                }`}
            >
              <Icon size={17} className={active ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-all border border-transparent hover:border-danger/20"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
