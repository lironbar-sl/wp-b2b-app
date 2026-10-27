import { mockRequest, mockSlowRequest } from './client';
import { MOCK_ORDERS } from './mockData';
import type { Order, CartItem, DeliveryEstimate, OrderStatus } from '../types';
import { DELIVERY_ESTIMATE_LABEL } from '@/config/couriers';

// Orders created in this browser — kept in localStorage so a refresh doesn't lose them
// (until orders are submitted to the real backend).
const SESSION_ORDERS_KEY = 'wp-b2b-orders';

function loadSessionOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SESSION_ORDERS_KEY) ?? '[]') as Order[];
  } catch {
    return [];
  }
}

function saveSessionOrders() {
  try { localStorage.setItem(SESSION_ORDERS_KEY, JSON.stringify(sessionOrders)); } catch { /* ignore */ }
}

const sessionOrders: Order[] = loadSessionOrders();

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
      label: DELIVERY_ESTIMATE_LABEL,
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
    saveSessionOrders();
    return order;
  });
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

const MOCK_COURIERS = ['יוסי לוי', 'מיכאל ברק', 'דני כהן', 'אמיר שלום', 'רוני פרץ'];

export async function triggerDispatch(orderId: string): Promise<void> {
  // Simulate 3–5s to find courier
  await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

  const order = sessionOrders.find(o => o.id === orderId);
  if (!order || order.status !== 'submitted') return;

  const courier = MOCK_COURIERS[Math.floor(Math.random() * MOCK_COURIERS.length)];
  const etaMinutes = 22 + Math.floor(Math.random() * 18); // 22–40 min

  order.status = 'dispatched';
  order.courierName = courier;
  order.etaMinutes = etaMinutes;
  order.dispatchedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();
  saveSessionOrders();
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
    saveSessionOrders();
    return order;
  });
}
