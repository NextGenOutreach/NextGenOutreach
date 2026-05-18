"use client";

import React from 'react';
import { MarketingNav } from '@/components/marketing-nav';
import { SiteFooter } from '@/components/marketing';
import { SDRMarketplace } from '@/components/SDRMarketplace';
import { FloatingDecoration, BackgroundPatterns } from '@/components/ui/Decoration';

export default function MarketplacePage() {
  return (
    <div className="max-shell overflow-x-hidden min-h-screen text-white font-sans bg-background">
      <MarketingNav />

      <section className="relative pt-[120px] pb-20 px-4 md:px-10 overflow-hidden">
        <BackgroundPatterns opacity={0.1} />
        <div className="bg-massive opacity-10">MARKET</div>
        
        <FloatingDecoration emoji="🔍" top="15%" left="5%" animation="animate-float" />
        <FloatingDecoration emoji="🤝" top="25%" right="8%" animation="animate-float-reverse" />
        <FloatingDecoration shape="circle" color="var(--accent-1)" size="400px" top="-100px" right="-100px" opacity={0.05} />

        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mb-16">
            <span className="section-tag mb-6">💎 Vetted Talent</span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight headline-shadow mb-6">
              The <span className="grad-text">Squadron</span> Marketplace
            </h1>
            <p className="text-xl font-bold text-white/70 leading-relaxed">
              Browse ID-verified LinkedIn outreach professionals. Every rep is vetted for technical proficiency, niche expertise, and compliance.
            </p>
          </div>

          <SDRMarketplace />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
