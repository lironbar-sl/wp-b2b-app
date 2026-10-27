import { NextRequest, NextResponse } from 'next/server';
import { getPaymentResult } from '../store';

export async function GET(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ paid: false });

  const result = await getPaymentResult(orderId);
  if (!result) return NextResponse.json({ paid: false });

  // Don't expose the card token to the browser.
  const { token: _token, ...publicResult } = result;
  return NextResponse.json({ paid: true, ...publicResult });
}
