export interface PaymentResult {
  orderId: string;
  token: string;
  last4: string;
  expDate: string;
  amount: string;
  paidAt: string;
}

declare global {
  var __paymentResults: Map<string, PaymentResult> | undefined;
}

if (!global.__paymentResults) global.__paymentResults = new Map();
export const paymentResults = global.__paymentResults;
