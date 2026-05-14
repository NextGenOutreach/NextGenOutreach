"use client";

import React, { useState } from 'react';
import { MaxCard } from '@/components/ui/MaxCard';
import { MaxButton } from '@/components/ui/MaxButton';
import { MaxInput } from '@/components/ui/MaxInput';
import { FloatingDecoration } from '@/components/ui/Decoration';

export const RepApplicationForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call to match Discord bot's field requirements
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <MaxCard accentColor="var(--accent-2)" shadowColor="var(--accent-3)" className="text-center py-20 max-w-2xl mx-auto">
        <div className="text-7xl mb-6 animate-bounce-subtle">🚀</div>
        <h2 className="text-4xl font-black uppercase headline-shadow mb-4">Application Deployed!</h2>
        <p className="text-lg font-bold text-white/80 mb-8 leading-relaxed">
          Our onboarding team is reviewing your intel. Check your WhatsApp for a verification message within 24 hours.
        </p>
        <MaxButton onClick={() => setSubmitted(false)}>Submit Another Profile</MaxButton>
      </MaxCard>
    );
  }

  return (
    <div className="relative">
      <FloatingDecoration emoji="📋" top="-20px" right="-20px" animation="animate-wiggle" size="4rem" zIndex={20} />
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <MaxInput 
            label="Full Name" 
            name="applicant_name" 
            placeholder="e.g. Tshepo Khosi" 
            required 
            accentColor="var(--accent-1)"
          />
          <MaxInput 
            label="Email Address" 
            name="applicant_email" 
            type="email" 
            placeholder="tshepo@example.com" 
            required 
            accentColor="var(--accent-2)"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <MaxInput 
            label="WhatsApp Number" 
            name="applicant_phone" 
            placeholder="e.g. +27 82 123 4567" 
            required 
            accentColor="var(--accent-3)"
          />
          <MaxInput 
            label="LinkedIn Profile URL" 
            name="applicant_linkedin" 
            placeholder="https://linkedin.com/in/..." 
            required 
            accentColor="var(--accent-4)"
          />
        </div>

        <MaxInput 
          label="LinkedIn Connection Count" 
          name="applicant_connections" 
          placeholder="How many connections do you have? (e.g. 5,000+)" 
          required 
          accentColor="var(--accent-5)"
        />

        <div className="pt-6">
          <MaxButton 
            type="submit" 
            fullWidth 
            size="lg"
            disabled={loading}
          >
            {loading ? 'Transmitting Intel...' : 'Deploy Application 🚀'}
          </MaxButton>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-4 text-center">
            By applying, you agree to our Protocol & Terms of Service.
          </p>
        </div>
      </form>
    </div>
  );
};
