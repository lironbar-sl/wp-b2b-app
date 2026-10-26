import { NextRequest, NextResponse } from 'next/server';

// Tranzila sends the iframe to success/fail URLs via POST, which App Router pages
// can't receive — accept it here and redirect (303 → GET) to the page.
function redirect(req: NextRequest) {
  const url = new URL(req.url);
  const result = url.searchParams.get('result') === 'success' ? 'success' : 'fail';
  const orderId = url.searchParams.get('orderId') ?? '';
  const target = new URL(`/payment/${result}`, url.origin);
  target.searchParams.set('orderId', orderId);
  return NextResponse.redirect(target, 303);
}

export const GET = redirect;
export const POST = redirect;
