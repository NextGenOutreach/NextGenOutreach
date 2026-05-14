import React, { useState } from 'react';
import { MaxCard } from './ui/MaxCard';
import { MaxButton } from './ui/MaxButton';
import { MaxInput } from './ui/MaxInput';

interface CampaignFormData {
  target: string;
  industry: string;
  offer: string;
  limits: string;
}

interface CampaignWizardProps {
  onLaunch: (formData: CampaignFormData) => void;
}

export const CampaignWizard: React.FC<CampaignWizardProps> = ({ onLaunch }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({ 
    target: '', 
    industry: '', 
    offer: '', 
    limits: '20' 
  });

  const steps = [
    "Targeting",
    "Industry",
    "Your Offer",
    "Daily Limits",
    "Review & Launch"
  ];

  const currentStepTitle = steps[step - 1];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onLaunch(formData);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const stepColors = [
    'var(--accent-1)',
    'var(--accent-2)',
    'var(--accent-3)',
    'var(--accent-4)',
    'var(--accent-5)',
  ];

  return (
    <div className="max-section border-accent-5 p-8 md:p-12 relative overflow-hidden">
      <div className="absolute inset-0 pattern-stripes text-accent-5/5 opacity-30" />
      <div className="relative z-10">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-accent-1 mb-2">Step {step} of {steps.length}</p>
          <h2 className="text-4xl font-black uppercase headline-shadow mb-8">{currentStepTitle}</h2>
          <div className="flex gap-4">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-4 flex-1 rounded-full transition-all duration-500 border-2 ${
                  i < step 
                    ? 'bg-accent-2 border-accent-2 shadow-[0_0_15px_var(--accent-2)]' 
                    : 'bg-white/5 border-white/10'
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="space-y-12 min-h-[250px] flex flex-col justify-center">
          {step === 1 && (
            <MaxInput 
              label="Who is your ideal prospect?"
              name="target"
              value={formData.target}
              accentColor="var(--accent-3)"
              placeholder="e.g. CTOs at Series A Startups"
              onChange={handleInputChange}
            />
          )}
          {step === 2 && (
            <MaxInput 
              label="Primary Industry Niche"
              name="industry"
              value={formData.industry}
              accentColor="var(--accent-2)"
              placeholder="e.g. SaaS, Fintech, Healthcare"
              onChange={handleInputChange}
            />
          )}
          {step === 3 && (
            <MaxInput 
              isTextArea
              label="What are you offering?"
              name="offer"
              value={formData.offer}
              accentColor="var(--accent-1)"
              placeholder="Describe your hook, value prop, and call to action..."
              onChange={handleInputChange}
            />
          )}
          {step === 4 && (
            <MaxInput 
              label="Daily Connection Volume"
              name="limits"
              value={formData.limits}
              accentColor="var(--accent-4)"
              placeholder="20 (Recommended)"
              onChange={handleInputChange}
            />
          )}
          {step === 5 && (
            <MaxCard dashed accentColor="var(--accent-5)" shadowColor="var(--accent-1)" className="bg-white/5">
              <h3 className="text-2xl font-black uppercase tracking-tight text-accent-1 mb-6">Mission Brief Summary</h3>
              <div className="space-y-4">
                <p className="text-lg font-bold uppercase tracking-wide text-white/60">Target: <span className="text-white headline-shadow text-sm">{formData.target || 'UNSPECIFIED'}</span></p>
                <p className="text-lg font-bold uppercase tracking-wide text-white/60">Industry: <span className="text-white headline-shadow text-sm">{formData.industry || 'UNSPECIFIED'}</span></p>
                <p className="text-lg font-bold uppercase tracking-wide text-white/60">Limits: <span className="text-white headline-shadow text-sm">{formData.limits} per day</span></p>
              </div>
            </MaxCard>
          )}
        </div>

        <div className="mt-16 flex items-center justify-between">
          <button 
            className={`text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-105 ${
              step === 1 ? 'text-white/20 cursor-not-allowed' : 'text-accent-4 hover:text-white'
            }`} 
            onClick={handlePreviousStep} 
            disabled={step === 1}
          >
            ← Abort Mission
          </button>
          <MaxButton
            onClick={handleNextStep} 
            variant="primary"
          >
            {step === steps.length ? 'Launch Mission 🚀' : 'Confirm & Continue'}
          </MaxButton>
        </div>
      </div>
    </div>
  );
};
