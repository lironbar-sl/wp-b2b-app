'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { XCircle } from 'lucide-react';

function TakenContent() {
  const params = useSearchParams();
  const courierName = params.get('name') ?? 'שליח';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(170deg, #1c0a00 0%, #431407 100%)' }}
    >
      <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-orange-900/50">
        <XCircle className="w-12 h-12 text-white" />
      </div>

      <h1 className="text-white text-2xl font-black mb-2">אוחרת מדי</h1>
      <p className="text-orange-300 text-base mb-6">
        {courierName}, ההזמנה נלקחה כבר על ידי שליח אחר
      </p>

      <div className="bg-white/10 rounded-2xl p-5 max-w-sm w-full">
        <p className="text-white text-sm font-semibold mb-1">😔 הפעם לא הצלחת</p>
        <p className="text-orange-300 text-xs">
          הודעה הבאה תגיע בקרוב — היה מוכן!
        </p>
      </div>
    </div>
  );
}

export default function TakenPage() {
  return (
    <Suspense>
      <TakenContent />
    </Suspense>
  );
}
