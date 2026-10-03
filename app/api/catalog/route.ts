import { NextRequest, NextResponse } from 'next/server';
import { NEWORDER_API_URL, NEWORDER_API_TOKEN, MAIN_BRANCH_ID, calcB2BPrice, CATALOG_WHITELIST } from '@/config/inventory';

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
  b2bPrice: number;
  costNoTax: number;
  retailPrice: number;
  stock: number;
  inStock: boolean;
  description: string;
  barcode: string;
  supplier: string;
}

function isWhitelisted(p: ApiProduct): boolean {
  const cat = p.category?.name?.trim() ?? '';
  const sup = p.supplier?.name ?? '';
  return (
    CATALOG_WHITELIST.categoryIncludes.some(c => cat.includes(c)) ||
    CATALOG_WHITELIST.supplierExact.includes(sup)
  );
}

function resolveCategory(p: ApiProduct): string {
  const name = p.name;
  const cat = p.category.name.trim();
  // AirPods cases filed under אוזניות by Amazing Thing → כיסויים
  if (cat === 'אוזניות' && /\bcase\b/i.test(name)) return 'כיסויים';
  // Apple Watch bands → רצועות
  if (cat === 'שעונים חכמים' && /\bband\b/i.test(name)) return 'רצועות';
  // Apple Watch cases/glass → כיסויים
  if (cat === 'שעונים חכמים' && /\b(case|glass)\b/i.test(name)) return 'כיסויים';
  // Pitaka AirPods cases in כללי → כיסויים
  if (cat === 'כללי' && p.supplier?.name === 'pitaka' && /airpod/i.test(name)) return 'כיסויים';
  return cat;
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
    supplier: p.supplier?.name ?? '',
  };
}

/** Fetch every page from neworderapi until exhausted. */
async function fetchAllRaw(stockMode: string): Promise<ApiProduct[]> {
  const PAGE_SIZE = 500;
  const all: ApiProduct[] = [];
  let pageNum = 1;

  while (true) {
    const params = new URLSearchParams({
      page_num: String(pageNum),
      page_size: String(PAGE_SIZE),
      branchId: String(MAIN_BRANCH_ID),
      stockMode,
    });

    const res = await fetch(`${NEWORDER_API_URL}/api/Products?${params}`, {
      headers: { Authorization: `Bearer ${NEWORDER_API_TOKEN}` },
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`Upstream ${res.status}`);

    const page: ApiProduct[] = await res.json();
    all.push(...page);

    // Stop when we get fewer items than PAGE_SIZE — no more pages
    if (page.length < PAGE_SIZE) break;
    pageNum++;
  }

  return all;
}

export async function GET(req: NextRequest) {
  if (!NEWORDER_API_TOKEN) {
    return NextResponse.json({ error: 'API token not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const stockMode = searchParams.get('stockMode') ?? '1';

  try {
    const raw = await fetchAllRaw(stockMode);
    const products = raw
      .filter(p => p.isActive && isWhitelisted(p))
      .map(toClientProduct);

    return NextResponse.json({ products, total: products.length, hasMore: false });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 },
    );
  }
}
