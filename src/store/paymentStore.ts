import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedCard } from '@/types';

interface PaymentState {
  savedCard: SavedCard | null;
  setSavedCard: (card: SavedCard) => void;
  clearSavedCard: () => void;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      savedCard: null,
      setSavedCard: (card) => set({ savedCard: card }),
      clearSavedCard: () => set({ savedCard: null }),
    }),
    { name: 'wp-payment' },
  ),
);
