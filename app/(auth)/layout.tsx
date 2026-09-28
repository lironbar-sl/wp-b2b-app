'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated } from '@/store/authStore';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/catalog');
    }
  }, [isInitialized, isAuthenticated, router]);

  // While hydrating, show nothing (avoids flash of auth form)
  if (!isInitialized) {
    return null;
  }

  // Already authenticated — let the effect redirect, show nothing meanwhile
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
