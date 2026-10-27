import { kvGet, kvSet } from '@/lib/kv';

export interface PaymentResult {
  orderId: string;
  transactionId: string;
  token: string;
  last4: string;
  expDate: string;
  amount: string;
  paidAt: string;
}

const expectedKey = (orderId: string) => `payment:expected:${orderId}`;
const resultKey = (orderId: string) => `payment:result:${orderId}`;

export const setExpectedAmount = (orderId: string, amount: number) =>
  kvSet(expectedKey(orderId), amount, 60 * 60 * 24);

export const getExpectedAmount = (orderId: string) => kvGet<number>(expectedKey(orderId));

export const savePaymentResult = (result: PaymentResult) => kvSet(resultKey(result.orderId), result);

export const getPaymentResult = (orderId: string) => kvGet<PaymentResult>(resultKey(orderId));
