import { mockRequest, mockSlowRequest } from './client';
import { MOCK_ORDERS } from './mockData';
import type { Order, CartItem, DeliveryEstimate, OrderStatus } from '../types';

// In-memory store for orders created during the session
const sessionOrders: Order[] = [];

function getAllOrders(customerId: string): Order[] {
  const seed = MOCK_ORDERS.filter(o => o.customerId === customerId);
  return [...seed, ...sessionOrders.filter(o => o.customerId === customerId)].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function fetchOrderHistory(customerId: string): Promise<Order[]> {
  return mockRequest(() => getAllOrders(customerId));
}

export async function fetchOrderById(orderId: string): Promise<Order> {
  return mockRequest(() => {
    const order =
      MOCK_ORDERS.find(o => o.id === orderId) ??
      sessionOrders.find(o => o.id === orderId);
    if (!order) throw { code: 'NOT_FOUND', message: 'Order not found.' };
    return order;
  });
}

export async function submitOrder(
  customerId: string,
  cartItems: CartItem[],
  shippingAddress?: string,
): Promise<Order> {
  return mockSlowRequest(() => {
    const now = new Date().toISOString();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const orderItems = cartItems.map((item, idx) => ({
      id: `oi-${Date.now()}-${idx}`,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      selectedVariants: item.selectedVariants,
      lineTotal: item.unitPrice * item.quantity,
    }));

    const subtotal = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);

    // Delivery estimate: take the max across all items
    const maxMin = Math.max(...cartItems.map(i => i.deliveryEstimate.minDays));
    const maxMax = Math.max(...cartItems.map(i => i.deliveryEstimate.maxDays));
    const deliveryEstimate: DeliveryEstimate = {
      minDays: maxMin,
      maxDays: maxMax,
      label: maxMin === maxMax ? `${maxMin} business days` : `${maxMin}–${maxMax} business days`,
    };

    const order: Order = {
      id: `ord-session-${Date.now()}`,
      orderNumber,
      customerId,
      status: 'submitted',
      items: orderItems,
      subtotal,
      totalAmount: subtotal,
      currency: 'ILS',
      deliveryEstimate,
      shippingAddress,
      submittedAt: now,
      updatedAt: now,
      createdAt: now,
    };

    sessionOrders.push(order);
    return order;
  });
}

// TODO (manager/admin): add approveOrder, updateOrderStatus, fetchAllOrders (paginated) endpoints

export async function cancelOrder(orderId: string): Promise<Order> {
  return mockRequest(() => {
    const order = sessionOrders.find(o => o.id === orderId);
    if (!order) throw { code: 'NOT_FOUND', message: 'Order not found or cannot be cancelled.' };
    if (!(['submitted', 'approved'] as OrderStatus[]).includes(order.status)) {
      throw { code: 'INVALID_STATE', message: 'This order can no longer be cancelled.' };
    }
    order.status = 'cancelled';
    order.updatedAt = new Date().toISOString();
    return order;
  });
}
