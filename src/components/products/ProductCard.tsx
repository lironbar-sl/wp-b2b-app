'use client';

import type { ProductListItem } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: ProductListItem;
  onClick: () => void;
}

function getCategoryEmoji(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('safety')) return '⛑️';
  if (cat.includes('clean')) return '🧴';
  if (cat.includes('office')) return '📎';
  if (cat.includes('packag')) return '📦';
  if (cat.includes('cater') || cat.includes('coffee') || cat.includes('food')) return '☕';
  if (cat.includes('furni')) return '🪑';
  return '📦';
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const emoji = getCategoryEmoji(product.category);

  function handleAddClick(e: React.MouseEvent) {
    e.stopPropagation();
    onClick();
  }

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-transform duration-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`View ${product.name}`}
    >
      {/* Emoji image placeholder */}
      <div className="w-full h-28 bg-slate-50 rounded-lg flex items-center justify-center text-5xl select-none">
        {emoji}
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-mono text-slate-400 tracking-wide uppercase">
          {product.sku}
        </p>
        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
          {product.name}
        </h3>
      </div>

      {/* Badge + delivery */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge status={product.inventoryStatus} />
        <span className="text-[11px] text-slate-400">
          {product.deliveryEstimate.label}
        </span>
      </div>

      {/* Price row + add button */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-lg font-bold text-slate-900">
          {formatPrice(product.basePrice, product.currency)}
        </span>
        <button
          type="button"
          onClick={handleAddClick}
          aria-label={`Add ${product.name} to cart`}
          className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
