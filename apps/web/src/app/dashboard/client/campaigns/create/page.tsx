"use client";

import { useRouter } from 'next/navigation';
import { CampaignWizard } from '@/components/CampaignWizard';
import { createCampaign } from '@/lib/api';
import { useState } from 'react';

export default function CreateCampaignPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = async (formData: {
    target: string;
    industry: string;
    offer: string;
    limits: string;
  }) => {
    try {
      setError(null);
      await createCampaign({
        name: `${formData.industry} - ${formData.target}`,
        type: 'MIXED', // Defaulting to mixed for the wizard
        dailyLimit: parseInt(formData.limits) || 20,
        notes: formData.offer,
        targetIcp: { target: formData.target, industry: formData.industry }
      });
      router.push('/dashboard/client/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to launch campaign');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors mb-6 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">New Campaign</h1>
          <p className="text-white/40 font-bold mt-1">Configure your LinkedIn outreach mission.</p>
          {error && (
            <div className="mt-4 p-4 bg-accent-4/10 border-2 border-accent-4 rounded-xl text-accent-4 font-bold text-sm">
              {error}
            </div>
          )}
        </div>

        <CampaignWizard onLaunch={handleLaunch} />
      </div>
    </div>
  );
}
