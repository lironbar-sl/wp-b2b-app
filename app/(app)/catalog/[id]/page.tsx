'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Truck, ArrowLeft, CheckCircle } from 'lucide-react';
import { useProduct } from '@/features/products/useProducts';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import type { SelectedVariant, ProductVariantGroup } from '@/types';

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

  const { data: product, isLoading } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);

  // Record<variantGroupId, optionId>
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product?.inventoryStatus === 'out_of_stock';

  const variantPriceModifier = useMemo(() => {
    if (!product) return 0;
    let total = 0;
    for (const group of product.variantGroups) {
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

    const resolvedVariants: SelectedVariant[] = product.variantGroups
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
      imageUrl: product.imageUrl,
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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const emoji = getCategoryEmoji(product.category);
  const minQty = product.minOrderQuantity ?? 1;
  const maxQty = product.maxOrderQuantity ?? 999;

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0F172A] flex items-center gap-3 px-4 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-base font-semibold text-white truncate flex-1">פרטי מוצר</h1>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Hero image */}
        <div className="bg-slate-100 h-48 flex items-center justify-center mx-4 mt-4 rounded-2xl">
          <span className="text-[120px] leading-none select-none">{emoji}</span>
        </div>

        <div className="px-4 mt-5 flex flex-col gap-4">
          {/* Category overline + name */}
          <div>
            <p className="text-xs font-semibold text-[#3B82F6] uppercase tracking-widest mb-1">
              {product.category}
            </p>
            <h2 className="text-2xl font-bold text-slate-900 leading-snug">{product.name}</h2>
            <p className="text-xs font-mono text-slate-400 mt-1 tracking-wide">{product.sku}</p>
          </div>

          {/* Price + stock badge */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-3xl font-bold text-slate-900">
              {formatPrice(unitPrice, product.currency)}
            </span>
            <Badge status={product.inventoryStatus} />
          </div>

          {/* Description */}
          <p className="text-sm text-slate-500 leading-relaxed">{product.description}</p>

          {/* Divider */}
          <div className="h-px bg-slate-200" />

          {/* Variant groups */}
          {product.variantGroups.length > 0 && (
            <div className="flex flex-col gap-5">
              {product.variantGroups.map((group) => (
                <div key={group.id}>
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    {group.name}
                    {group.required && (
                      <span className="text-[#3B82F6] ml-0.5">*</span>
                    )}
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

          {/* Delivery estimate */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <Truck className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-700">זמן אספקה משוער</p>
              <p className="text-xs text-slate-500 mt-0.5">{product.deliveryEstimate.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 px-4 py-4 z-40">
        <button
          type="button"
          disabled={isOutOfStock || added}
          onClick={handleAddToCart}
          className={[
            'w-full flex items-center justify-center gap-2.5 h-13 py-3.5 rounded-xl text-sm font-semibold transition-colors duration-150',
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
            <>
              הוסף להזמנה · {formatPrice(totalPrice, product.currency)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
