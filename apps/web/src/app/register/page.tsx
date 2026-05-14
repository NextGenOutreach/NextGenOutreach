"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MaxButton } from '@/components/ui/MaxButton';
import { MaxCard } from '@/components/ui/MaxCard';
import { MaxInput } from '@/components/ui/MaxInput';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'rep'>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signUp(email, password, role);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots text-accent-1/5 opacity-30" />
      
      <MaxCard className="max-w-md w-full" accentColor="var(--accent-2)" shadowColor="var(--accent-1)">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2">
            Create your <span className="grad-text">account</span>
          </h2>
          <p className="text-sm text-white/70">
            Join the NextGenOutreach ecosystem today.
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`p-4 rounded-2xl border-2 transition-all font-black uppercase text-xs tracking-widest ${
                  role === 'client' ? 'border-accent-2 bg-accent-2/10 text-accent-2' : 'border-white/10 text-white/40'
                }`}
              >
                I want to Hire
              </button>
              <button
                type="button"
                onClick={() => setRole('rep')}
                className={`p-4 rounded-2xl border-2 transition-all font-black uppercase text-xs tracking-widest ${
                  role === 'rep' ? 'border-accent-1 bg-accent-1/10 text-accent-1' : 'border-white/10 text-white/40'
                }`}
              >
                I want to Earn
              </button>
            </div>

            <MaxInput
              label="Email address"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              accentColor="var(--accent-2)"
            />
            
            <MaxInput
              label="Password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              accentColor="var(--accent-2)"
            />
          </div>

          <div>
            <MaxButton
              type="submit"
              disabled={isLoading}
              fullWidth
              size="lg"
              variant="primary"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </MaxButton>
          </div>

          <p className="text-center text-sm text-white/70">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-accent-2 hover:text-accent-1">
              Sign in
            </Link>
          </p>
        </form>
      </MaxCard>
    </div>
  );
}
