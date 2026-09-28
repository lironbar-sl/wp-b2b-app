'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle, MapPin, Phone } from 'lucide-react';

const WAREHOUSE_ADDRESS = 'נחלת בנימין 65, תל אביב';
const WAREHOUSE_MAPS_URL = 'https://maps.google.com/?q=נחלת+בנימין+65+תל+אביב';

function AcceptedContent() {
  const params = useSearchParams();
  const orderNumber = params.get('order') ?? '';
  const courierName = params.get('name') ?? 'שליח';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(170deg, #052e16 0%, #14532d 100%)' }}
    >
      {/* Check circle */}
      <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/50">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>

      <h1 className="text-white text-2xl font-black mb-2">קיבלת את המשלוח!</h1>
      <p className="text-emerald-300 text-base mb-1">
        {courierName}, ההזמנה שלך
      </p>
      {orderNumber && (
        <div className="bg-white/10 rounded-full px-4 py-1.5 mb-8">
          <span className="text-white font-mono text-sm font-semibold">{orderNumber}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="w-full max-w-sm bg-white/10 rounded-2xl p-5 text-right space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">1</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">בוא לאסוף</p>
            <p className="text-emerald-300 text-xs mt-0.5">{WAREHOUSE_ADDRESS}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">2</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">מסור את ההזמנה</p>
            <p className="text-emerald-300 text-xs mt-0.5">תקבל כתובת משלוח בנפרד</p>
          </div>
        </div>
      </div>

      {/* Waze button */}
      <a
        href={WAREHOUSE_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-sm flex items-center justify-center gap-2 h-13 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-colors"
      >
        <MapPin className="w-5 h-5" />
        נווט למחסן
      </a>
    </div>
  );
}

export default function AcceptedPage() {
  return (
    <Suspense>
      <AcceptedContent />
    </Suspense>
  );
}
