import { NextRequest, NextResponse } from 'next/server';
import { jobs } from '@/lib/jobStore';
import { BASE_ETA_MINUTES } from '@/config/couriers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const courierName = searchParams.get('name') ?? 'שליח';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wp-b2b.vercel.app';

  if (!token) {
    return NextResponse.redirect(`${appUrl}/dispatch/taken`);
  }

  const job = jobs.get(token);
  if (!job) {
    return NextResponse.redirect(`${appUrl}/dispatch/taken`);
  }

  if (job.acceptedAt) {
    // Already taken by someone else
    return NextResponse.redirect(`${appUrl}/dispatch/taken?name=${encodeURIComponent(courierName)}`);
  }

  // Mark as accepted — atomic in Node.js single thread
  job.courierName = courierName;
  job.etaMinutes = BASE_ETA_MINUTES;
  job.acceptedAt = new Date().toISOString();

  return NextResponse.redirect(
    `${appUrl}/dispatch/accepted?order=${encodeURIComponent(job.orderNumber)}&name=${encodeURIComponent(courierName)}`
  );
}
