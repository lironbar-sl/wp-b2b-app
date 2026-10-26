import { NextRequest, NextResponse } from 'next/server';
import { paymentResults, type PaymentResult } from '../store';
import { TRANZILA_TERMINAL } from '@/config/payment';

async function readBody(req: NextRequest): Promise<Record<string, string>> {
  if (req.method === 'GET') return Object.fromEntries(new URL(req.url).searchParams);
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try { return await req.json(); } catch { return {}; }
  }
  return Object.fromEntries(new URLSearchParams(await req.text()));
}

async function handle(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get('orderId');
  const body = await readBody(req);

  if (body.Response !== '000' || !orderId) {
    return NextResponse.json({ ok: false });
  }
  if (body.supplier && body.supplier !== TRANZILA_TERMINAL) {
    return NextResponse.json({ ok: false });
  }

  const result: PaymentResult = {
    orderId,
    transactionId: body.transaction_id ?? body.index ?? '',
    token: body.TranzilaTK ?? '',
    last4: body.ccno ?? '****',
    expDate: body.expdate ?? '',
    amount: body.sum ?? '0',
    paidAt: new Date().toISOString(),
  };

  paymentResults.set(orderId, result);
  return NextResponse.json({ ok: true });
}

export const GET = handle;
export const POST = handle;
