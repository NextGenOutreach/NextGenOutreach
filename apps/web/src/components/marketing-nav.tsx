"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MarketingNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const getHashLink = (hash: string) => isHome ? hash : `/${hash}`;

  return (
    <nav className="custom-nav">
      <Link href="/" className="nav-logo">Next<span>Gen</span>Outreach</Link>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden ml-auto mr-4 p-2 text-white"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          {menuOpen
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
      </button>

      {/* Desktop links */}
      <ul className="nav-links hidden lg:flex">
        <li><Link href={getHashLink("#how")}>How It Works</Link></li>
        <li><Link href={getHashLink("#pricing")}>Pricing</Link></li>
        <li><Link href="/marketplace">Marketplace</Link></li>
        <li><Link href="/become-an-outreach-agent">Become a Rep</Link></li>
      </ul>
      <Link href="/#pricing" className="nav-cta hidden lg:inline-flex">Hire Reps →</Link>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          <Link href={getHashLink("#how")} onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link href={getHashLink("#pricing")} onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link href="/marketplace" onClick={() => setMenuOpen(false)}>Marketplace</Link>
          <Link href="/become-an-outreach-agent" onClick={() => setMenuOpen(false)}>Become a Rep</Link>
          <Link href="/#pricing" className="nav-cta mt-4" onClick={() => setMenuOpen(false)}>Hire Reps →</Link>
        </div>
      )}
    </nav>
  );
}
