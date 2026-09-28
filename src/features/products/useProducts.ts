import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, fetchProductById, calculateDeliveryEstimate } from '../../api';
import type { ProductFilters } from '../../types';

export const PRODUCTS_QUERY_KEY = 'products';
export const PRODUCT_DETAIL_QUERY_KEY = 'product-detail';
export const DELIVERY_ESTIMATE_QUERY_KEY = 'delivery-estimate';

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 2 * 60 * 1000, // 2 min
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [PRODUCT_DETAIL_QUERY_KEY, id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      // Hydrate from list cache if available
      const lists = queryClient.getQueriesData<{ data: { id: string }[] }>({
        queryKey: [PRODUCTS_QUERY_KEY],
      });
      for (const [, data] of lists) {
        if (!data) continue;
        const found = data.data.find(p => p.id === id);
        if (found) return found as any;
      }
    },
  });
}

export function useDeliveryEstimate(productId: string, quantity: number) {
  return useQuery({
    queryKey: [DELIVERY_ESTIMATE_QUERY_KEY, productId, quantity],
    queryFn: () => calculateDeliveryEstimate(productId, quantity),
    enabled: !!productId && quantity > 0,
    staleTime: 60 * 1000,
  });
}
