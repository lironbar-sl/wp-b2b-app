'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useProduct } from '@/features/products/useProducts';
import { useCartStore } from '@/store/cartStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import type { SelectedVariant, ProductVariantGroup } from '@/types';

function formatPrice(amount: number, currency = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: product, isLoading, isError } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product?.inventoryStatus === 'out_of_stock';

  const variantPriceModifier = useMemo(() => {
    if (!product) return 0;
    let total = 0;
    for (const group of (product.variantGroups ?? [])) {
      const selectedOptionId = selectedVariants[group.id];
      if (selectedOptionId) {
        const option = group.options.find((o: { id: string }) => o.id === selectedOptionId);
        total += option?.priceModifier ?? 0;
      }
    }
    return total;
  }, [product, selectedVariants]);

  const unitPrice = (product?.basePrice ?? 0) + variantPriceModifier;
  const totalPrice = unitPrice * quantity;

  function handleVariantSelect(groupId: string, optionId: string) {
    if (isOutOfStock) return;
    setSelectedVariants((prev) => {
      if (prev[groupId] === optionId) {
        const next = { ...prev };
        delete next[groupId];
        return next;
      }
      return { ...prev, [groupId]: optionId };
    });
  }

  function handleAddToCart() {
    if (!product || isOutOfStock) return;

    const resolvedVariants: SelectedVariant[] = (product.variantGroups ?? [])
      .filter((g: ProductVariantGroup) => selectedVariants[g.id])
      .map((g: ProductVariantGroup) => {
        const option = g.options.find((o) => o.id === selectedVariants[g.id])!;
        return {
          variantGroupId: g.id,
          variantGroupName: g.name,
          optionId: option.id,
          optionLabel: option.label,
          priceModifier: option.priceModifier ?? 0,
        };
      });

    addItem({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      imageUrl: undefined,
      quantity,
      unitPrice,
      selectedVariants: resolvedVariants,
      deliveryEstimate: product.deliveryEstimate,
    });

    setAdded(true);
    setTimeout(() => {
      router.back();
    }, 800);
  }

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        {isError ? (
          <div className="text-center px-6">
            <p className="text-slate-600 font-medium">מוצר לא נמצא</p>
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-4 text-sm text-blue-500 underline"
            >
              חזור לקטלוג
            </button>
          </div>
        ) : (
          <LoadingSpinner size="lg" />
        )}
      </div>
    );
  }

  const minQty = product.minOrderQuantity ?? 1;
  const maxQty = Math.max(product.maxOrderQuantity ?? 999, 1);
  const stockColor =
    (product.stockQuantity ?? 0) > 10
      ? 'text-emerald-600'
      : (product.stockQuantity ?? 0) > 0
      ? 'text-amber-600'
      : 'text-slate-400';

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0F172A] flex items-center gap-3 px-4 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors"
          aria-label="חזור"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-base font-semibold text-white truncate flex-1">{product.name}</h1>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="bg-white border-b border-slate-100 px-4 py-5 flex flex-col gap-1">
          {/* Category + SKU */}
          <p className="text-xs font-semibold text-[#3B82F6] uppercase tracking-widest">
            {product.category}
          </p>
          <h2 className="text-xl font-bold text-slate-900 leading-snug">{product.name}</h2>
          <p className="text-xs font-mono text-slate-400 tracking-wide">{product.sku}</p>

          {/* Price + stock */}
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {formatPrice(unitPrice, product.currency)}
            </span>
            <span className={`text-sm font-medium ${stockColor}`}>
              {isOutOfStock ? 'אזל מהמלאי' : `${product.stockQuantity} במלאי`}
            </span>
          </div>
        </div>

        <div className="px-4 mt-4 flex flex-col gap-4">
          {/* Description */}
          {product.description && (
            <p className="text-sm text-slate-500 leading-relaxed">{product.description}</p>
          )}

          {/* Divider */}
          {(product.variantGroups ?? []).length > 0 && <div className="h-px bg-slate-200" />}

          {/* Variant groups */}
          {(product.variantGroups ?? []).length > 0 && (
            <div className="flex flex-col gap-5">
              {(product.variantGroups ?? []).map((group) => (
                <div key={group.id}>
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    {group.name}
                    {group.required && <span className="text-[#3B82F6] ml-0.5">*</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => {
                      const isSelected = selectedVariants[group.id] === option.id;
                      const outOfOption = option.stockQuantity === 0;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={isOutOfStock || outOfOption}
                          onClick={() => handleVariantSelect(group.id, option.id)}
                          className={[
                            'px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors duration-150',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500',
                            isSelected
                              ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                              : outOfOption || isOutOfStock
                              ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600',
                          ].join(' ')}
                        >
                          {option.label}
                          {option.priceModifier && option.priceModifier > 0 ? (
                            <span className="ml-1 text-xs opacity-80">
                              +{formatPrice(option.priceModifier, product.currency)}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="h-px bg-slate-200" />
            </div>
          )}

          {/* Quantity selector */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">כמות</p>
            <div className="flex items-center gap-3">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={minQty}
                max={maxQty}
              />
              <span className="text-xs text-slate-400">
                מינ׳: {minQty} · מקס׳: {maxQty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar — sits above the app nav (h-16) */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 px-4 py-4 z-50">
        <button
          type="button"
          disabled={isOutOfStock || added}
          onClick={handleAddToCart}
          className={[
            'w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            added
              ? 'bg-emerald-500 text-white cursor-default'
              : isOutOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#3B82F6] hover:bg-blue-500 active:bg-blue-700 text-white',
          ].join(' ')}
        >
          {added ? (
            <>
              <CheckCircle className="w-4 h-4" />
              נוסף להזמנה
            </>
          ) : isOutOfStock ? (
            'אזל מהמלאי'
          ) : (
            <>הוסף להזמנה · {formatPrice(totalPrice, product.currency)}</>
          )}
        </button>
      </div>
    </div>
  );
}
