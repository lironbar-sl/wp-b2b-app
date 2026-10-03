// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'manager' | 'admin';
export type BusinessType = 'authorized_dealer' | 'company'; // עוסק מורשה | חברה בע"מ

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  // B2B business fields
  phone?: string;
  businessType?: BusinessType;
  businessId?: string;       // מספר עוסק מורשה / ח.פ
  deliveryAddress?: string;  // כתובת רחוב
  deliveryCity?: string;     // עיר
  notes?: string;            // הערות לשליח
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  businessName: string;
  businessType: BusinessType;
  businessId: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  deliveryCity: string;
  password: string;
  confirmPassword: string;
}

// ─── Products ────────────────────────────────────────────────────────────────

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backordered';

export interface ProductVariantOption {
  id: string;
  label: string;
  value: string;
  priceModifier?: number; // additive delta to base price
  stockQuantity: number;
  sku: string;
}

export interface ProductVariantGroup {
  id: string;
  name: string; // e.g. "Size", "Color", "Package"
  options: ProductVariantOption[];
  required: boolean;
}

export interface DeliveryEstimate {
  minDays: number;
  maxDays: number;
  label: string; // e.g. "3–5 business days"
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  basePrice: number;
  currency: string;
  inventoryStatus: InventoryStatus;
  stockQuantity: number;
  variantGroups: ProductVariantGroup[];
  deliveryEstimate: DeliveryEstimate;
  tags: string[];
  isActive: boolean;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem
  extends Pick<
    Product,
    | 'id'
    | 'sku'
    | 'name'
    | 'category'
    | 'imageUrl'
    | 'basePrice'
    | 'currency'
    | 'inventoryStatus'
    | 'stockQuantity'
    | 'deliveryEstimate'
    | 'isActive'
  > {}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface SelectedVariant {
  variantGroupId: string;
  variantGroupName: string;
  optionId: string;
  optionLabel: string;
  priceModifier: number;
}

export interface CartItem {
  id: string; // local uuid
  productId: string;
  productName: string;
  productSku: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number; // resolved price including variants
  selectedVariants: SelectedVariant[];
  deliveryEstimate: DeliveryEstimate;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'preparing'
  | 'dispatched'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  selectedVariants: SelectedVariant[];
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  currency: string;
  deliveryEstimate: DeliveryEstimate;
  shippingAddress?: string;
  notes?: string;
  submittedAt?: string;
  updatedAt: string;
  createdAt: string;
  // Dispatch / courier tracking fields
  dispatchedAt?: string;
  etaMinutes?: number;
  courierName?: string;
  courierPhone?: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface SavedCard {
  token: string;       // Tranzila TKT token
  last4: string;
  expDate: string;     // MMYY
  brand?: string;      // Visa / Mastercard etc.
  savedAt: string;
}

// ─── API Shapes ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export type SortField = 'name' | 'price' | 'stock' | 'deliveryTime';
export type SortDirection = 'asc' | 'desc';

export interface ProductFilters {
  search?: string;
  category?: string;
  inventoryStatus?: InventoryStatus;
  sortBy?: SortField;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
}
