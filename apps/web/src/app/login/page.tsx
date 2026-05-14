"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MaxButton } from '@/components/ui/MaxButton';
import { MaxCard } from '@/components/ui/MaxCard';
import { MaxInput } from '@/components/ui/MaxInput';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const authUser = await signIn(email, password);

      if (authUser.role === 'admin' || authUser.role === 'super_admin') {
        router.push('/dashboard/admin/overview');
      } else if (authUser.role === 'rep') {
        router.push('/dashboard/rep/overview');
      } else {
        router.push('/dashboard/client/overview');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        setError('Invalid email or password');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots text-accent-1/5 opacity-30" />
      <div className="absolute top-10 left-10 text-6xl animate-float opacity-20">🔐</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-float-r opacity-20">🚀</div>
      
      <MaxCard className="max-w-md w-full" accentColor="var(--accent-1)" shadowColor="var(--accent-3)">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-3xl font-black text-white mb-2">
            Sign in to <span className="grad-text">NextGenOutreach</span>
          </h2>
          <p className="text-sm text-white/70">
            Or{' '}
            <Link href="/register" className="font-medium text-accent-1 hover:text-accent-2">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <MaxInput
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              accentColor="var(--accent-1)"
            />
            
            <MaxInput
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              accentColor="var(--accent-1)"
            />
          </div>

          <div>
            <MaxButton
              type="submit"
              disabled={isLoading}
              fullWidth
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </MaxButton>
          </div>
        </form>
      </MaxCard>
    </div>
  );
}
