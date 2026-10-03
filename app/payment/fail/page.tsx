'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function FailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId') ?? '';

  useEffect(() => {
    if (window.parent !== window) {
      // Inside iframe — tell the parent frame
      window.parent.postMessage({ type: 'TRANZILA_FAIL', orderId }, '*');
    } else {
      // Top-frame redirect from Tranzila — go back to cart
      const timer = setTimeout(() => router.replace('/cart'), 1500);
      return () => clearTimeout(timer);
    }
  }, [orderId, router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#1c0a00' }}
    >
      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <p className="text-white text-lg font-bold">התשלום נכשל</p>
      <p className="text-red-300 text-sm mt-1">חוזר לסל...</p>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense>
      <FailContent />
    </Suspense>
  );
}
