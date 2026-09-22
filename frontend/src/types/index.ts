export interface BranchInventory {
  branchId: string;
  branchName: string;
  city: string;
  address?: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug?: string;
  category_slug?: string;
  categoryName?: string;
  category_name?: string;
  brand: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  stock?: number;
  stock_quantity?: number;
  thumbnail: string;
  images: string[];
  specs: Record<string, string>;
  description: string;
  warrantyMonths?: number;
  warranty_months?: number;
  inventories?: BranchInventory[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName?: string;
  productThumbnail?: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderCode: string; // e.g. BK-1024
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  totalAmount: number;
  paymentMethod: 'COD' | 'QR_PAY';
  status: OrderStatus;
  trackingInfo?: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod: 'COD' | 'QR_PAY';
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  timestamp: string;
}
