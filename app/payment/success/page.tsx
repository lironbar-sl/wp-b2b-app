'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('orderId') ?? '';

  useEffect(() => {
    // Notify the parent frame that payment succeeded
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'TRANZILA_SUCCESS', orderId }, '*');
    }
  }, [orderId]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#052e16' }}
    >
      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-white text-lg font-bold">התשלום התקבל!</p>
      <p className="text-emerald-300 text-sm mt-1">מעבד הזמנה...</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
