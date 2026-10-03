import { NextRequest, NextResponse } from 'next/server';
import { buildTranzilaIframeUrl, TRANZILA_TERMINAL } from '@/config/payment';

export async function POST(req: NextRequest) {
  const { orderId, amount } = await req.json();
  if (!orderId || !amount) {
    return NextResponse.json({ error: 'Missing orderId or amount' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!TRANZILA_TERMINAL || !TRANZILA_PASSWORD) {
    // Demo mode — credentials not yet configured
    return NextResponse.json({
      mode: 'demo',
      iframeUrl: null,
      demoAmount: amount,
    });
  }

  const tktEnabled = process.env.TRANZILA_TKT_ENABLED === 'true';

  const iframeUrl = buildTranzilaIframeUrl({
    orderId,
    amount,
    notifyUrl: `${appUrl}/api/payment/notify`,
    successUrl: `${appUrl}/payment/success?orderId=${orderId}`,
    failUrl: `${appUrl}/payment/fail?orderId=${orderId}`,
    saveToken: tktEnabled,
  });

  return NextResponse.json({ mode: 'live', iframeUrl });
}
