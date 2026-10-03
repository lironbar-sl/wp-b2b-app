import { NextRequest, NextResponse } from 'next/server';
import { NEWORDER_API_URL, NEWORDER_API_TOKEN, MAIN_BRANCH_ID, calcB2BPrice, CATEGORY_NAME_TO_ID, CATALOG_WHITELIST } from '@/config/inventory';

function isWhitelisted(p: ApiProduct): boolean {
  const cat = p.category?.name ?? '';
  const sup = p.supplier?.name ?? '';
  return (
    CATALOG_WHITELIST.categoryIncludes.some(c => cat.includes(c)) ||
    CATALOG_WHITELIST.supplierExact.includes(sup)
  );
}

export const dynamic = 'force-dynamic';

export interface ApiProduct {
  id: string;
  name: string;
  barcode: string;
  costNoTax: number;
  cost: number;
  price: number;
  isSerial: boolean;
  category: { id: number; name: string };
  isTaxFree: boolean;
  isStock: boolean;
  currentStock: number;
  isActive: boolean;
  description: string;
  supplier: { id: number; name: string };
}

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  categoryId: number;
  b2bPrice: number;      // what customer pays (costNoTax + margin + VAT)
  costNoTax: number;     // raw cost — never sent to client
  retailPrice: number;   // manufacturer/retail price (for reference)
  stock: number;
  inStock: boolean;
  description: string;
  barcode: string;
  supplier: string;
}

function resolveCategory(p: ApiProduct): string {
  const name = p.name;
  // AirPods cases filed under אוזניות → כיסויים
  if (p.category.name === 'אוזניות' && /\bcase\b/i.test(name)) return 'כיסויים';
  // Apple Watch bands filed under שעונים חכמים → רצועות
  if (p.category.name === 'שעונים חכמים' && /\bband\b/i.test(name)) return 'רצועות';
  // Apple Watch cases/glass filed under שעונים חכמים → כיסויים
  if (p.category.name === 'שעונים חכמים' && /\b(case|glass)\b/i.test(name)) return 'כיסויים';
  return p.category.name;
}

function toClientProduct(p: ApiProduct): CatalogProduct {
  return {
    id: p.id,
    name: p.name,
    category: resolveCategory(p),
    categoryId: p.category.id,
    b2bPrice: Math.ceil(calcB2BPrice(p.costNoTax, p.category.id) * 100) / 100,
    costNoTax: p.costNoTax,
    retailPrice: p.price,
    stock: p.currentStock,
    inStock: p.isStock && p.currentStock > 0,
    description: p.description,
    barcode: p.barcode,
    supplier: p.supplier.name,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') ?? '1';
  const pageSize = searchParams.get('pageSize') ?? '50';
  const category = searchParams.get('category') ?? '';
  const search = searchParams.get('search') ?? '';

  if (!NEWORDER_API_TOKEN) {
    return NextResponse.json({ error: 'API token not configured' }, { status: 503 });
  }

  const stockModeParam = searchParams.get('stockMode') ?? '1';
  const params = new URLSearchParams({
    page_num: page,
    page_size: pageSize,
    branchId: String(MAIN_BRANCH_ID),
    stockMode: stockModeParam,
  });
  if (category) {
    const catId = CATEGORY_NAME_TO_ID[category];
    if (catId) params.set('category', String(catId));
  }
  if (search) params.set('search', search);

  const upstream = await fetch(
    `${NEWORDER_API_URL}/api/Products?${params}`,
    {
      headers: { Authorization: `Bearer ${NEWORDER_API_TOKEN}` },
      next: { revalidate: 300 }, // cache 5 minutes
    },
  );

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Upstream API error: ${upstream.status}` },
      { status: upstream.status },
    );
  }

  const raw: ApiProduct[] = await upstream.json();
  const products = raw.filter(p => p.isActive && isWhitelisted(p)).map(toClientProduct);

  return NextResponse.json({
    products,
    page: Number(page),
    pageSize: Number(pageSize),
    total: products.length,
    hasMore: raw.length >= Number(pageSize),
  });
}
