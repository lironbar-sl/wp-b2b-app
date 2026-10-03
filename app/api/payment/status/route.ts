import { NextRequest, NextResponse } from 'next/server';
import { paymentResults } from '../store';

export async function GET(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ paid: false });

  const result = paymentResults.get(orderId);
  if (!result) return NextResponse.json({ paid: false });

  return NextResponse.json({ paid: true, ...result });
}
