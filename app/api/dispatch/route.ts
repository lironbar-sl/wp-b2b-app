import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { nanoid } from 'nanoid';
import { jobs, getJobByOrderId } from '@/lib/jobStore';
import { COURIERS, WAREHOUSE_ADDRESS, BASE_ETA_MINUTES } from '@/config/couriers';

export async function POST(req: NextRequest) {
  const { orderId, orderNumber, itemCount, totalAmount } = await req.json() as {
    orderId: string;
    orderNumber: string;
    itemCount: number;
    totalAmount: number;
  };

  // Idempotent — don't create duplicate jobs
  const existing = getJobByOrderId(orderId);
  if (existing) {
    return NextResponse.json({ token: existing.createdAt, status: 'already_dispatched' });
  }

  const token = nanoid(16);
  jobs.set(token, {
    orderId,
    orderNumber,
    itemCount,
    totalAmount,
    courierName: null,
    courierPhone: null,
    etaMinutes: null,
    acceptedAt: null,
    createdAt: new Date().toISOString(),
  });

  // Send Twilio messages
  const sid  = process.env.TWILIO_ACCOUNT_SID;
  const auth = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER; // e.g. "whatsapp:+14155238886" or "+972XXXXXXXXX"

  if (sid && auth && from) {
    const client = twilio(sid, auth);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wp-b2b.vercel.app';
    const useWhatsApp = from.startsWith('whatsapp:');

    const results = await Promise.allSettled(
      COURIERS.map(courier => {
        const acceptUrl = `${appUrl}/api/dispatch/accept?token=${token}&name=${encodeURIComponent(courier.name)}`;
        const to = useWhatsApp ? `whatsapp:${courier.phone}` : courier.phone;

        const body = [
          `🚚 הזמנה חדשה מWP Wholesale`,
          `📋 מספר: ${orderNumber}`,
          `📦 ${itemCount} פריטים | ₪${totalAmount.toLocaleString('he-IL')}`,
          `📍 איסוף: ${WAREHOUSE_ADDRESS}`,
          `⏱ ETA משוער: ~${BASE_ETA_MINUTES} דקות`,
          ``,
          `👇 לחץ לאישור (ראשון לוקח!):`,
          acceptUrl,
        ].join('\n');

        return client.messages.create({ from, to, body });
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    console.log(`[dispatch] Sent to ${sent}/${COURIERS.length} couriers — order ${orderNumber}`);
  } else {
    console.warn('[dispatch] Twilio not configured — skipping WhatsApp send');
  }

  return NextResponse.json({ token, status: 'dispatched', courierCount: COURIERS.length });
}
