'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Truck } from 'lucide-react';
import { useOrder } from '@/features/orders/useOrders';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { cancelOrder } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import type { OrderStatus } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_STEPS: OrderStatus[] = [
  'submitted',
  'approved',
  'preparing',
  'shipped',
  'delivered',
];

const STEP_LABELS: Record<string, string> = {
  submitted: 'הוגשה',
  approved: 'אושרה',
  preparing: 'בהכנה',
  shipped: 'נשלחה',
  delivered: 'נמסרה',
};

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  return STATUS_STEPS.indexOf(status);
}

function formatCurrency(amount: number, currency = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('he-IL', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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

export default function OrderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);

  const { data: order, isLoading, isError, error, refetch } = useOrder(id);

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!order) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      await cancelOrder(order.id);
      queryClient.invalidateQueries({ queryKey: ['order-detail', order.id] });
      queryClient.invalidateQueries({ queryKey: ['order-history'] });
    } catch (err) {
      setCancelError(
        (err as { message?: string })?.message ?? 'ביטול ההזמנה נכשל. אנא נסה שוב.',
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const currentStepIndex = order ? getStepIndex(order.status) : -1;

  return (
    <AppShell activeTab="orders">
      {/* Header */}
      <div className="bg-[#0F172A] px-4 pt-12 pb-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="חזרה"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:bg-white/30 transition-colors duration-150"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">פרטי הזמנה</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <ErrorMessage
            title="לא ניתן לטעון את ההזמנה"
            message={
              (error as { message?: string })?.message ?? 'אנא נסה שוב.'
            }
            onRetry={() => refetch()}
          />
        )}

        {order && (
          <>
            {/* Order header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <span className="font-mono text-lg font-bold text-slate-800">
                  {order.orderNumber}
                </span>
                <Badge status={order.status} />
              </div>
              <p className="text-xs text-slate-500">
                {formatDate(order.createdAt)}
              </p>
            </div>

            {/* Progress timeline */}
            {order.status !== 'cancelled' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                  התקדמות
                </p>
                <div className="flex items-center">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isLast = idx === STATUS_STEPS.length - 1;

                    return (
                      <React.Fragment key={step}>
                        {/* Step circle */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div
                            className={[
                              'w-6 h-6 rounded-full flex items-center justify-center',
                              isCompleted
                                ? 'bg-blue-500'
                                : 'bg-slate-100 border border-slate-200',
                            ].join(' ')}
                          >
                            {isCompleted && (
                              <svg
                                className="w-3.5 h-3.5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-[9px] font-medium text-center leading-tight max-w-[40px] ${
                              isCompleted ? 'text-blue-600' : 'text-slate-400'
                            }`}
                          >
                            {STEP_LABELS[step]}
                          </span>
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                          <div
                            className={[
                              'flex-1 h-0.5 mx-1 -mt-4',
                              isCompleted && idx < currentStepIndex
                                ? 'bg-blue-500'
                                : 'bg-slate-200',
                            ].join(' ')}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                פריטים
              </p>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const variantSummary = item.selectedVariants
                    .map((v) => v.optionLabel)
                    .join(', ');
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">
                        {getProductEmoji(item.productName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {item.productName}
                        </p>
                        {variantSummary && (
                          <p className="text-xs text-slate-500">{variantSummary}</p>
                        )}
                        <p className="text-xs text-slate-500">כמות: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-800 tabular-nums">
                        {formatCurrency(item.lineTotal, order.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order total */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">סכום ביניים</span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(order.subtotal, order.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">משלוח</span>
                <span className="font-medium text-emerald-600">חינם</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">סה"כ</span>
                <span className="text-base font-bold text-slate-800 tabular-nums">
                  {formatCurrency(order.totalAmount, order.currency)}
                </span>
              </div>
            </div>

            {/* Delivery estimate */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
              <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-700">זמן אספקה משוער</p>
                <p className="text-xs text-blue-600">{order.deliveryEstimate.label}</p>
              </div>
            </div>

            {/* Cancel order */}
            {order.status === 'submitted' && (
              <div className="space-y-2">
                {cancelError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {cancelError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="w-full h-12 border-2 border-red-300 bg-white text-red-600 font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  {isCancelling && (
                    <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {isCancelling ? 'מבטל...' : 'בטל הזמנה'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
