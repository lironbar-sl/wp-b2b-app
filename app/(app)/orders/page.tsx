'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { useOrderHistory } from '@/features/orders/useOrders';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { OrderCard } from '@/components/orders/OrderCard';

export default function OrdersPage() {
  const router = useRouter();
  const { data: orders, isLoading, isError, error, refetch } = useOrderHistory();

  const orderCount = orders?.length ?? 0;

  return (
    <AppShell activeTab="orders">
      {/* Page title area */}
      <div className="bg-[#0F172A] px-4 pt-12 pb-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">Orders</h1>
          {orderCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {orderCount}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <ErrorMessage
            title="Could not load orders"
            message={
              (error as { message?: string })?.message ??
              'Please check your connection and try again.'
            }
            onRetry={() => refetch()}
            className="mt-4"
          />
        )}

        {/* Empty state */}
        {!isLoading && !isError && orderCount === 0 && (
          <EmptyState
            icon={<ClipboardList className="w-8 h-8" />}
            title="No orders yet"
            description="Start adding products to your cart and place your first order."
            action={{
              label: 'Start Ordering',
              onClick: () => router.push('/catalog'),
            }}
            className="py-20"
          />
        )}

        {/* Order list */}
        {!isLoading && !isError && orderCount > 0 && (
          <div className="space-y-3">
            {orders!.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => router.push(`/orders/${order.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
