"use client";

import { useState } from 'react';
import { createSubscription } from '@/lib/api';
import MaxButton from '@/components/ui/MaxButton';
import MaxCard from '@/components/ui/MaxCard';

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 75,
    features: [
      '1 ID-Verified Rep',
      'Connection Campaigns',
      'Secure Environment',
    ],
    accent: 'var(--accent-2)',
  },
  {
    id: 'PRO',
    name: 'Professional',
    price: 150,
    features: [
      'Everything in Starter',
      'Post & Engagement',
      'Priority Matching',
      'Weekly Campaign Review',
    ],
    accent: 'var(--accent-1)',
    popular: true,
  },
  {
    id: 'MANAGED',
    name: 'Managed',
    price: 300,
    features: [
      'Everything in Pro',
      'Managed Campaign Operations',
      'Advanced Reporting',
      'Priority Support',
    ],
    accent: 'var(--accent-4)',
  },
];

const ADD_ONS = [
  {
    name: 'DM Campaigns',
    description: 'Add direct-message sequences for selected reps.',
    accent: 'var(--accent-2)',
  },
  {
    name: 'Meeting Booking',
    description: 'Qualify replies and book meetings into your calendar.',
    accent: 'var(--accent-3)',
  },
  {
    name: 'Reply Handling',
    description: 'Human follow-up for interested prospects and objections.',
    accent: 'var(--accent-1)',
  },
  {
    name: 'Account Manager',
    description: 'Dedicated campaign owner for strategy, QA, and reporting.',
    accent: 'var(--accent-4)',
  },
  {
    name: 'Sales Navigator',
    description: 'Add Sales Navigator workflows where campaigns need it.',
    accent: 'var(--accent-5)',
  },
  {
    name: 'Account Warm-Up',
    description: 'Prepare rep profiles before scaling daily outreach volume.',
    accent: 'var(--accent-2)',
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(planId: string) {
    setLoading(planId);
    try {
      const { url, payload } = await createSubscription(planId);
      
      // Create a hidden form and submit it to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;

      Object.entries(payload).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      alert(`Subscription failed: ${err.message}`);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black uppercase tracking-tight text-white mb-4">
            Simple, <span className="text-accent-1">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-white/40 font-bold">
            Choose the plan that fits your outreach goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <MaxCard 
              key={plan.id}
              className={`p-8 flex flex-col relative ${plan.popular ? 'border-accent-3 border-4' : ''}`}
              style={{ borderColor: plan.popular ? 'var(--accent-3)' : undefined }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-3 text-background text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: plan.accent }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  <span className="text-white/40 font-bold text-sm">per agent / month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-bold text-white/70">
                    <span style={{ color: plan.accent }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <MaxButton
                fullWidth
                loading={loading === plan.id}
                onClick={() => handleSubscribe(plan.id)}
                variant={plan.popular ? 'primary' : 'outline'}
              >
                Get Started
              </MaxButton>
            </MaxCard>
          ))}
        </div>

        <div className="mt-20">
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-accent-3 mb-3">
              Add-ons
            </p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
              Build the outreach stack you need
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADD_ONS.map((addOn) => (
              <MaxCard key={addOn.name} className="p-6" style={{ borderColor: addOn.accent }}>
                <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: addOn.accent }}>
                  Optional add-on
                </div>
                <h3 className="text-lg font-black uppercase text-white mb-3">
                  {addOn.name}
                </h3>
                <p className="text-sm font-bold leading-relaxed text-white/55">
                  {addOn.description}
                </p>
              </MaxCard>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-white/40 font-bold mb-4 italic">
            All plans include our secure tactical environment and human-led oversight.
          </p>
          <div className="flex justify-center items-center gap-8 opacity-30 grayscale">
            <span className="font-black text-2xl">PayFast</span>
            <span className="font-black text-2xl">VISA</span>
            <span className="font-black text-2xl">MASTERCARD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
