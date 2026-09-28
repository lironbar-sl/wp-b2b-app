import type { InventoryStatus, OrderStatus } from '@/types';

type BadgeStatus = InventoryStatus | OrderStatus | string;

interface BadgeProps {
  status: BadgeStatus;
  className?: string;
}

interface BadgeConfig {
  label: string;
  containerClass: string;
  dotClass: string;
}

function getBadgeConfig(status: BadgeStatus): BadgeConfig {
  switch (status) {
    case 'in_stock':
      return {
        label: 'במלאי',
        containerClass: 'bg-emerald-100 text-emerald-700',
        dotClass: 'bg-emerald-500',
      };
    case 'low_stock':
      return {
        label: 'מלאי נמוך',
        containerClass: 'bg-amber-100 text-amber-700',
        dotClass: 'bg-amber-500',
      };
    case 'out_of_stock':
      return {
        label: 'אזל מהמלאי',
        containerClass: 'bg-red-100 text-red-600',
        dotClass: 'bg-red-500',
      };
    case 'backordered':
      return {
        label: 'הזמנה מוקדמת',
        containerClass: 'bg-indigo-100 text-indigo-700',
        dotClass: 'bg-indigo-500',
      };
    case 'submitted':
      return {
        label: 'הוגשה',
        containerClass: 'bg-blue-100 text-blue-700',
        dotClass: 'bg-blue-500',
      };
    case 'approved':
      return {
        label: 'אושרה',
        containerClass: 'bg-emerald-100 text-emerald-700',
        dotClass: 'bg-emerald-500',
      };
    case 'preparing':
      return {
        label: 'בהכנה',
        containerClass: 'bg-amber-100 text-amber-700',
        dotClass: 'bg-amber-500',
      };
    case 'shipped':
      return {
        label: 'נשלחה',
        containerClass: 'bg-indigo-100 text-indigo-700',
        dotClass: 'bg-indigo-500',
      };
    case 'delivered':
      return {
        label: 'נמסרה',
        containerClass: 'bg-green-100 text-green-800',
        dotClass: 'bg-green-600',
      };
    case 'cancelled':
      return {
        label: 'בוטלה',
        containerClass: 'bg-red-100 text-red-600',
        dotClass: 'bg-red-500',
      };
    case 'draft':
      return {
        label: 'טיוטה',
        containerClass: 'bg-slate-100 text-slate-600',
        dotClass: 'bg-slate-400',
      };
    default:
      return {
        label: status,
        containerClass: 'bg-slate-100 text-slate-600',
        dotClass: 'bg-slate-400',
      };
  }
}

export function Badge({ status, className = '' }: BadgeProps) {
  const config = getBadgeConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.containerClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
