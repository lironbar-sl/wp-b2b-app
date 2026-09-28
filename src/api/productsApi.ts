import { mockRequest } from './client';
import { MOCK_PRODUCTS } from './mockData';
import type {
  Product,
  ProductListItem,
  ProductFilters,
  PaginatedResponse,
  DeliveryEstimate,
} from '../types';

function toListItem(p: Product): ProductListItem {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    imageUrl: p.imageUrl,
    basePrice: p.basePrice,
    currency: p.currency,
    inventoryStatus: p.inventoryStatus,
    stockQuantity: p.stockQuantity,
    deliveryEstimate: p.deliveryEstimate,
    isActive: p.isActive,
  };
}

export async function fetchProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<ProductListItem>> {
  return mockRequest(() => {
    const { search, category, inventoryStatus, sortBy, sortDirection = 'asc', page = 1, pageSize = 20 } = filters;

    let results = MOCK_PRODUCTS.filter(p => p.isActive);

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q)),
      );
    }

    if (category && category !== 'All') {
      results = results.filter(p => p.category === category);
    }

    if (inventoryStatus) {
      results = results.filter(p => p.inventoryStatus === inventoryStatus);
    }

    if (sortBy) {
      results = [...results].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'price':
            comparison = a.basePrice - b.basePrice;
            break;
          case 'stock':
            comparison = b.stockQuantity - a.stockQuantity;
            break;
          case 'deliveryTime':
            comparison = a.deliveryEstimate.minDays - b.deliveryEstimate.minDays;
            break;
        }
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    const total = results.length;
    const start = (page - 1) * pageSize;
    const paginated = results.slice(start, start + pageSize).map(toListItem);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      hasMore: start + pageSize < total,
    };
  });
}

export async function fetchProductById(id: string): Promise<Product> {
  return mockRequest(() => {
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if (!product) {
      throw { code: 'NOT_FOUND', message: 'Product not found.' };
    }
    return product;
  });
}

export async function calculateDeliveryEstimate(
  productId: string,
  quantity: number,
): Promise<DeliveryEstimate> {
  return mockRequest(() => {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) throw { code: 'NOT_FOUND', message: 'Product not found.' };

    // Larger quantities push the estimate out slightly
    let { minDays, maxDays } = product.deliveryEstimate;
    if (quantity > 100) { minDays += 1; maxDays += 2; }
    if (quantity > 500) { minDays += 2; maxDays += 3; }

    const label =
      minDays === maxDays
        ? `${minDays} business day${minDays !== 1 ? 's' : ''}`
        : `${minDays}–${maxDays} business days`;

    return { minDays, maxDays, label };
  });
}

// TODO (manager/admin): add createProduct, updateProduct, updateInventory endpoints
