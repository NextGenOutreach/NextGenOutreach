"use client";

import { useEffect, useState } from 'react';
import { fetchRepProfile, updateRepProfile, APIRepProfile } from '@/lib/api';
import MaxButton from '@/components/ui/MaxButton';
import MaxInput from '@/components/ui/MaxInput';
import MaxCard from '@/components/ui/MaxCard';

export default function RepProfilePage() {
  const [profile, setProfile] = useState<APIRepProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchRepProfile();
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
        linkedinUrl: formData.get('linkedinUrl') as string,
        industry: formData.get('industry') as string,
        bio: formData.get('bio') as string,
        locationCountry: formData.get('locationCountry') as string,
        locationCity: formData.get('locationCity') as string,
      };

      const updated = await updateRepProfile(updates);
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
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Your Profile</h1>
          <p className="text-white/40 font-bold mt-1">Manage your professional presence on NextGenOutreach.</p>
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
                      Email Address
                    </label>
                    <MaxInput
                      value={profile?.user.email}
                      disabled
                      className="opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                      LinkedIn URL
                    </label>
                    <MaxInput
                      name="linkedinUrl"
                      defaultValue={profile?.linkedinUrl}
                      placeholder="https://linkedin.com/in/username"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                      Industry Niche
                    </label>
                    <MaxInput
                      name="industry"
                      defaultValue={profile?.industry}
                      placeholder="e.g. SaaS, FinTech, B2B Marketing"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                      Availability Status
                    </label>
                    <div className="p-3 bg-muted border border-accent-3/20 rounded-xl text-white font-bold capitalize">
                      {profile?.availabilityStatus}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                      Country
                    </label>
                    <MaxInput
                      name="locationCountry"
                      defaultValue={profile?.locationCountry || ''}
                      placeholder="e.g. South Africa"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                      City
                    </label>
                    <MaxInput
                      name="locationCity"
                      defaultValue={profile?.locationCity || ''}
                      placeholder="e.g. Cape Town"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    name="bio"
                    defaultValue={profile?.bio || ''}
                    rows={4}
                    className="w-full bg-muted border border-accent-3/20 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-1 font-medium leading-relaxed"
                    placeholder="Describe your outreach experience and audience..."
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
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/50">ID Verification</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                    profile?.idVerified ? 'bg-green-500/20 text-green-500' : 'bg-accent-3/20 text-accent-3'
                  }`}>
                    {profile?.idVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/50">Follower Count</p>
                  <p className="text-sm font-black text-white">{profile?.linkedinFollowers.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/50">Current Rating</p>
                  <p className="text-sm font-black text-accent-1">{profile?.rating} / 5.0</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/50">Member Since</p>
                  <p className="text-sm font-black text-white">
                    {profile ? new Date((profile as any).createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </MaxCard>

            <MaxCard className="p-6 border-dashed border-accent-2/30 bg-accent-2/[0.02]">
              <h3 className="text-sm font-black uppercase tracking-widest text-accent-2 mb-2">Tactical Environment</h3>
              <p className="text-xs font-medium text-white/50 leading-relaxed mb-4">
                Your LinkedIn account is operated via a secured remote browser profile to ensure safety and compliance.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                System Active
              </div>
            </MaxCard>
          </div>
        </div>
      </div>
    </div>
  );
}
