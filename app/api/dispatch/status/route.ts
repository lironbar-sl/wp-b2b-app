import { NextRequest, NextResponse } from 'next/server';
import { getJobByOrderId } from '@/lib/jobStore';

export async function GET(req: NextRequest) {
  const orderId = new URL(req.url).searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ found: false });

  const job = getJobByOrderId(orderId);
  if (!job || !job.acceptedAt) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    courierName: job.courierName,
    etaMinutes: job.etaMinutes,
    acceptedAt: job.acceptedAt,
  });
}
