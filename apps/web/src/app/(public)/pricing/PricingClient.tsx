"use client";

import React, { useState, useRef } from 'react';
import { MarketingNav } from '@/components/marketing-nav';
import { SiteFooter } from '@/components/marketing';

const plans = {
  starter:  { name:'Starter',       price:75,   color:'var(--a2)' },
  pro:      { name:'Professional',  price:150,  color:'var(--a1)' },
  managed:  { name:'Managed',       price:300,  color:'var(--a4)' }
};

export default function PricingClient() {
  const [currentPlan, setCurrentPlan] = useState<keyof typeof plans>('pro');
  const [demoMode, setDemoMode] = useState(true);

  // ROI State
  const [roiProspects, setRoiProspects] = useState(200);
  const [roiAccept, setRoiAccept] = useState(25);
  const [roiConv, setRoiConv] = useState(8);
  const [roiDeal, setRoiDeal] = useState(3000);

  // PayFast Form State
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  const pfFormRef = useRef<HTMLFormElement>(null);

  const selectPlan = (key: keyof typeof plans) => {
    setCurrentPlan(key);
  };

  const toggleDemo = () => setDemoMode(!demoMode);

  const calcROI = () => {
    const prospects = roiProspects || 0;
    const accept = (roiAccept / 100) || 0;
    const conv = (roiConv / 100) || 0;
    const deal = roiDeal || 0;
    const conns = Math.round(prospects * accept);
    const meets = Math.round(conns * conv);
    const pipe = meets * deal;
    const cost = plans[currentPlan]?.price || 150;
    const roi = cost > 0 ? (pipe / cost).toFixed(1) : '∞';

    return { conns, meets, pipe, roi };
  };

  const { conns, meets, pipe, roi } = calcROI();

  const submitPayFast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fname || !lname || !email) {
      alert('Please fill in your first name, last name, and email address.');
      return;
    }
    
    if (pfFormRef.current) {
      pfFormRef.current.submit();
    }
  };

  const p = plans[currentPlan];

  return (
    <div className="max-shell overflow-x-hidden min-h-screen text-white font-sans bg-[#0D0D1A]">
      <MarketingNav />

      <div className="animate-in slide-in-from-bottom duration-500 pt-[100px]">
           <div className="pay-header">
             <div className="pay-title">Hire Outreach <span>Reps</span></div>
             <div className="ml-auto flex items-center gap-3">
               {demoMode && <span className="demo-badge bg-accent-3 text-background px-3 py-1 rounded-full font-black text-[11px]">SANDBOX MODE</span>}
               <span className="text-[13px] text-white/40">Powered by PayFast</span>
             </div>
           </div>

           <div className="pay-body max-w-[1100px] mx-auto px-10 py-16">
              <div className="mb-12 text-center">
                <h1 className="font-black text-[clamp(2rem,4vw,3.2rem)] uppercase tracking-[-2px]" style={{ textShadow: '3px 3px 0 var(--a5), 6px 6px 0 var(--a2)' }}>Choose Your Plan & <span className="grad-text">Start Scaling</span></h1>
                <p className="text-white/60 mt-2">Calculate your ROI, pick a plan, and pay securely via PayFast.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                   {/* ROI CALCULATOR */}
                   <div className="roi-card mb-8">
                     <div className="roi-title">📈 ROI Calculator</div>
                     <p className="text-[0.85rem] text-white/55 mb-6">Estimate the return on your investment before you commit.</p>
                     <div className="space-y-4">
                        <div>
                          <label className="text-[12px] font-bold uppercase tracking-widest text-accent-3 mb-2 block">Prospects Contacted / Month (per rep)</label>
                          <input className="roi-input" type="number" value={roiProspects} onChange={(e) => setRoiProspects(parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold uppercase tracking-widest text-accent-3 mb-2 block">Connection Accept Rate (%)</label>
                          <input className="roi-input" type="number" value={roiAccept} onChange={(e) => setRoiAccept(parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold uppercase tracking-widest text-accent-3 mb-2 block">DM → Meeting Conversion Rate (%)</label>
                          <input className="roi-input" type="number" value={roiConv} onChange={(e) => setRoiConv(parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold uppercase tracking-widest text-accent-3 mb-2 block">Average Deal Value ($)</label>
                          <input className="roi-input" type="number" value={roiDeal} onChange={(e) => setRoiDeal(parseInt(e.target.value) || 0)} />
                        </div>
                     </div>
                     <div className="roi-results">
                        <div className="roi-row"><span className="text-white/60 text-[0.85rem]">Connections / Month</span><span className="roi-val text-accent-2">{conns}</span></div>
                        <div className="roi-row"><span className="text-white/60 text-[0.85rem]">Meetings Booked</span><span className="roi-val text-accent-3">{meets}</span></div>
                        <div className="roi-row"><span className="text-white/60 text-[0.85rem]">Pipeline Value</span><span className="roi-val text-accent-1">${pipe.toLocaleString()}</span></div>
                        <div className="roi-row border-none mt-2"><span className="font-bold text-accent-3 text-[0.85rem]">Est. ROI</span><span className="roi-val text-accent-3 text-[1.6rem]">{roi}×</span></div>
                     </div>
                   </div>

                   {/* PLAN SELECTOR */}
                   <div>
                     <div className="font-black text-[1.6rem] uppercase mb-5" style={{ textShadow: '2px 2px 0 var(--a5), 4px 4px 0 var(--a1)' }}>Select Your Plan</div>
                     <div className={`plan-opt ${currentPlan === 'starter' ? 'selected' : ''}`} style={{ background: 'rgba(0,245,212,.07)', borderColor: 'var(--a2)' }} onClick={() => selectPlan('starter')}>
                        <div className="plan-opt-left">
                          <h4 className="text-accent-2 font-black uppercase text-[1.1rem]">Starter</h4>
                          <p className="text-[0.8rem] text-white/55">1 rep · Connections & DMs · Dedicated support</p>
                        </div>
                        <div className="plan-opt-price text-accent-2">$75<small className="text-[0.7rem] block font-sans text-white/50">/month</small></div>
                        <div className={`w-5 h-5 rounded-full border-2 border-white/30 absolute top-4 right-4 flex items-center justify-center ${currentPlan === 'starter' ? 'bg-accent-1 border-accent-1' : ''}`}>
                          {currentPlan === 'starter' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                     </div>
                     <div className={`plan-opt ${currentPlan === 'pro' ? 'selected' : ''}`} style={{ background: 'rgba(255,58,242,.1)', borderColor: 'var(--a1)' }} onClick={() => selectPlan('pro')}>
                        <div className="plan-opt-left">
                          <h4 className="text-accent-1 font-black uppercase text-[1.1rem]">Professional 🔥</h4>
                          <p className="text-[0.8rem] text-white/55">1 rep · Posts & engagement · Sales Navigator · Priority support</p>
                        </div>
                        <div className="plan-opt-price text-accent-1">$150<small className="text-[0.7rem] block font-sans text-white/50">/month</small></div>
                        <div className={`w-5 h-5 rounded-full border-2 border-white/30 absolute top-4 right-4 flex items-center justify-center ${currentPlan === 'pro' ? 'bg-accent-1 border-accent-1' : ''}`}>
                          {currentPlan === 'pro' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                     </div>
                     <div className={`plan-opt ${currentPlan === 'managed' ? 'selected' : ''}`} style={{ background: 'rgba(255,107,53,.07)', borderColor: 'var(--a4)', borderStyle: 'dashed' }} onClick={() => selectPlan('managed')}>
                        <div className="plan-opt-left">
                          <h4 className="text-accent-4 font-black uppercase text-[1.1rem]">Managed</h4>
                          <p className="text-[0.8rem] text-white/55">1 rep · Full reply handling · Appointment setting · White-glove</p>
                        </div>
                        <div className="plan-opt-price text-accent-4">$300<small className="text-[0.7rem] block font-sans text-white/50">/month</small></div>
                        <div className={`w-5 h-5 rounded-full border-2 border-white/30 absolute top-4 right-4 flex items-center justify-center ${currentPlan === 'managed' ? 'bg-accent-1 border-accent-1' : ''}`}>
                          {currentPlan === 'managed' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                     </div>
                   </div>
                </div>

                <div>
                   {/* DEMO TOGGLE */}
                   <div className="demo-toggle-wrap">
                      <div className="font-bold uppercase text-[0.95rem] tracking-widest">
                        Sandbox / Demo Mode
                        <small className="block font-sans text-[0.75rem] font-medium text-white/50 normal-case tracking-normal mt-0.5">Test with PayFast sandbox — no real charge</small>
                      </div>
                      <button className={`toggle-btn ${demoMode ? 'on' : ''}`} onClick={toggleDemo}>
                        <div className="toggle-knob"></div>
                      </button>
                   </div>

                   {demoMode && (
                     <div className="bg-accent-3/10 border-[3px] border-dashed border-accent-3 rounded-xl p-4 mb-6 flex gap-3 text-[0.85rem] text-white/70">
                       <span className="text-[1.3rem] shrink-0">⚠️</span>
                       <span><strong className="text-accent-3">Sandbox Mode Active:</strong> Payments go to <code className="bg-white/10 px-1.5 py-0.5 rounded text-[0.8rem]">sandbox.payfast.co.za</code>. No real charges. Switch off to go live.</span>
                     </div>
                   )}

                   {/* PAYFAST FORM */}
                   <div className="payfast-wrap">
                      <div className="font-black text-[1.2rem] uppercase text-accent-1 mb-6 flex items-center gap-3">🔐 Secure Payment via PayFast</div>
                      
                      <form onSubmit={submitPayFast} action={demoMode ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process"} method="POST" ref={pfFormRef}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <div className="flex flex-col gap-1.5">
                             <label className="text-[12px] font-bold uppercase tracking-widest text-white/60">First Name</label>
                             <input type="text" value={fname} onChange={(e) => setFname(e.target.value)} placeholder="Tshepo" className="roi-input !border-accent-5" required />
                           </div>
                           <div className="flex flex-col gap-1.5">
                             <label className="text-[12px] font-bold uppercase tracking-widest text-white/60">Last Name</label>
                             <input type="text" value={lname} onChange={(e) => setLname(e.target.value)} placeholder="Khosi" className="roi-input !border-accent-5" required />
                           </div>
                        </div>
                        <div className="flex flex-col gap-1.5 mb-4">
                           <label className="text-[12px] font-bold uppercase tracking-widest text-white/60">Email Address</label>
                           <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="roi-input !border-accent-5" required />
                        </div>
                        <div className="flex flex-col gap-1.5 mb-6">
                           <label className="text-[12px] font-bold uppercase tracking-widest text-white/60">Company / Brand Name</label>
                           <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className="roi-input !border-accent-5" />
                        </div>

                        {/* ORDER SUMMARY */}
                        <div className="pf-summary">
                           <div className="flex justify-between py-1.5 text-[0.9rem]"><span className="text-white/60">Plan</span><span className="font-bold text-accent-1">{p.name}</span></div>
                           <div className="flex justify-between py-1.5 text-[0.9rem]"><span className="text-white/60">Billing</span><span className="font-bold">Monthly</span></div>
                           <div className="flex justify-between py-1.5 text-[0.9rem]"><span className="text-white/60">Mode</span><span className={`font-bold ${demoMode ? 'text-accent-3' : 'text-accent-2'}`}>{demoMode ? 'SANDBOX' : 'LIVE'}</span></div>
                           <div className="flex justify-between mt-1.5 pt-3 border-t border-white/15 font-black text-[1.1rem]"><span>Total Due</span><span className="text-accent-2">${p.price}.00</span></div>
                        </div>

                        {/* PayFast Hidden Inputs */}
                        <input type="hidden" name="merchant_id" value="10000100" />
                        <input type="hidden" name="merchant_key" value="46f0cd694581a" />
                        <input type="hidden" name="return_url" value="https://nextgenoutreach.com/thank-you" />
                        <input type="hidden" name="cancel_url" value="https://nextgenoutreach.com/cancel" />
                        <input type="hidden" name="notify_url" value="https://nextgenoutreach.com/api/payfast-notify" />
                        <input type="hidden" name="name_first" value={fname} />
                        <input type="hidden" name="name_last" value={lname} />
                        <input type="hidden" name="email_address" value={email} />
                        <input type="hidden" name="amount" value={`${p.price}.00`} />
                        <input type="hidden" name="item_name" value={`NextGenOutreach — ${p.name} Plan`} />
                        <input type="hidden" name="item_description" value={`Monthly LinkedIn outreach rep — ${p.name} Plan`} />
                        <input type="hidden" name="m_payment_id" value={`NGO-${Date.now()}`} />

                        <button type="submit" className="pf-submit">🔒 Pay Securely with PayFast</button>
                      </form>
                      
                      <p className="text-[12px] text-white/40 text-center mt-3">🔒 256-bit SSL encrypted · Secure checkout</p>
                      <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        <span className="bg-accent-2/10 border-2 border-accent-2 rounded-lg px-3 py-1 text-[11px] font-bold uppercase text-accent-2">PayFast Secured</span>
                        <span className="bg-accent-2/10 border-2 border-accent-2 rounded-lg px-3 py-1 text-[11px] font-bold uppercase text-accent-2">Monthly Billing</span>
                        <span className="bg-accent-2/10 border-2 border-accent-2 rounded-lg px-3 py-1 text-[11px] font-bold uppercase text-accent-2">Cancel Anytime</span>
                        <span className={`border-2 rounded-lg px-3 py-1 text-[11px] font-bold uppercase ${demoMode ? 'border-accent-3 text-accent-3' : 'border-accent-2 text-accent-2'}`}>{demoMode ? 'Sandbox Mode' : 'Live Mode'}</span>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </div>

      <SiteFooter />
    </div>
  );
}
