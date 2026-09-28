'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search } from 'lucide-react';
import { useProducts } from '@/features/products/useProducts';
import { useCartStore, selectCartCount } from '@/store/cartStore';
import { PRODUCT_CATEGORIES } from '@/api/mockData';
import { ProductCard } from '@/components/products/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import type { SortField, SortDirection } from '@/types';

type SortOption = { field: SortField; label: string };

const SORT_OPTIONS: SortOption[] = [
  { field: 'name', label: 'שם' },
  { field: 'price', label: 'מחיר' },
  { field: 'stock', label: 'מלאי' },
  { field: 'deliveryTime', label: 'משלוח' },
];

export default function CatalogPage() {
  const router = useRouter();
  const cartCount = useCartStore(selectCartCount);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filters = useMemo(
    () => ({
      search: search || undefined,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      sortBy,
      sortDirection,
    }),
    [search, selectedCategory, sortBy, sortDirection],
  );

  const { data, isLoading, isError, error, refetch } = useProducts(filters);

  function handleSortToggle(field: SortField) {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  }

  const products = data?.data ?? [];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#0F172A]">
        {/* Title row */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <h1 className="text-xl font-bold text-white tracking-tight">קטלוג</h1>
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors"
            aria-label={`עגלה, ${cartCount} פריטים`}
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-[#3B82F6] text-white rounded-full text-[10px] font-bold px-1 leading-none">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 bg-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-700">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש מוצרים..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
            />
            {search.length > 0 && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="נקה חיפוש"
                className="text-slate-400 hover:text-slate-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isActive = cat === selectedCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={[
                  'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150',
                  isActive
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
                ].join(' ')}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort bar */}
        <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none">
          {SORT_OPTIONS.map(({ field, label }) => {
            const isActive = sortBy === field;
            return (
              <button
                key={field}
                type="button"
                onClick={() => handleSortToggle(field)}
                className={[
                  'flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'bg-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800',
                ].join(' ')}
              >
                {label}
                {isActive && (
                  <svg
                    className={`w-3 h-3 transition-transform duration-150 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product grid */}
      <div className="flex-1 px-4 pt-4 pb-4">
        {isLoading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {isError && !isLoading && (
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Failed to load products.'}
            onRetry={() => refetch()}
            className="mt-4"
          />
        )}

        {!isLoading && !isError && products.length === 0 && (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
              </svg>
            }
            title="לא נמצאו מוצרים"
            description={
              search
                ? `אין תוצאות עבור "${search}". נסה חיפוש או קטגוריה אחרת.`
                : 'אין מוצרים בקטגוריה זו.'
            }
            action={
              search || selectedCategory !== 'All'
                ? {
                    label: 'נקה סינון',
                    onClick: () => {
                      setSearch('');
                      setSelectedCategory('All');
                    },
                  }
                : undefined
            }
          />
        )}

        {!isLoading && !isError && products.length > 0 && (
          <>
            <p className="text-xs text-slate-400 mb-3">
              {data?.total ?? products.length} מוצרים
            </p>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => router.push(`/catalog/${product.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
