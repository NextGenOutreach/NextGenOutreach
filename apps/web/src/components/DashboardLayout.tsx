"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Intelligence', href: '/dashboard', icon: '🧠' },
    { label: 'Missions', href: '/dashboard/missions', icon: '🚀' },
    { label: 'Agents', href: '/dashboard/agents', icon: '👥' },
    { label: 'Lead Vault', href: '/dashboard/vault', icon: '🔐' },
  ];

  return (
    <div className="max-shell min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-muted/80 backdrop-blur-xl border-b-4 md:border-b-0 md:border-r-4 border-accent-1 p-8 flex flex-col">
        <div className="mb-12">
          <Link href="/" className="text-2xl font-black uppercase tracking-widest text-white">
            Next<span className="text-accent-1">Gen</span>
            <br />
            <span className="text-accent-2">Outreach</span>
          </Link>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mt-2">Command Center v1.0</p>
        </div>
        
        <nav className="flex-1 space-y-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.label}
                href={item.href} 
                className={`flex items-center gap-3 text-lg font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'text-accent-3 headline-shadow translate-x-2' 
                    : 'text-white/60 hover:text-white hover:translate-x-1'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t-2 border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-5 border-2 border-accent-1 flex items-center justify-center font-black">OP</div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white">Operator</p>
              <p className="text-[10px] font-bold text-white/40">ID: 592-X</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        <header className="px-8 py-6 flex flex-wrap justify-between items-center gap-4 border-b-4 border-accent-3 bg-muted/40 backdrop-blur-md">
          <h2 className="text-3xl font-black uppercase headline-shadow tracking-tighter">Tactical Overview</h2>
          <Link href="/dashboard" className="max-button py-2 text-xs">Initialize New Mission 🚀</Link>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};
