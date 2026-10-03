'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ProductListItem } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: ProductListItem;
  onClick: () => void;
}

const CATEGORY_IMAGE: Record<string, string> = {
  'כיסויים':        'https://images.unsplash.com/photo-1601593346740-925612772716?w=300&h=300&fit=crop&auto=format',
  'מכשירים':        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop&auto=format',
  'מכשירים ':       'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop&auto=format',
  'אוזניות':        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&auto=format',
  'שעונים חכמים':  'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=300&fit=crop&auto=format',
  'מטענים':         'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop&auto=format',
  'כבלים':          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&auto=format',
  'רמקולים':        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop&auto=format',
  'גיימינג':        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&h=300&fit=crop&auto=format',
  'ציוד היקפי':     'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop&auto=format',
  'אביזרים':        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&auto=format',
  'רכב':            'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&h=300&fit=crop&auto=format',
  'מעבדה':          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop&auto=format',
  'כללי':           'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop&auto=format',
  'אביזרי laut':    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&auto=format',
  'אביזרי decoded': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&auto=format',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop&auto=format';

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency || 'ILS',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const imgSrc = product.imageUrl ?? CATEGORY_IMAGE[product.category] ?? FALLBACK_IMAGE;
  const [src, setSrc] = useState(imgSrc);

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
      {/* Product image */}
      <div className="relative w-full h-28 bg-slate-50 rounded-lg overflow-hidden">
        <Image
          src={src}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 45vw, 200px"
          className="object-cover"
          onError={() => setSrc(FALLBACK_IMAGE)}
        />
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
