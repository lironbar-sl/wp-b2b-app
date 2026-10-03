import type {
  Product,
  ProductListItem,
  ProductFilters,
  PaginatedResponse,
  DeliveryEstimate,
} from '../types';
import type { CatalogProduct } from '../../app/api/catalog/route';

function toProductListItem(p: CatalogProduct): ProductListItem {
  return {
    id: p.id,
    sku: p.barcode || p.id,
    name: p.name,
    category: p.category,
    imageUrl: undefined,
    basePrice: p.b2bPrice,
    currency: 'ILS',
    inventoryStatus: p.stock > 10 ? 'in_stock' : p.stock > 0 ? 'low_stock' : 'out_of_stock',
    stockQuantity: p.stock,
    deliveryEstimate: { minDays: 1, maxDays: 3, label: '1–3 ימי עסקים' },
    isActive: true,
  };
}

export async function fetchProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<ProductListItem>> {
  const { search, category, page = 1, pageSize = 100 } = filters;

  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search) params.set('search', search);
  if (category && category !== 'All') params.set('category', category);

  const res = await fetch(`/api/catalog?${params}`);
  if (!res.ok) throw new Error(`שגיאה בטעינת מוצרים: ${res.status}`);

  const json = await res.json() as { products: CatalogProduct[]; page: number; pageSize: number; total: number; hasMore: boolean };

  let items = json.products;

  // Client-side search fallback (the API may not support free-text search)
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.barcode?.includes(q),
    );
  }

  return {
    data: items.map(toProductListItem),
    total: json.total ?? items.length,
    page,
    pageSize,
    hasMore: json.hasMore ?? (items.length === pageSize),
  };
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`/api/catalog?pageSize=500`);
  if (!res.ok) throw new Error('Product not found');

  const json = await res.json() as { products: CatalogProduct[] };
  const found = json.products.find(p => p.id === id);
  if (!found) throw { code: 'NOT_FOUND', message: 'מוצר לא נמצא.' };

  return {
    id: found.id,
    sku: found.barcode || found.id,
    name: found.name,
    description: found.description,
    category: found.category,
    imageUrl: undefined,
    basePrice: found.b2bPrice,
    currency: 'ILS',
    inventoryStatus: found.stock > 10 ? 'in_stock' : found.stock > 0 ? 'low_stock' : 'out_of_stock',
    stockQuantity: found.stock,
    variantGroups: [],
    deliveryEstimate: { minDays: 1, maxDays: 3, label: '1–3 ימי עסקים' },
    tags: [found.category],
    isActive: true,
    minOrderQuantity: 1,
    maxOrderQuantity: found.stock,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function calculateDeliveryEstimate(
  _productId: string,
  quantity: number,
): Promise<DeliveryEstimate> {
  let minDays = 1;
  let maxDays = 3;
  if (quantity > 100) { minDays += 1; maxDays += 1; }
  if (quantity > 500) { minDays += 1; maxDays += 2; }
  const label = `${minDays}–${maxDays} ימי עסקים`;
  return { minDays, maxDays, label };
}
