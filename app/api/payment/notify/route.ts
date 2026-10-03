import { NextRequest, NextResponse } from 'next/server';
import { paymentResults, type PaymentResult } from '../store';

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
