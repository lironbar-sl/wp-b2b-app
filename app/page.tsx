'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check localStorage directly for a fast redirect before the auth store hydrates
    let isAuthenticated = false;
    try {
      const raw = localStorage.getItem('wp_b2b_session');
      if (raw) {
        const session = JSON.parse(raw);
        const isExpired = new Date(session.expiresAt) <= new Date();
        isAuthenticated = !isExpired;
      }
    } catch {
      isAuthenticated = false;
    }

    if (isAuthenticated) {
      router.replace('/catalog');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // Show nothing while redirecting
  return null;
}
