import { NextRequest, NextResponse } from 'next/server';
import { paymentResults, expectedAmounts, type PaymentResult } from '../store';
import { TRANZILA_TERMINAL } from '@/config/payment';
import { getTransaction, isTranzilaApiConfigured } from '@/lib/tranzilaApi';

function sameAmount(a: string | undefined, b: number): boolean {
  return Math.abs(Number(a) - b) < 0.01;
}

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

  const transactionId = body.index ?? body.transaction_id ?? '';
  const expected = expectedAmounts.get(orderId);
  if (expected !== undefined && !sameAmount(body.sum, expected)) {
    console.error('[notify] amount mismatch', { orderId, sum: body.sum, expected });
    return NextResponse.json({ ok: false });
  }

  // Confirm with Tranzila's API — the notify POST itself is unauthenticated.
  if (isTranzilaApiConfigured()) {
    const txn = await getTransaction(TRANZILA_TERMINAL, Number(transactionId));
    const approved =
      txn &&
      Number(txn.processor_response_code) === 0 &&
      sameAmount(txn.amount, Number(body.sum));
    if (!approved) {
      console.error('[notify] Tranzila verification failed', { orderId, transactionId, txn });
      return NextResponse.json({ ok: false });
    }
  }

  const result: PaymentResult = {
    orderId,
    transactionId,
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
