export interface PaymentResult {
  orderId: string;
  transactionId: string;
  token: string;
  last4: string;
  expDate: string;
  amount: string;
  paidAt: string;
}

declare global {
  var __paymentResults: Map<string, PaymentResult> | undefined;
  var __expectedAmounts: Map<string, number> | undefined;
}

if (!global.__paymentResults) global.__paymentResults = new Map();
if (!global.__expectedAmounts) global.__expectedAmounts = new Map();
export const paymentResults = global.__paymentResults;
export const expectedAmounts = global.__expectedAmounts;
