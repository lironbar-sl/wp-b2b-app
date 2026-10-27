import { NextRequest, NextResponse } from 'next/server';
import { acceptJob, getJob } from '@/lib/jobStore';
import { BASE_ETA_MINUTES } from '@/config/couriers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const courierName = searchParams.get('name') ?? 'שליח';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wp-b2b.vercel.app';

  if (!token || !(await getJob(token))) {
    return NextResponse.redirect(`${appUrl}/dispatch/taken`);
  }

  // Atomic — the first courier to click wins
  const job = await acceptJob(token, courierName, BASE_ETA_MINUTES);
  if (!job) {
    return NextResponse.redirect(`${appUrl}/dispatch/taken?name=${encodeURIComponent(courierName)}`);
  }

  return NextResponse.redirect(
    `${appUrl}/dispatch/accepted?order=${encodeURIComponent(job.orderNumber)}&name=${encodeURIComponent(courierName)}`
  );
}
