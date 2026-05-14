"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const navigation = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Campaigns', href: '/dashboard/client/campaigns' },
    { name: 'Marketplace', href: '/dashboard/client/marketplace' },
    { name: 'Tasks', href: '/dashboard/rep/tasks' },
    { name: 'Earnings', href: '/dashboard/rep/earnings' },
    { name: 'Analytics', href: '/dashboard/analytics' },
    { name: 'Billing', href: '/dashboard/billing' },
    { name: 'Users', href: '/dashboard/admin/users' },
    { name: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-accent-3/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-accent-3/20">
            <Link href="/" className="text-xl font-bold text-white">
              NextGenOutreach
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${isActive(item.href)
                    ? 'bg-accent-1/20 text-accent-1'
                    : 'text-muted-foreground hover:text-white hover:bg-accent-3/10'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-accent-3/20 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-1 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.displayName || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
              </div>
            </div>
            <button onClick={handleSignOut} className="mt-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-card border-b border-accent-3/20">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb */}
            <div className="flex-1 lg:hidden">
              <p className="text-sm text-muted-foreground">Dashboard</p>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-muted-foreground hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
