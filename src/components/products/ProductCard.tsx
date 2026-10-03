'use client';

import type { ProductListItem } from '@/types';

interface ProductCardProps {
  product: ProductListItem;
  onClick: () => void;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency || 'ILS',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  function handleAddClick(e: React.MouseEvent) {
    e.stopPropagation();
    onClick();
  }

  const stockColor =
    product.stockQuantity > 10
      ? 'text-emerald-600'
      : product.stockQuantity > 0
      ? 'text-amber-600'
      : 'text-slate-400';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className="flex items-center gap-3 bg-white border-b border-slate-100 px-4 py-3 cursor-pointer active:bg-slate-50 transition-colors focus:outline-none"
      aria-label={`פרטי ${product.name}`}
    >
      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 leading-snug truncate">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-slate-400">{product.category}</span>
          {product.stockQuantity !== undefined && (
            <>
              <span className="text-slate-200">·</span>
              <span className={`text-[11px] font-medium ${stockColor}`}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} במלאי` : 'אזל'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Price */}
      <span className="text-sm font-bold text-slate-900 tabular-nums whitespace-nowrap">
        {formatPrice(product.basePrice, product.currency)}
      </span>

      {/* Add button */}
      {product.stockQuantity > 0 ? (
        <button
          type="button"
          onClick={handleAddClick}
          aria-label={`הוסף ${product.name} להזמנה`}
          className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      ) : (
        <div className="w-8 h-8 flex-shrink-0" />
      )}
    </div>
  );
}
