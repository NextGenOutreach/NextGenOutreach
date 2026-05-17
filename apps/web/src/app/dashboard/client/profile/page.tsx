"use client";

import { useEffect, useState } from 'react';
import { fetchClientProfile, updateClientProfile, APIClientProfile } from '@/lib/api';
import MaxButton from '@/components/ui/MaxButton';
import MaxInput from '@/components/ui/MaxInput';
import MaxCard from '@/components/ui/MaxCard';

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<APIClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchClientProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      const updates = {
        companyName: formData.get('companyName') as string,
        website: formData.get('website') as string,
        industry: formData.get('industry') as string,
        targetMarket: formData.get('targetMarket') as string,
      };

      const updated = await updateClientProfile(updates);
      setProfile(updated);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-1"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Client Profile</h1>
          <p className="text-white/40 font-bold mt-1">Manage your company details and outreach preferences.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-500 text-sm font-bold">
            Profile updated successfully!
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MaxCard className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                      Account Email
                    </label>
                    <MaxInput
                      value={profile?.user.email}
                      disabled
                      className="opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                      Company Name
                    </label>
                    <MaxInput
                      name="companyName"
                      defaultValue={profile?.companyName || ''}
                      placeholder="e.g. Acme Corp"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                      Website URL
                    </label>
                    <MaxInput
                      name="website"
                      defaultValue={profile?.website || ''}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                      Industry
                    </label>
                    <MaxInput
                      name="industry"
                      defaultValue={profile?.industry || ''}
                      placeholder="e.g. Software, Real Estate"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                    Target Market / ICP
                  </label>
                  <textarea
                    name="targetMarket"
                    defaultValue={profile?.targetMarket || ''}
                    rows={4}
                    className="w-full bg-muted border border-accent-3/20 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-1 font-medium leading-relaxed"
                    placeholder="Describe your Ideal Customer Profile..."
                  />
                </div>

                <div className="pt-4">
                  <MaxButton
                    type="submit"
                    loading={saving}
                    className="w-full md:w-auto px-10"
                  >
                    Save Changes
                  </MaxButton>
                </div>
              </form>
            </MaxCard>
          </div>

          <div className="space-y-6">
            <MaxCard className="p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Subscription</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/50">Current Plan</p>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-accent-1/20 text-accent-1">
                    {profile?.plan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/50">Status</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                    profile?.planStatus === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {profile?.planStatus}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <MaxButton
                  variant="outline"
                  className="w-full text-xs py-2"
                  onClick={() => window.location.href = '/pricing'}
                >
                  Manage Subscription
                </MaxButton>
              </div>
            </MaxCard>

            <MaxCard className="p-6 border-dashed border-accent-3/30 bg-accent-3/[0.02]">
              <h3 className="text-sm font-black uppercase tracking-widest text-accent-3 mb-2">Outreach Support</h3>
              <p className="text-xs font-medium text-white/50 leading-relaxed mb-4">
                Need help defining your ICP or messaging strategy? Contact your account manager.
              </p>
              <MaxButton
                variant="outline"
                className="w-full text-xs py-2 border-accent-3 text-accent-3 hover:bg-accent-3/10"
              >
                Message Support
              </MaxButton>
            </MaxCard>
          </div>
        </div>
      </div>
    </div>
  );
}
