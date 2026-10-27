import { NextRequest, NextResponse } from 'next/server';
import { readCallbackBody, verifyAndRecordPayment } from '../verify';

// Tranzila sends the iframe to success/fail URLs via POST, which App Router pages
// can't receive — accept it here and redirect (303 → GET) to the page.
// The success page is only shown once the payment is verified server-side.
async function handle(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get('orderId') ?? '';
  let result = url.searchParams.get('result') === 'success' ? 'success' : 'fail';

  if (result === 'success') {
    const body = await readCallbackBody(req);
    const payment = orderId ? await verifyAndRecordPayment(orderId, body) : null;
    if (!payment) result = 'fail';
  }

  const target = new URL(`/payment/${result}`, url.origin);
  target.searchParams.set('orderId', orderId);
  return NextResponse.redirect(target, 303);
}

export const GET = handle;
export const POST = handle;
