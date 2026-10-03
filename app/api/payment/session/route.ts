import { NextRequest, NextResponse } from 'next/server';
import { buildTranzilaIframeUrl, TRANZILA_TERMINAL } from '@/config/payment';

export async function POST(req: NextRequest) {
  const { orderId, amount } = await req.json();
  if (!orderId || !amount) {
    return NextResponse.json({ error: 'Missing orderId or amount' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!TRANZILA_TERMINAL) {
    // Demo mode — no real credentials yet
    return NextResponse.json({
      mode: 'demo',
      iframeUrl: null,
      demoAmount: amount,
    });
  }

  const iframeUrl = buildTranzilaIframeUrl({
    orderId,
    amount,
    notifyUrl: `${appUrl}/api/payment/notify`,
    successUrl: `${appUrl}/payment/success?orderId=${orderId}`,
    failUrl: `${appUrl}/payment/fail?orderId=${orderId}`,
  });

  return NextResponse.json({ mode: 'live', iframeUrl });
}
