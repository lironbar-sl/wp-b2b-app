'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, MapPin } from 'lucide-react';
import { useOrder, useTriggerDispatch } from '@/features/orders/useOrders';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PageProps {
  params: Promise<{ id: string }>;
}

const WAREHOUSE = 'נחלת בנימין 65, תל אביב';

function formatTime(d: Date) {
  return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

function getEtaWindow(dispatchedAt: string, etaMinutes: number) {
  const base = new Date(dispatchedAt).getTime() + etaMinutes * 60 * 1000;
  return {
    early: formatTime(new Date(base - 5 * 60 * 1000)),
    late: formatTime(new Date(base + 10 * 60 * 1000)),
    etaMs: base,
  };
}

function CourierInitials({ name }: { name: string }) {
  const parts = name.split(' ');
  const initials = parts.map(p => p[0]).join('').slice(0, 2);
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
      <span className="text-white font-bold text-base">{initials}</span>
    </div>
  );
}

// Wolt-style circular countdown
function CircularCountdown({
  remainingMs,
  totalMs,
  delivered,
}: {
  remainingMs: number;
  totalMs: number;
  delivered: boolean;
}) {
  const R = 88;
  const cx = 110;
  const cy = 110;
  const circumference = 2 * Math.PI * R;
  const progress = delivered ? 1 : Math.max(0, Math.min(1, 1 - remainingMs / totalMs));
  const dashOffset = circumference * (1 - progress);

  const mins = Math.max(0, Math.floor(remainingMs / 60000));
  const secs = Math.max(0, Math.floor((remainingMs % 60000) / 1000));

  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* Outer pulse rings */}
      {!delivered && (
        <>
          <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 rounded-full border border-cyan-500/10 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        </>
      )}

      {/* SVG ring */}
      <svg width="220" height="220" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center z-10">
        {delivered ? (
          <>
            <CheckCircle className="w-14 h-14 text-emerald-400 mb-1" />
            <span className="text-white text-sm font-semibold">נמסר!</span>
          </>
        ) : remainingMs <= 0 ? (
          <>
            <span className="text-white text-4xl font-black tabular-nums">הגיע</span>
            <span className="text-cyan-300 text-sm mt-1">בדקות הקרובות</span>
          </>
        ) : (
          <>
            <span className="text-white text-5xl font-black tabular-nums leading-none">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-slate-400 text-xs mt-1 tracking-wide">דקות עד הגעה</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: order, isLoading } = useOrder(id, true);
  const dispatch = useTriggerDispatch();
  const dispatchFiredRef = useRef(false);

  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [totalMs, setTotalMs] = useState<number>(1);

  // Trigger dispatch once when we see a submitted order
  useEffect(() => {
    if (order?.status === 'submitted' && !dispatchFiredRef.current) {
      dispatchFiredRef.current = true;
      dispatch.mutate(id);
    }
  }, [order?.status, id, dispatch]);

  // Countdown interval
  useEffect(() => {
    if (!order?.dispatchedAt || !order.etaMinutes) return;

    const { etaMs } = getEtaWindow(order.dispatchedAt, order.etaMinutes);
    const total = order.etaMinutes * 60 * 1000;
    setTotalMs(total);

    const tick = () => setRemainingMs(Math.max(0, etaMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [order?.dispatchedAt, order?.etaMinutes]);

  const isDelivered = order?.status === 'delivered';
  const isDispatched = order?.status === 'dispatched' || order?.status === 'shipped' || isDelivered;
  const isSearching = !isDispatched && !isLoading;

  const etaWindow = order?.dispatchedAt && order.etaMinutes
    ? getEtaWindow(order.dispatchedAt, order.etaMinutes)
    : null;

  const STEPS = [
    { key: 'submitted', label: 'הוזמן' },
    { key: 'dispatched', label: 'בדרך' },
    { key: 'delivered', label: 'נמסר' },
  ] as const;

  const stepIndex = isDelivered ? 2 : isDispatched ? 1 : 0;

  return (
    <div
      className="max-w-md mx-auto min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(170deg, #060e1e 0%, #0a1628 55%, #0f1f3d 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="חזרה"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">
            {order?.orderNumber ?? 'מעקב הזמנה'}
          </p>
          <p className="text-slate-500 text-xs">
            <MapPin className="w-3 h-3 inline mb-0.5 me-0.5" />
            {WAREHOUSE}
          </p>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : isSearching ? (
          /* Searching for courier */
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-spin" style={{ borderTopColor: '#3B82F6', animationDuration: '1.2s' }} />
              <div className="absolute inset-4 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-3xl">🛵</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white text-lg font-bold mb-1">מחפש שליח...</p>
              <p className="text-slate-400 text-sm">שולח הודעה לשליחים הזמינים</p>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-400"
                  style={{ animation: 'bounce 1s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Courier found — countdown */
          <div className="flex flex-col items-center gap-3 w-full">
            <CircularCountdown
              remainingMs={remainingMs}
              totalMs={totalMs}
              delivered={isDelivered}
            />

            <div className="text-center mt-2">
              {isDelivered ? (
                <p className="text-emerald-400 text-xl font-bold">ההזמנה נמסרה!</p>
              ) : (
                <>
                  <p className="text-white text-lg font-bold">השליח בדרך אליך</p>
                  {etaWindow && (
                    <p className="text-cyan-300 text-sm mt-1">
                      יגיע בין <span className="font-bold">{etaWindow.early}</span> ל-<span className="font-bold">{etaWindow.late}</span>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom card */}
      <div className="bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl">
        {/* Courier row */}
        {order?.courierName && (
          <div className="flex items-center gap-3 mb-5">
            <CourierInitials name={order.courierName} />
            <div className="flex-1">
              <p className="text-slate-800 font-semibold text-sm">{order.courierName}</p>
              <p className="text-slate-400 text-xs">השליח שלך</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
          </div>
        )}

        {/* Divider */}
        {order?.courierName && <div className="h-px bg-slate-100 mb-4" />}

        {/* Steps */}
        <div className="flex items-center justify-between px-2">
          {STEPS.map((step, idx) => {
            const done = idx < stepIndex;
            const active = idx === stepIndex;
            return (
              <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center w-full">
                  {idx > 0 && (
                    <div className={`flex-1 h-0.5 -mt-4 ${done ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  )}
                  <div
                    className={[
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                      done
                        ? 'bg-blue-500'
                        : active
                        ? 'bg-blue-500 ring-4 ring-blue-100'
                        : 'bg-slate-100 border border-slate-200',
                    ].join(' ')}
                  >
                    {done ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : active ? (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    ) : null}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 -mt-4 ${done ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium text-center leading-tight ${
                    done || active ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
