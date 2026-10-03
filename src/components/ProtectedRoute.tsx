'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && userData && !userData.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-space-md"></div>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (userData && !userData.onboardingCompleted) {
    return null;
  }

  return <>{children}</>;
}