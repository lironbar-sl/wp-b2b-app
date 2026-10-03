import { NextResponse } from 'next/server';
import { NEWORDER_API_URL, NEWORDER_API_TOKEN } from '@/config/inventory';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!NEWORDER_API_TOKEN) {
    return NextResponse.json({ error: 'API token not configured' }, { status: 503 });
  }

  const upstream = await fetch(`${NEWORDER_API_URL}/api/Products/categories`, {
    headers: { Authorization: `Bearer ${NEWORDER_API_TOKEN}` },
    next: { revalidate: 3600 }, // cache 1 hour
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: `Upstream error: ${upstream.status}` }, { status: upstream.status });
  }

  const categories = await upstream.json();
  return NextResponse.json(categories);
}
