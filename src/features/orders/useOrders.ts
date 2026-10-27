import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrderHistory, fetchOrderById, submitOrder, triggerDispatch } from '../../api';
import { useAuthStore } from '../../store';
import type { CartItem } from '../../types';

const ORDER_HISTORY_KEY = 'order-history';
const ORDER_DETAIL_KEY = 'order-detail';

export function useOrderHistory() {
  const user = useAuthStore(s => s.user);

  return useQuery({
    queryKey: [ORDER_HISTORY_KEY, user?.id],
    queryFn: () => fetchOrderHistory(user!.id),
    enabled: !!user,
    staleTime: 30 * 1000,
  });
}

export function useOrder(orderId: string, poll = false) {
  return useQuery({
    queryKey: [ORDER_DETAIL_KEY, orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId,
    refetchInterval: poll ? 5000 : false,
  });
}

export function useTriggerDispatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => triggerDispatch(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: [ORDER_DETAIL_KEY, orderId] });
      queryClient.invalidateQueries({ queryKey: [ORDER_HISTORY_KEY] });
    },
  });
}

export function useSubmitOrder() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();

  // Cart is cleared by the caller only after payment succeeds.
  return useMutation({
    mutationFn: (params: { items: CartItem[]; shippingAddress?: string }) =>
      submitOrder(user!.id, params.items, params.shippingAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDER_HISTORY_KEY] });
    },
  });
}
