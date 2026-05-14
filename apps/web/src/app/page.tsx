"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MarketingNav } from '@/components/marketing-nav';
import { SiteFooter } from '@/components/marketing';
import { MaxButton } from '@/components/ui/MaxButton';
import { MaxCard } from '@/components/ui/MaxCard';
import { FloatingDecoration, BackgroundPatterns } from '@/components/ui/Decoration';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openRepModal = () => {
    setIsModalOpen(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeRepModal = () => {
    setIsModalOpen(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  };

  // Close modal on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRepModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="max-shell overflow-x-hidden min-h-screen text-white font-sans bg-background">
      <MarketingNav />

      {/* LANDING PAGE */}
      <div id="landing">
        {/* HERO */}
        <section className="relative min-h-screen flex items-center pt-[100px] px-4 md:px-10 overflow-hidden">
          <BackgroundPatterns opacity={0.2} />
          <div className="bg-massive">SCALE</div>
          
          {/* Floating Decorations */}
          <FloatingDecoration emoji="✨" top="12%" left="3%" animation="animate-float" size="3rem" />
          <FloatingDecoration emoji="💫" top="20%" right="5%" animation="animate-float-reverse" size="2.5rem" />
          <FloatingDecoration emoji="⚡" bottom="25%" left="6%" animation="animate-wiggle" size="2rem" />
          <FloatingDecoration emoji="🔥" top="35%" left="48%" animation="animate-bounce-subtle" size="1.8rem" />
          <FloatingDecoration emoji="🚀" bottom="15%" right="8%" animation="animate-float" size="2.5rem" />
          <FloatingDecoration shape="circle" color="var(--accent-3)" size="60px" top="8%" left="45%" animation="animate-spin-slow" opacity={0.4} />

          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-[60px] items-center">
              <div>
                <div className="section-tag mb-6">🏆 Trusted by 5,000+ ID-Verified Reps</div>
                <h1 className="hero-h1">World&apos;s <span className="grad-text">#1 LinkedIn SDR</span><br/>& Reps Marketplace</h1>
                <p className="hero-sub max-w-[520px] mb-10 text-white/75 text-[1.25rem] leading-[1.7] font-bold">
                  Real people. Real profiles. Real outreach. Scale your LinkedIn pipeline with ID-verified professionals who run branded campaigns — safely, compliantly, and at scale.
                </p>
                <div className="hero-btns flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <MaxButton href="/pricing" size="lg">Hire Outreach Reps</MaxButton>
                  <MaxButton variant="secondary" onClick={openRepModal} size="lg">Earn as a Rep →</MaxButton>
                </div>
              </div>
              <div className="relative lg:h-[480px] mt-10 lg:mt-0 space-y-6 lg:space-y-0">
                <MaxCard className="lg:absolute lg:top-20 lg:left-0 lg:right-10 z-20" accentColor="var(--accent-1)" shadowColor="var(--accent-3)">
                  <div className="text-xs font-black uppercase tracking-widest text-accent-2 mb-4">Active Outreach Reps</div>
                  <div className="font-outfit font-black text-[3.5rem] leading-[1] text-accent-1 headline-shadow">5,000+</div>
                  <div className="text-sm font-bold text-white/60 mt-2 tracking-tight">ID-verified professionals worldwide</div>
                  <div className="flex items-center my-6">
                    {['👩', '👨', '🧑', '👩', '👨'].map((emoji, i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-gradient-to-br from-accent-1 to-accent-5 flex items-center justify-center text-xl -ml-3 first:ml-0 shadow-lg">
                        {emoji}
                      </div>
                    ))}
                    <span className="text-sm font-black text-white/60 ml-4 tracking-widest">+4,995 more</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-accent-1/10 border-2 border-accent-1 rounded-2xl p-3 text-center">
                      <div className="font-outfit font-black text-2xl text-accent-1">98%</div>
                      <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">Match</div>
                    </div>
                    <div className="bg-accent-2/10 border-2 border-dashed border-accent-2 rounded-2xl p-3 text-center">
                      <div className="font-outfit font-black text-2xl text-accent-2">100%</div>
                      <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">Safe</div>
                    </div>
                    <div className="bg-accent-3/10 border-2 border-accent-3 rounded-2xl p-3 text-center">
                      <div className="font-outfit font-black text-2xl text-accent-3">24h</div>
                      <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">Live</div>
                    </div>
                  </div>
                </MaxCard>
                <MaxCard 
                  className="lg:absolute lg:bottom-10 lg:right-0 z-30 p-6" 
                  accentColor="var(--accent-3)" 
                  shadowColor="var(--accent-2)"
                  dashed
                >
                  <div className="text-xs font-black uppercase tracking-widest text-accent-3 mb-2">Latest Campaign</div>
                  <div className="font-outfit font-black text-xl headline-shadow">47 meetings booked 🎯</div>
                  <div className="text-xs font-bold text-white/50 mt-1 uppercase tracking-wider">SaaS client · This week</div>
                </MaxCard>
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <div className="ticker-wrap border-y-4 border-accent-1 bg-muted/50 backdrop-blur-sm py-4 overflow-hidden">
          <div className="ticker-inner animate-marquee flex">
            <div className="ticker-item font-black uppercase tracking-widest flex items-center gap-4 whitespace-nowrap">
              <span className="w-3 h-3 rounded-full bg-accent-1 animate-pulse"></span>
              5,000+ ID-VERIFIED REPS
            </div>
            <div className="ticker-item font-black uppercase tracking-widest flex items-center gap-4 whitespace-nowrap">
              <span className="w-3 h-3 rounded-full bg-accent-2 animate-pulse"></span>
              ZERO PASSWORD SHARING
            </div>
            <div className="ticker-item font-black uppercase tracking-widest flex items-center gap-4 whitespace-nowrap">
              <span className="w-3 h-3 rounded-full bg-accent-3 animate-pulse"></span>
              100% LINKEDIN COMPLIANT
            </div>
            <div className="ticker-item font-black uppercase tracking-widest flex items-center gap-4 whitespace-nowrap">
              <span className="w-3 h-3 rounded-full bg-accent-4 animate-pulse"></span>
              FROM $75/MONTH PER AGENT
            </div>
            {/* Duplicate content for seamless scrolling */}
            <div className="ticker-item font-black uppercase tracking-widest flex items-center gap-4 whitespace-nowrap">
              <span className="w-3 h-3 rounded-full bg-accent-1 animate-pulse"></span>
              5,000+ ID-VERIFIED REPS
            </div>
            <div className="ticker-item font-black uppercase tracking-widest flex items-center gap-4 whitespace-nowrap">
              <span className="w-3 h-3 rounded-full bg-accent-2 animate-pulse"></span>
              ZERO PASSWORD SHARING
            </div>
            <div className="ticker-item font-black uppercase tracking-widest flex items-center gap-4 whitespace-nowrap">
              <span className="w-3 h-3 rounded-full bg-accent-3 animate-pulse"></span>
              100% LINKEDIN COMPLIANT
            </div>
            <div className="ticker-item font-black uppercase tracking-widest flex items-center gap-4 whitespace-nowrap">
              <span className="w-3 h-3 rounded-full bg-accent-4 animate-pulse"></span>
              FROM $75/MONTH PER AGENT
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="relative py-16 md:py-32 px-4 md:px-10 overflow-hidden" id="how">
           <div className="absolute inset-0 pattern-checker text-accent-3/5 opacity-40" />
           <FloatingDecoration emoji="💡" top="10%" right="4%" animation="animate-float" />
           <FloatingDecoration emoji="🎯" bottom="10%" left="3%" animation="animate-wiggle" />
           <div className="container mx-auto relative z-10">
             <div className="text-center mb-20">
               <span className="section-tag">⚙️ The Process</span>
               <h2 className="section-h2 headline-shadow">
                 How It <span className="grad-text">Works</span>
               </h2>
               <p className="text-white/65 max-w-[600px] mx-auto text-xl font-bold mt-4">Two sides, one powerful marketplace.</p>
             </div>
             <div className="grid lg:grid-cols-2 gap-16">
               <div>
                 <div className="font-outfit font-black text-3xl uppercase flex items-center gap-4 text-accent-2 mb-10 headline-shadow">
                   <span className="text-5xl">🏢</span> For Clients
                 </div>
                 {[
                   { step: '01', title: 'Browse the Marketplace', body: 'Filter ID-verified reps by industry, location, follower count, and niche fit.', color: 'var(--accent-2)', shadow: 'var(--accent-3)' },
                   { step: '02', title: 'Select Your Reps', body: 'Pick one or more outreach reps whose profiles align with your target market.', color: 'var(--accent-3)', shadow: 'var(--accent-4)', dashed: true },
                   { step: '03', title: 'Launch Campaigns', body: 'Reps run connection requests, DMs, and posts from their real LinkedIn profiles using secured remote tools.', color: 'var(--accent-1)', shadow: 'var(--accent-5)' },
                   { step: '04', title: 'Book Meetings & Close', body: 'Add reply handling and appointment-setting for a fully managed pipeline.', color: 'var(--accent-4)', shadow: 'var(--accent-2)', dashed: true },
                 ].map((item, i) => (
                   <MaxCard 
                     key={i} 
                     accentColor={item.color} 
                     shadowColor={item.shadow} 
                     dashed={item.dashed}
                     className={`mb-6 flex gap-4 md:gap-6 items-start ${i % 2 !== 0 ? 'md:ml-8' : ''}`}
                   >
                     <span className="font-display text-4xl leading-none" style={{ color: item.color }}>{item.step}</span>
                     <div>
                       <h4 className="font-outfit font-black uppercase text-xl mb-2 tracking-tight">{item.title}</h4>
                       <p className="text-white/70 font-medium leading-relaxed">{item.body}</p>
                     </div>
                   </MaxCard>
                 ))}
               </div>
               <div>
                  <div className="font-outfit font-black text-3xl uppercase flex items-center gap-4 text-accent-1 mb-10 headline-shadow">
                    <span className="text-5xl">💼</span> For Reps
                  </div>
                  {[
                    { step: '01', title: 'Apply & Get Verified', body: 'Complete ID verification and 2FA setup. We vet every rep to maintain marketplace quality.', color: 'var(--accent-1)', shadow: 'var(--accent-2)' },
                    { step: '02', title: 'Get Matched', body: 'We pair you with a client whose niche perfectly fits your LinkedIn profile and audience.', color: 'var(--accent-5)', shadow: 'var(--accent-1)', dashed: true },
                    { step: '03', title: 'Run Outreach', body: 'Use provided templates and automation tools in secure remote environments — from your own account.', color: 'var(--accent-3)', shadow: 'var(--accent-4)' },
                    { step: '04', title: 'Earn Monthly Income', body: 'Get paid passively every month while the platform handles matching, support, and client management.', color: 'var(--accent-2)', shadow: 'var(--accent-5)', dashed: true },
                  ].map((item, i) => (
                    <MaxCard 
                      key={i} 
                      accentColor={item.color} 
                      shadowColor={item.shadow} 
                      dashed={item.dashed}
                      className={`mb-6 flex gap-4 md:gap-6 items-start ${i % 2 !== 0 ? 'md:ml-8' : ''}`}
                    >
                      <span className="font-display text-4xl leading-none" style={{ color: item.color }}>{item.step}</span>
                      <div>
                        <h4 className="font-outfit font-black uppercase text-xl mb-2 tracking-tight">{item.title}</h4>
                        <p className="text-white/70 font-medium leading-relaxed">{item.body}</p>
                      </div>
                    </MaxCard>
                  ))}
               </div>
             </div>
           </div>
        </section>

        {/* PRICING */}
        <section className="relative py-16 md:py-32 px-4 md:px-10" id="pricing">
           <BackgroundPatterns opacity={0.15} />
           <div className="container mx-auto relative z-10">
              <div className="text-center mb-20">
                <span className="section-tag">💰 Pricing</span>
                <h2 className="section-h2 headline-shadow">Simple, <span className="grad-text">Transparent</span> Pricing</h2>
                <p className="text-white/65 max-w-[560px] mx-auto text-xl font-bold mt-4">Month-to-month. No lock-in. Scale up or down.</p>
              </div>
              <div className="grid lg:grid-cols-3 gap-10 items-start">
                 <MaxCard accentColor="var(--accent-2)" shadowColor="var(--accent-5)" className="text-center">
                    <div className="text-sm font-black uppercase tracking-widest text-accent-2 mb-4">Starter</div>
                    <div className="font-outfit font-black text-7xl text-accent-2 headline-shadow mb-2">$75</div>
                    <div className="text-sm font-bold text-white/50 uppercase tracking-widest mb-10">per agent / month</div>
                    <ul className="text-left space-y-4 mb-10">
                      <li className="flex items-center gap-3 font-bold text-white/80">✅ 1 ID-Verified Rep</li>
                      <li className="flex items-center gap-3 font-bold text-white/80">✅ Connection Campaigns</li>
                      <li className="flex items-center gap-3 font-bold text-white/80">✅ DM Campaigns</li>
                      <li className="flex items-center gap-3 font-bold text-white/80">✅ Secure Environment</li>
                    </ul>
                    <MaxButton variant="secondary" fullWidth href="/pricing">Get Started →</MaxButton>
                 </MaxCard>
                 
                 <MaxCard 
                   accentColor="var(--accent-1)" 
                   shadowColor="var(--accent-3)" 
                   className="text-center scale-105 z-20"
                   hoverEffect={true}
                 >
                    <div className="section-tag bg-accent-3 text-background border-background mb-6">🔥 Most Popular</div>
                    <div className="text-sm font-black uppercase tracking-widest text-accent-1 mb-4">Professional</div>
                    <div className="font-outfit font-black text-8xl text-accent-1 headline-shadow mb-2">$150</div>
                    <div className="text-sm font-bold text-white/50 uppercase tracking-widest mb-10">per agent / month</div>
                    <ul className="text-left space-y-4 mb-10">
                      <li className="flex items-center gap-3 font-black text-white">✅ Everything in Starter</li>
                      <li className="flex items-center gap-3 font-black text-white">✅ Post & Engagement</li>
                      <li className="flex items-center gap-3 font-black text-white">✅ Sales Navigator Access</li>
                      <li className="flex items-center gap-3 font-black text-white">✅ Account Warm-Up</li>
                      <li className="flex items-center gap-3 font-black text-accent-3">🎯 Priority Matching</li>
                    </ul>
                    <MaxButton fullWidth href="/pricing">Get Started →</MaxButton>
                 </MaxCard>

                 <MaxCard accentColor="var(--accent-4)" shadowColor="var(--accent-1)" dashed className="text-center">
                    <div className="text-sm font-black uppercase tracking-widest text-accent-4 mb-4">Managed</div>
                    <div className="font-outfit font-black text-7xl text-accent-4 headline-shadow mb-2">$300</div>
                    <div className="text-sm font-bold text-white/50 uppercase tracking-widest mb-10">per agent / month</div>
                    <ul className="text-left space-y-4 mb-10">
                      <li className="flex items-center gap-3 font-bold text-white/80">✅ Everything in Pro</li>
                      <li className="flex items-center gap-3 font-bold text-white/80">✅ Full Reply Handling</li>
                      <li className="flex items-center gap-3 font-bold text-white/80">✅ Appointment Setting</li>
                      <li className="flex items-center gap-3 font-bold text-white/80">✅ Account Manager</li>
                    </ul>
                    <MaxButton variant="secondary" fullWidth href="/pricing">Get Started →</MaxButton>
                 </MaxCard>
              </div>
           </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-16 md:py-32 px-4 md:px-10 relative overflow-hidden text-center bg-muted/20">
           <BackgroundPatterns opacity={0.3} />
           <div className="container mx-auto relative z-10">
             <h2 className="hero-h1 headline-shadow mb-8">Ready to Scale Your<br/>LinkedIn Outreach?</h2>
             <p className="text-xl text-white/85 max-w-[700px] mx-auto mb-12 font-bold leading-relaxed">
               Join hundreds of companies already using real people to build real pipelines. Get matched with your first rep in 24 hours.
             </p>
             <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-8">
               <MaxButton href="/pricing" size="lg">Hire Outreach Reps Now →</MaxButton>
               <MaxButton variant="outline" onClick={openRepModal} size="lg">Apply as a Rep</MaxButton>
             </div>
             <p className="mt-12 text-sm font-black uppercase tracking-[0.2em] text-white/40">
               Month-to-month · No lock-in · Go live in 24 hours
             </p>
           </div>
        </section>

        <SiteFooter />
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && closeRepModal()}>
          <MaxCard className="max-w-[560px] w-[90%] text-center p-12 relative" accentColor="var(--accent-1)" shadowColor="var(--accent-5)">
             <button className="modal-close" onClick={closeRepModal}>✕</button>
             <div className="text-6xl mb-6 animate-bounce-subtle">🚀</div>
             <h2 className="modal-title mb-4">Join as an<br/><span className="grad-text">Outreach Rep</span></h2>
             <p className="text-lg font-bold text-white/70 mb-10 tracking-tight">Choose where you&apos;d like to apply. Our team will verify your identity and match you with a client fast.</p>
             
             <div className="space-y-6">
                <a href="https://wa.me/27606865738" target="_blank" rel="noopener" className="block">
                  <MaxCard accentColor="#25D366" shadowColor="rgba(37,211,102,.3)" className="flex gap-6 items-center p-6 hover:rotate-1">
                    <span className="text-5xl shrink-0">💬</span>
                    <div className="text-left">
                      <div className="font-black text-xl uppercase text-[#25D366] tracking-tighter">Apply via WhatsApp</div>
                      <div className="text-xs font-bold text-white/50 tracking-tight mt-1">Chat directly with our team. Fast & personal.</div>
                    </div>
                  </MaxCard>
                </a>
                
                <a href="https://discord.gg/CcsNMcGMsH" target="_blank" rel="noopener" className="block">
                  <MaxCard accentColor="#5865F2" shadowColor="rgba(88,101,242,.3)" className="flex gap-6 items-center p-6 hover:rotate-[-1deg]">
                    <span className="text-5xl shrink-0">🎮</span>
                    <div className="text-left">
                      <div className="font-black text-xl uppercase text-[#5865F2] tracking-tighter">Join our Discord</div>
                      <div className="text-xs font-bold text-white/50 tracking-tight mt-1">Access the community and apply directly.</div>
                    </div>
                  </MaxCard>
                </a>
             </div>
             <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-white/30">Earn $15–$100/client · ID-verified · Full support</p>
          </MaxCard>
        </div>
      )}
    </div>
  );
}
