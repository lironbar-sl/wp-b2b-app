import { NextRequest, NextResponse } from 'next/server';
import { buildTranzilaIframeRequest, TRANZILA_TERMINAL, type TranzilaCustomer } from '@/config/payment';
import { setExpectedAmount } from '../store';

export async function POST(req: NextRequest) {
  const { orderId, amount, customer } = (await req.json()) as {
    orderId?: string;
    amount?: number;
    customer?: TranzilaCustomer;
  };
  if (!orderId || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Missing orderId or amount' }, { status: 400 });
  }

  if (!TRANZILA_TERMINAL) {
    return NextResponse.json({ mode: 'demo', demoAmount: amount });
  }

  await setExpectedAmount(orderId, amount);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const id = encodeURIComponent(orderId);

  const request = buildTranzilaIframeRequest({
    amount,
    customer: customer ?? {},
    description: `הזמנה ${orderId}`,
    notifyUrl: `${appUrl}/api/payment/notify?orderId=${id}`,
    successUrl: `${appUrl}/api/payment/return?result=success&orderId=${id}`,
    failUrl: `${appUrl}/api/payment/return?result=fail&orderId=${id}`,
  });

  return NextResponse.json({ mode: 'live', ...request });
}
