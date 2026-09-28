import { create } from 'zustand';
import type { CartItem, SelectedVariant, DeliveryEstimate } from '../types';

function generateId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function cartItemKey(productId: string, variants: SelectedVariant[]): string {
  const variantKey = variants
    .map(v => `${v.variantGroupId}:${v.optionId}`)
    .sort()
    .join('|');
  return `${productId}::${variantKey}`;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;

  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getDeliveryEstimate: () => DeliveryEstimate;
}

function computeDerivedValues(items: CartItem[]) {
  return {
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,

  addItem: (newItem) => {
    set(state => {
      const key = cartItemKey(newItem.productId, newItem.selectedVariants);
      const existing = state.items.find(
        i => cartItemKey(i.productId, i.selectedVariants) === key,
      );

      let nextItems: CartItem[];
      if (existing) {
        nextItems = state.items.map(i =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i,
        );
      } else {
        nextItems = [...state.items, { ...newItem, id: generateId() }];
      }

      return { items: nextItems, ...computeDerivedValues(nextItems) };
    });
  },

  removeItem: (itemId) => {
    set(state => {
      const nextItems = state.items.filter(i => i.id !== itemId);
      return { items: nextItems, ...computeDerivedValues(nextItems) };
    });
  },

  updateQuantity: (itemId, quantity) => {
    set(state => {
      if (quantity <= 0) {
        const nextItems = state.items.filter(i => i.id !== itemId);
        return { items: nextItems, ...computeDerivedValues(nextItems) };
      }
      const nextItems = state.items.map(i =>
        i.id === itemId ? { ...i, quantity } : i,
      );
      return { items: nextItems, ...computeDerivedValues(nextItems) };
    });
  },

  clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),

  getDeliveryEstimate: () => {
    const { items } = get();
    if (items.length === 0) {
      return { minDays: 0, maxDays: 0, label: 'N/A' };
    }
    const maxMin = Math.max(...items.map(i => i.deliveryEstimate.minDays));
    const maxMax = Math.max(...items.map(i => i.deliveryEstimate.maxDays));
    const label =
      maxMin === maxMax
        ? `${maxMin} business day${maxMin !== 1 ? 's' : ''}`
        : `${maxMin}–${maxMax} business days`;
    return { minDays: maxMin, maxDays: maxMax, label };
  },
}));

// Selectors
export const selectCartItems = (s: CartState) => s.items;
export const selectCartCount = (s: CartState) => s.itemCount;
export const selectCartSubtotal = (s: CartState) => s.subtotal;
