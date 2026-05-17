"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV_BY_ROLE: Record<string, { name: string; href: string; icon: string }[]> = {
  client: [
    { name: 'Overview',    href: '/dashboard/client/overview',    icon: '📊' },
    { name: 'Campaigns',   href: '/dashboard/client/campaigns',   icon: '🚀' },
    { name: 'Marketplace', href: '/dashboard/client/marketplace', icon: '🔍' },
    { name: 'Profile',     href: '/dashboard/client/profile',     icon: '👤' },
  ],
  rep: [
    { name: 'Overview', href: '/dashboard/rep/overview', icon: '📊' },
    { name: 'Tasks',    href: '/dashboard/rep/tasks',    icon: '✅' },
    { name: 'Earnings', href: '/dashboard/rep/earnings', icon: '💸' },
    { name: 'Profile',  href: '/dashboard/rep/profile',  icon: '👤' },
    { name: 'Vault',    href: '/dashboard/vault',        icon: '🔐' },
  ],
  admin: [
    { name: 'Overview', href: '/dashboard/admin/overview', icon: '📊' },
    { name: 'Users',    href: '/dashboard/admin/users',    icon: '👥' },
    { name: 'Missions', href: '/dashboard/missions',       icon: '🎯' },
    { name: 'Agents',   href: '/dashboard/agents',         icon: '🧑‍💼' },
    { name: 'Vault',    href: '/dashboard/vault',          icon: '🔐' },
  ],
  super_admin: [
    { name: 'Overview', href: '/dashboard/admin/overview', icon: '📊' },
    { name: 'Users',    href: '/dashboard/admin/users',    icon: '👥' },
    { name: 'Missions', href: '/dashboard/missions',       icon: '🎯' },
    { name: 'Agents',   href: '/dashboard/agents',         icon: '🧑‍💼' },
    { name: 'Vault',    href: '/dashboard/vault',          icon: '🔐' },
  ],
};

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  client:      { label: 'Client',      color: 'var(--accent-2)' },
  rep:         { label: 'Rep',         color: 'var(--accent-3)' },
  admin:       { label: 'Admin',       color: 'var(--accent-1)' },
  super_admin: { label: 'Super Admin', color: 'var(--accent-1)' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent-1 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-white/30">Loading</p>
        </div>
      </div>
    );
  }

  const role = user.role;
  const nav = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.client;
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.client;

  const initials = (user.displayName ?? user.email ?? 'U')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 flex flex-col
        bg-background border-r border-white/[0.07]
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex h-16 items-center px-5 border-b border-white/[0.07] shrink-0">
          <Link href="/" className="font-black uppercase tracking-tight text-white text-lg leading-none">
            Next<span style={{ color: 'var(--accent-1)' }}>Gen</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all"
                style={{
                  background: active ? 'rgba(255,58,242,0.1)' : 'transparent',
                  color: active ? 'var(--accent-1)' : 'rgba(255,255,255,0.45)',
                  borderLeft: active ? '3px solid var(--accent-1)' : '3px solid transparent',
                }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/[0.07] p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-background shrink-0"
              style={{ background: badge.color }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">{user?.displayName || 'User'}</p>
              <p className="text-[11px] font-bold truncate" style={{ color: badge.color }}>{badge.label}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-center text-xs font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors py-1"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar (mobile only trigger + breadcrumb) */}
        <div className="sticky top-0 z-40 flex h-14 items-center gap-4 px-4 border-b border-white/[0.07] bg-background/90 backdrop-blur-sm lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-white/40 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
            style={{ borderColor: badge.color + '40', color: badge.color, background: badge.color + '10' }}
          >
            {badge.label}
          </span>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
