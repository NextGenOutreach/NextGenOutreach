"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    switch (user.role) {
      case 'client':
        router.push('/dashboard/client/overview');
        break;
      case 'rep':
        router.push('/dashboard/rep/overview');
        break;
      case 'admin':
      case 'super_admin':
        router.push('/dashboard/admin/overview');
        break;
      default:
        router.push('/dashboard/client/overview');
    }
  }, [router, user, loading]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-1 mx-auto mb-4"></div>
        <p className="text-white">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
