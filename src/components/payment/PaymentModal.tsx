'use client';

import { useEffect, useRef, useState } from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';

interface Props {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(n);
}

export function PaymentModal({ orderId, amount, onSuccess, onClose }: Props) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch session (iframe URL or demo flag)
  useEffect(() => {
    fetch('/api/payment/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.mode === 'demo') {
          setIsDemo(true);
        } else {
          setIframeUrl(data.iframeUrl);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId, amount]);

  // Listen for postMessage from Tranzila success/fail page inside the iframe
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'TRANZILA_SUCCESS' && e.data?.orderId === orderId) {
        setPaid(true);
        setTimeout(onSuccess, 1200);
      }
      if (e.data?.type === 'TRANZILA_FAIL') {
        onClose();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [orderId, onSuccess, onClose]);

  // Poll for payment confirmation (fallback for webhook flow)
  useEffect(() => {
    if (isDemo) return;
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/payment/status?orderId=${orderId}`).catch(() => null);
      if (!res?.ok) return;
      const data = await res.json();
      if (data.paid) {
        clearInterval(pollRef.current!);
        setPaid(true);
        setTimeout(onSuccess, 1200);
      }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [orderId, isDemo, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.7)' }}>
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="bg-white rounded-t-3xl overflow-hidden" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-slate-800">תשלום בכרטיס אשראי</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount strip */}
        <div className="bg-blue-50 px-5 py-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">לתשלום</span>
          <span className="text-xl font-black text-blue-600 tabular-nums">{formatCurrency(amount)}</span>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center" style={{ minHeight: 320 }}>
          {paid ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
              <p className="text-lg font-bold text-slate-800">התשלום התקבל!</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">טוען טופס תשלום...</p>
            </div>
          ) : isDemo ? (
            <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 mb-1">מצב הדגמה</p>
                <p className="text-sm text-slate-500">
                  הוסף <code className="bg-slate-100 px-1 rounded text-xs">TRANZILA_PASSWORD</code> ב-Vercel
                  כדי לעבור לחיוב אמיתי
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setPaid(true); setTimeout(onSuccess, 800); }}
                className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl"
              >
                סמלץ תשלום מוצלח
              </button>
            </div>
          ) : iframeUrl ? (
            <iframe
              src={iframeUrl}
              title="טופס תשלום מאובטח"
              className="w-full border-0"
              style={{ height: 420 }}
            />
          ) : (
            <p className="text-sm text-red-500 py-10">שגיאה בטעינת טופס תשלום</p>
          )}
        </div>
      </div>
    </div>
  );
}
