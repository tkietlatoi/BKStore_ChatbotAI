export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'laptop' | 'smartphone' | 'accessory';
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  thumbnail: string;
  images: string[];
  specs: Record<string, string>;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  code: string; // e.g. #BK-1024
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  paymentMethod: 'COD' | 'QR_PAY';
  status: 'pending' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  timestamp: string;
}
