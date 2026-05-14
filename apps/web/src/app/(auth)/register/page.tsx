"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MaxButton } from '@/components/ui/MaxButton';
import { MaxCard } from '@/components/ui/MaxCard';
import { MaxInput } from '@/components/ui/MaxInput';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'rep',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.role, formData.displayName || undefined);
      router.push(formData.role === 'rep' ? '/dashboard/rep/overview' : '/dashboard/client/overview');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('email-already-in-use')) {
        setError('An account with this email already exists.');
      } else if (msg.includes('weak-password')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots text-accent-1/5 opacity-30" />
      <div className="absolute top-10 right-10 text-6xl animate-float opacity-20">🚀</div>
      <div className="absolute bottom-10 left-10 text-6xl animate-float-r opacity-20">💼</div>

      <MaxCard className="max-w-md w-full" accentColor="var(--accent-2)" shadowColor="var(--accent-5)">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-3xl font-black text-white mb-2">
            Join <span className="grad-text">NextGenOutreach</span>
          </h2>
          <p className="text-sm text-white/60">
            Already have an account?{' '}
            <Link href="/login" className="font-black text-accent-1 hover:text-accent-2 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="border-2 border-red-500/50 bg-red-500/10 text-red-300 px-4 py-3 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">I want to</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'client', label: '🏢 Hire Reps', sub: 'Client' },
                { value: 'rep',    label: '💼 Be a Rep',  sub: 'Outreach Agent' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, role: opt.value }))}
                  className="p-3 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: formData.role === opt.value ? 'var(--accent-1)' : 'rgba(255,255,255,0.1)',
                    background: formData.role === opt.value ? 'rgba(255,58,242,0.1)' : 'transparent',
                  }}
                >
                  <p className="text-sm font-black text-white">{opt.label}</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <MaxInput
            label="Full name"
            name="displayName"
            type="text"
            autoComplete="name"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Your full name"
            accentColor="var(--accent-2)"
          />

          <MaxInput
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            accentColor="var(--accent-2)"
          />

          <MaxInput
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password (6+ chars)"
            accentColor="var(--accent-2)"
          />

          <MaxInput
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            accentColor="var(--accent-2)"
          />

          <div className="flex items-start gap-3 pt-1">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-accent-1 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs font-bold text-white/50 cursor-pointer">
              I agree to the{' '}
              <Link href="/terms" className="text-accent-1 hover:text-accent-2 transition-colors">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-accent-1 hover:text-accent-2 transition-colors">Privacy Policy</Link>
            </label>
          </div>

          <div className="pt-2">
            <MaxButton type="submit" disabled={isLoading} fullWidth size="lg">
              {isLoading ? 'Creating account…' : 'Create account →'}
            </MaxButton>
          </div>
        </form>
      </MaxCard>
    </div>
  );
}
