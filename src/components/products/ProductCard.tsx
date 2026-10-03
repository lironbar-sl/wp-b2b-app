'use client';

import Image from 'next/image';
import { useState } from 'react';
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

// Pick image based on product name → supplier → category
function resolveImage(product: ProductListItem): string {
  const name = product.name.toLowerCase();
  const supplier = (product.supplier ?? '').toLowerCase();

  // By product name keywords
  if (name.includes('iphone') || name.includes('אייפון'))
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=96&h=96&fit=crop&auto=format';
  if (name.includes('airpod'))
    return 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=96&h=96&fit=crop&auto=format';
  if (name.includes('samsung') && (name.includes('buds') || name.includes('galaxy buds')))
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=96&h=96&fit=crop&auto=format';
  if (name.includes('samsung') || name.includes('galaxy'))
    return 'https://images.unsplash.com/photo-1610945264803-c22b62831e8b?w=96&h=96&fit=crop&auto=format';
  if (name.includes('anker') || name.includes('soundcore'))
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=96&h=96&fit=crop&auto=format';
  if (name.includes('jbl'))
    return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=96&h=96&fit=crop&auto=format';

  // By supplier
  if (supplier === 'pitaka')
    return 'https://images.unsplash.com/photo-1601593346740-925612772716?w=96&h=96&fit=crop&auto=format';
  if (supplier === 'amazing thing')
    return 'https://images.unsplash.com/photo-1601593346740-925612772716?w=96&h=96&fit=crop&auto=format';

  // By category
  const cat = product.category;
  if (cat.includes('מכשירים'))
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=96&h=96&fit=crop&auto=format';
  if (cat === 'אוזניות')
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=96&h=96&fit=crop&auto=format';
  if (cat === 'כיסויים')
    return 'https://images.unsplash.com/photo-1601593346740-925612772716?w=96&h=96&fit=crop&auto=format';
  if (cat === 'שעונים חכמים')
    return 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=96&h=96&fit=crop&auto=format';
  if (cat === 'מטענים')
    return 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=96&h=96&fit=crop&auto=format';
  if (cat === 'כבלים')
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=96&h=96&fit=crop&auto=format';

  return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=96&h=96&fit=crop&auto=format';
}

const FALLBACK = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=96&h=96&fit=crop&auto=format';

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(() => product.imageUrl ?? resolveImage(product));

  function handleAddClick(e: React.MouseEvent) {
    e.stopPropagation();
    onClick();
  }

  const stockColor =
    (product.stockQuantity ?? 0) > 10
      ? 'text-emerald-600'
      : (product.stockQuantity ?? 0) > 0
      ? 'text-amber-600'
      : 'text-slate-400';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      className="flex items-center gap-3 bg-white border-b border-slate-100 px-4 py-3 cursor-pointer active:bg-slate-50 transition-colors focus:outline-none"
      aria-label={`פרטי ${product.name}`}
    >
      {/* Thumbnail */}
      <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
        <Image
          src={imgSrc}
          alt=""
          fill
          sizes="44px"
          className="object-cover"
          onError={() => setImgSrc(FALLBACK)}
        />
      </div>

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
