"use client";

import { useRouter } from 'next/navigation';
import { CampaignWizard } from '@/components/CampaignWizard';

export default function CreateCampaignPage() {
  const router = useRouter();

  const handleLaunch = async (formData: {
    target: string;
    industry: string;
    offer: string;
    limits: string;
  }) => {
    // TODO: POST to /api/v1/campaigns once backend is deployed
    console.log('Campaign data:', formData);
    router.push('/dashboard/client/campaigns');
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
        </div>

        <CampaignWizard onLaunch={handleLaunch} />
      </div>
    </div>
  );
}
