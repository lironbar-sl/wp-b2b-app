import type { Order } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ChevronRight, Package } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('he-IL', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number, currency = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 text-left active:bg-slate-50 transition-colors duration-150"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center">
        <Package className="w-5 h-5 text-indigo-500" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-800 font-mono truncate">
            {order.orderNumber}
          </span>
          <Badge status={order.status} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">
            {formatDate(order.createdAt)} · {itemCount} יחידות
          </span>
          <span className="text-sm font-semibold text-slate-700">
            {formatCurrency(order.totalAmount, order.currency)}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="flex-shrink-0 w-4 h-4 text-slate-400" />
    </button>
  );
}
