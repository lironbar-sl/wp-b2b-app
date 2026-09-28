'use client';

import { useRouter } from 'next/navigation';
import { Truck, Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useSubmitOrder } from '@/features/orders/useOrders';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppShell } from '@/components/layout/AppShell';
import type { CartItem } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function getProductEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('coffee') || lower.includes('espresso') || lower.includes('latte')) return '☕';
  if (lower.includes('tea')) return '🍵';
  if (lower.includes('water') || lower.includes('drink') || lower.includes('beverage')) return '💧';
  if (lower.includes('wine') || lower.includes('beer') || lower.includes('alcohol')) return '🍷';
  if (lower.includes('bread') || lower.includes('bakery') || lower.includes('pastry')) return '🍞';
  if (lower.includes('fruit') || lower.includes('apple') || lower.includes('orange')) return '🍎';
  if (lower.includes('vegetable') || lower.includes('veg')) return '🥦';
  if (lower.includes('meat') || lower.includes('chicken') || lower.includes('beef')) return '🥩';
  if (lower.includes('fish') || lower.includes('seafood') || lower.includes('salmon')) return '🐟';
  if (lower.includes('dairy') || lower.includes('milk') || lower.includes('cheese')) return '🧀';
  if (lower.includes('snack') || lower.includes('chip') || lower.includes('cookie')) return '🍪';
  if (lower.includes('sauce') || lower.includes('condiment') || lower.includes('dressing')) return '🫙';
  if (lower.includes('oil') || lower.includes('olive')) return '🫒';
  if (lower.includes('sugar') || lower.includes('honey') || lower.includes('syrup')) return '🍯';
  if (lower.includes('spice') || lower.includes('herb') || lower.includes('seasoning')) return '🌿';
  if (lower.includes('pasta') || lower.includes('noodle') || lower.includes('rice')) return '🍝';
  if (lower.includes('can') || lower.includes('tin') || lower.includes('preserve')) return '🥫';
  if (lower.includes('frozen') || lower.includes('ice cream')) return '🧊';
  if (lower.includes('soap') || lower.includes('clean') || lower.includes('detergent')) return '🧴';
  if (lower.includes('paper') || lower.includes('towel') || lower.includes('napkin')) return '📄';
  return '📦';
}

interface CartItemRowProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
}

function CartItemRow({ item, onRemove, onUpdateQuantity }: CartItemRowProps) {
  const variantSummary = item.selectedVariants
    .map((v) => v.optionLabel)
    .join(', ');
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-start gap-3 mb-3">
        {/* Emoji */}
        <div className="flex-shrink-0 w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">
          {getProductEmoji(item.productName)}
        </div>

        {/* Name + variant */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">
            {item.productName}
          </p>
          {variantSummary && (
            <p className="text-xs text-slate-500 mt-0.5">{variantSummary}</p>
          )}
          <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(item.unitPrice)} ליחידה</p>
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`הסר ${item.productName}`}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors duration-150"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Qty controls + line total */}
      <div className="flex items-center justify-between">
        {/* Quantity selector */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            aria-label="הפחת כמות"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors duration-150 disabled:opacity-40"
            disabled={item.quantity <= 1}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-slate-800 tabular-nums">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label="הגדל כמות"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors duration-150"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Line total */}
        <span className="text-sm font-bold text-slate-800 tabular-nums">
          {formatCurrency(lineTotal)}
        </span>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.itemCount);
  const subtotal = useCartStore((s) => s.subtotal);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getDeliveryEstimate = useCartStore((s) => s.getDeliveryEstimate);

  const submitOrder = useSubmitOrder();

  const deliveryEstimate = getDeliveryEstimate();
  const uniqueItemCount = items.length;

  const handleSubmit = async () => {
    try {
      const order = await submitOrder.mutateAsync({ items });
      try {
        localStorage.setItem('last_order_id', order.id);
      } catch {
        // ignore storage errors
      }
      router.push(`/orders/confirmation/${order.id}`);
    } catch {
      // error displayed below
    }
  };

  return (
    <AppShell activeTab="cart">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#0F172A] px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">הזמנה נוכחית</h1>
          {itemCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {itemCount} יחידות
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Delivery note bar */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5">
            <Truck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700 font-medium">
              זמן אספקה משוער: <span className="font-semibold">{deliveryEstimate.label}</span>
            </p>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8" />}
            title="ההזמנה ריקה"
            description="עיין בקטלוג והוסף מוצרים להזמנה."
            action={{
              label: 'לדף הקטלוג',
              onClick: () => router.push('/catalog'),
            }}
            className="py-20"
          />
        )}

        {/* Cart items */}
        {items.length > 0 && (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </div>

            {/* Order summary card */}
            <div className="bg-[#0F172A] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>
                  {uniqueItemCount} מוצרים ({itemCount} יחידות)
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">סכום ביניים</span>
                  <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">משלוח</span>
                  <span className="text-emerald-400 font-medium">חינם</span>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
                <span className="text-white font-semibold">סה"כ</span>
                <span className="text-white text-xl font-bold tabular-nums">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>

            {/* Error message */}
            {submitOrder.isError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700">שליחת ההזמנה נכשלה</p>
                <p className="text-xs text-red-600 mt-1">
                  {(submitOrder.error as { message?: string })?.message ??
                    'אנא נסה שוב.'}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitOrder.isPending}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold text-base rounded-2xl flex items-center justify-center gap-2 transition-colors duration-150"
            >
              {submitOrder.isPending && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitOrder.isPending ? 'שולח...' : 'שלח הזמנה'}
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
