'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, CheckCircle } from 'lucide-react';
import { useOrder } from '@/features/orders/useOrders';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function getProductEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('coffee') || lower.includes('espresso')) return '☕';
  if (lower.includes('tea')) return '🍵';
  if (lower.includes('water') || lower.includes('drink')) return '💧';
  if (lower.includes('bread') || lower.includes('bakery')) return '🍞';
  if (lower.includes('fruit') || lower.includes('apple')) return '🍎';
  if (lower.includes('meat') || lower.includes('chicken')) return '🥩';
  if (lower.includes('fish') || lower.includes('seafood')) return '🐟';
  if (lower.includes('dairy') || lower.includes('milk')) return '🧀';
  if (lower.includes('sauce') || lower.includes('condiment')) return '🫙';
  if (lower.includes('pasta') || lower.includes('noodle')) return '🍝';
  return '📦';
}

export default function OrderConfirmationPage({ params }: PageProps) {
  const router = useRouter();
  const { id: paramId } = use(params);

  // Fall back to localStorage if id param is missing
  const [resolvedId, setResolvedId] = useState<string>(paramId);

  useEffect(() => {
    if (!paramId) {
      try {
        const stored = localStorage.getItem('last_order_id');
        if (stored) setResolvedId(stored);
      } catch {
        // ignore
      }
    }
  }, [paramId]);

  const { data: order, isLoading } = useOrder(resolvedId);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top gradient section */}
      <div className="bg-gradient-to-b from-[#0F172A] to-[#1E3A5F] px-6 pt-16 pb-10 flex flex-col items-center text-center">
        {/* Green checkmark circle */}
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-emerald-900/30">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1.5">הזמנה התקבלה</h1>
        <p className="text-slate-400 text-sm mb-4">קיבלנו את ההזמנה שלך</p>

        {/* Order number pill */}
        {order && (
          <div className="bg-white/10 rounded-full px-4 py-1.5">
            <span className="text-white font-mono text-sm font-semibold">
              {order.orderNumber}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-5 space-y-4 overflow-y-auto pb-28">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {order && (
          <>
            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                סיכום הזמנה
              </p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-lg">
                      {getProductEmoji(item.productName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-500">כמות: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 tabular-nums">
                      {formatCurrency(item.lineTotal, order.currency)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">סה"כ</span>
                <span className="text-base font-bold text-slate-800 tabular-nums">
                  {formatCurrency(order.totalAmount, order.currency)}
                </span>
              </div>
            </div>

            {/* Delivery section */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
              <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-700">זמן אספקה משוער</p>
                <p className="text-xs text-blue-600">{order.deliveryEstimate.label}</p>
              </div>
            </div>

            {/* Status section */}
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-700">סטטוס</p>
                <p className="text-xs text-emerald-600">הוגשה — ממתינה לאישור</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/orders')}
          className="flex-1 h-12 border border-slate-200 bg-white text-slate-700 font-semibold text-sm rounded-2xl flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition-colors duration-150"
        >
          הזמנות שלי
        </button>
        <button
          type="button"
          onClick={() => router.push('/catalog')}
          className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm rounded-2xl flex items-center justify-center transition-colors duration-150"
        >
          המשך הזמנה
        </button>
      </div>
    </div>
  );
}
