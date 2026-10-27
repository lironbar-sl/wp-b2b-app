import { getExpectedAmount, getPaymentResult, savePaymentResult, type PaymentResult } from './store';
import { TRANZILA_TERMINAL } from '@/config/payment';
import { getTransaction, isTranzilaApiConfigured } from '@/lib/tranzilaApi';

function sameAmount(a: string | number | undefined, b: number): boolean {
  return Math.abs(Number(a) - b) < 0.01;
}

/**
 * Verifies a Tranzila callback (notify or success redirect) and records the payment.
 * The callback itself is unauthenticated, so the amount is checked against what we
 * asked for and the transaction is confirmed with Tranzila's API.
 */
export async function verifyAndRecordPayment(
  orderId: string,
  body: Record<string, string>,
): Promise<PaymentResult | null> {
  const existing = await getPaymentResult(orderId);
  if (existing) return existing;

  if (body.Response !== '000') return null;
  if (body.supplier && body.supplier !== TRANZILA_TERMINAL) return null;

  const expected = await getExpectedAmount(orderId);
  if (expected === null || !sameAmount(body.sum, expected)) {
    console.error('[payment] amount mismatch', { orderId, sum: body.sum, expected });
    return null;
  }

  const transactionId = body.index ?? body.transaction_id ?? '';
  if (isTranzilaApiConfigured()) {
    const txn = transactionId ? await getTransaction(TRANZILA_TERMINAL, Number(transactionId)) : null;
    const approved =
      txn && Number(txn.processor_response_code) === 0 && sameAmount(txn.amount, expected);
    if (!approved) {
      console.error('[payment] Tranzila verification failed', { orderId, transactionId, txn });
      return null;
    }
  }

  const result: PaymentResult = {
    orderId,
    transactionId,
    token: body.TranzilaTK ?? '',
    last4: body.ccno ?? '****',
    expDate: body.expdate ?? '',
    amount: body.sum ?? String(expected),
    paidAt: new Date().toISOString(),
  };
  await savePaymentResult(result);
  return result;
}

export async function readCallbackBody(req: Request): Promise<Record<string, string>> {
  if (req.method === 'GET') return Object.fromEntries(new URL(req.url).searchParams);
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try { return await req.json(); } catch { return {}; }
  }
  return Object.fromEntries(new URLSearchParams(await req.text()));
}
