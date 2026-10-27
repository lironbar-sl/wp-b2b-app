import { NextRequest, NextResponse } from 'next/server';
import { readCallbackBody, verifyAndRecordPayment } from '../verify';

async function handle(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ ok: false });

  const body = await readCallbackBody(req);
  const result = await verifyAndRecordPayment(orderId, body);
  return NextResponse.json({ ok: result !== null });
}

export const GET = handle;
export const POST = handle;
