import { NextRequest, NextResponse } from 'next/server';

/**
 * Tranzila webhook — called server-side after a successful payment.
 * Stores the result in a global map so the client can poll for it.
 */

declare global {
  var __paymentResults: Map<string, PaymentResult> | undefined;
}

export interface PaymentResult {
  orderId: string;
  token: string;
  last4: string;
  expDate: string;
  amount: string;
  paidAt: string;
}

if (!global.__paymentResults) global.__paymentResults = new Map();
export const paymentResults = global.__paymentResults;

export async function POST(req: NextRequest) {
  let body: Record<string, string> = {};

  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } else {
    try { body = await req.json(); } catch { /* ignore */ }
  }

  const { Response: responseCode, tranzila_token: orderId, TranzilaTK, last4, expdate } = body;

  if (responseCode !== '000' || !orderId || !TranzilaTK) {
    return NextResponse.json({ ok: false });
  }

  const result: PaymentResult = {
    orderId,
    token: TranzilaTK,
    last4: last4 ?? '****',
    expDate: expdate ?? '',
    amount: body.sum ?? '0',
    paidAt: new Date().toISOString(),
  };

  paymentResults.set(orderId, result);
  return NextResponse.json({ ok: true });
}
