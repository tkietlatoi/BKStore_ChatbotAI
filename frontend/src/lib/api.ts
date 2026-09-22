import { ApiResponse, Branch, BranchInventory, Category, CreateOrderPayload, Order, OrderStatus, Product } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fallback seed categories
export const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'c1',
    name: 'Laptop & Máy tính xách tay',
    slug: 'laptop',
    description: 'Laptop văn phòng, đồ họa, gaming chính hãng',
  },
  {
    id: 'c2',
    name: 'Điện thoại thông minh',
    slug: 'smartphone',
    description: 'Smartphone cao cấp chính hãng Apple, Samsung',
  },
  {
    id: 'c3',
    name: 'Phụ kiện & Ngoại vi',
    slug: 'accessory',
    description: 'Tai nghe, chuột, bàn phím cơ và củ sạc GaN',
  },
];

// Fallback seed branches
export const FALLBACK_BRANCHES: Branch[] = [
  {
    id: 'b1',
    name: 'BK-Store Cầu Giấy (Hà Nội)',
    city: 'Hà Nội',
    address: '268 Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội',
    phone: '024.3838.9999',
  },
  {
    id: 'b2',
    name: 'BK-Store Quận 10 (TP.HCM)',
    city: 'TP.HCM',
    address: '142 Thành Thái, Phường 12, Quận 10, TP.HCM',
    phone: '028.3838.8888',
  },
  {
    id: 'b3',
    name: 'BK-Store Hải Châu (Đà Nẵng)',
    city: 'Đà Nẵng',
    address: '89 Nguyễn Văn Linh, P. Nam Dương, Q. Hải Châu, Đà Nẵng',
    phone: '0236.3838.777',
  },
];

// Fallback seed products
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1000000-0000-0000-0000-000000000001',
    name: 'MacBook Pro 16 inch M3 Max (36GB/1TB SSD)',
    slug: 'macbook-pro-16-m3-max-36gb-1tb',
    categorySlug: 'laptop',
    categoryName: 'Laptop & Máy tính xách tay',
    brand: 'Apple',
    price: 89990000,
    originalPrice: 94990000,
    stock: 12,
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
    ],
    specs: {
      CPU: 'Apple M3 Max 14-core',
      GPU: '30-core GPU',
      RAM: '36GB Unified',
      SSD: '1TB PCIe Gen4',
      Display: '16.2" Liquid Retina XDR 120Hz',
    },
    description: 'Cỗ máy đỉnh cao cho lập trình viên, đồ họa 3D và AI Engineers với chip M3 Max cực mạnh.',
    warrantyMonths: 12,
    inventories: [
      { branchId: 'b1', branchName: 'Hà Nội', city: 'Hà Nội', quantity: 5 },
      { branchId: 'b2', branchName: 'TP.HCM', city: 'TP.HCM', quantity: 4 },
      { branchId: 'b3', branchName: 'Đà Nẵng', city: 'Đà Nẵng', quantity: 3 },
    ],
  },
  {
    id: 'p1000000-0000-0000-0000-000000000002',
    name: 'Dell XPS 16 9640 (Core Ultra 7 / 32GB / RTX 4060)',
    slug: 'dell-xps-16-9640-ultra-7-rtx-4060',
    categorySlug: 'laptop',
    categoryName: 'Laptop & Máy tính xách tay',
    brand: 'Dell',
    price: 62490000,
    originalPrice: 66000000,
    stock: 8,
    thumbnail: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    ],
    specs: {
      CPU: 'Intel Core Ultra 7 155H (16 cores)',
      GPU: 'NVIDIA GeForce RTX 4060 8GB GDDR6',
      RAM: '32GB LPDDR5X 7467MHz',
      SSD: '1TB M.2 PCIe Gen4 NVMe',
      Display: '16.3" 4K+ OLED Touch 90Hz',
    },
    description: 'Thiết kế nhôm nguyên khối với màn hình tràn viền 4K+ OLED và NPU AI Boost.',
    warrantyMonths: 24,
    inventories: [
      { branchId: 'b1', branchName: 'Hà Nội', city: 'Hà Nội', quantity: 3 },
      { branchId: 'b2', branchName: 'TP.HCM', city: 'TP.HCM', quantity: 3 },
      { branchId: 'b3', branchName: 'Đà Nẵng', city: 'Đà Nẵng', quantity: 2 },
    ],
  },
  {
    id: 'p1000000-0000-0000-0000-000000000003',
    name: 'ASUS ROG Zephyrus G16 (Core Ultra 9 / RTX 4080 / OLED)',
    slug: 'asus-rog-zephyrus-g16-ultra-9-rtx-4080',
    categorySlug: 'laptop',
    categoryName: 'Laptop & Máy tính xách tay',
    brand: 'Asus',
    price: 78990000,
    originalPrice: 82990000,
    stock: 6,
    thumbnail: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'],
    specs: {
      CPU: 'Intel Core Ultra 9 185H',
      GPU: 'NVIDIA GeForce RTX 4080 12GB',
      RAM: '32GB LPDDR5X',
      SSD: '2TB PCIe 4.0 NVMe M.2',
      Display: '16" 2.5K OLED 240Hz 0.2ms G-Sync',
    },
    description: 'Siêu phẩm gaming & đồ họa siêu mỏng chỉ 1.49cm với tấm nền ROG Nebula OLED 240Hz.',
    warrantyMonths: 24,
    inventories: [
      { branchId: 'b1', branchName: 'Hà Nội', city: 'Hà Nội', quantity: 2 },
      { branchId: 'b2', branchName: 'TP.HCM', city: 'TP.HCM', quantity: 3 },
      { branchId: 'b3', branchName: 'Đà Nẵng', city: 'Đà Nẵng', quantity: 1 },
    ],
  },
  {
    id: 'p1000000-0000-0000-0000-000000000004',
    name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên',
    slug: 'iphone-15-pro-max-256gb-titan-natural',
    categorySlug: 'smartphone',
    categoryName: 'Điện thoại thông minh',
    brand: 'Apple',
    price: 29890000,
    originalPrice: 34990000,
    stock: 25,
    thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'],
    specs: {
      Chip: 'Apple A17 Pro (3nm)',
      RAM: '8GB',
      Storage: '256GB NVMe',
      Camera: 'Chính 48MP + Tele 5x 12MP + Góc siêu rộng 12MP',
      Display: '6.7" Super Retina XDR OLED 120Hz ProMotion',
    },
    description: 'Khung viền Titan hàng không vũ trụ siêu nhẹ, cổng USB-C 3.0 tốc độ cao, Action Button.',
    warrantyMonths: 12,
    inventories: [
      { branchId: 'b1', branchName: 'Hà Nội', city: 'Hà Nội', quantity: 10 },
      { branchId: 'b2', branchName: 'TP.HCM', city: 'TP.HCM', quantity: 10 },
      { branchId: 'b3', branchName: 'Đà Nẵng', city: 'Đà Nẵng', quantity: 5 },
    ],
  },
  {
    id: 'p1000000-0000-0000-0000-000000000005',
    name: 'Samsung Galaxy S24 Ultra 5G 12GB/512GB Xám Titan',
    slug: 'samsung-galaxy-s24-ultra-512gb-titan-gray',
    categorySlug: 'smartphone',
    categoryName: 'Điện thoại thông minh',
    brand: 'Samsung',
    price: 31490000,
    originalPrice: 37490000,
    stock: 18,
    thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80'],
    specs: {
      Chip: 'Snapdragon 8 Gen 3 for Galaxy',
      RAM: '12GB LPDDR5X',
      Storage: '512GB UFS 4.0',
      Camera: '200MP OIS + 50MP 5x + 10MP 3x + 12MP Ultra-wide',
      Display: '6.8" Dynamic AMOLED 2X QHD+ 120Hz 2600 nits',
    },
    description: 'Kỷ nguyên Galaxy AI với Circle to Search, Live Translate, bút S-Pen tích hợp và kính Gorilla Armor.',
    warrantyMonths: 12,
    inventories: [
      { branchId: 'b1', branchName: 'Hà Nội', city: 'Hà Nội', quantity: 7 },
      { branchId: 'b2', branchName: 'TP.HCM', city: 'TP.HCM', quantity: 7 },
      { branchId: 'b3', branchName: 'Đà Nẵng', city: 'Đà Nẵng', quantity: 4 },
    ],
  },
  {
    id: 'p1000000-0000-0000-0000-000000000006',
    name: 'Sony WH-1000XM5 Chống Ồn Chủ Động Đỉnh Cao',
    slug: 'sony-wh-1000xm5-noise-cancelling',
    categorySlug: 'accessory',
    categoryName: 'Phụ kiện & Ngoại vi',
    brand: 'Sony',
    price: 7490000,
    originalPrice: 8490000,
    stock: 30,
    thumbnail: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'],
    specs: {
      Driver: '30mm màng loa sợi carbon',
      NoiseCancelling: 'Bộ xử lý V1 + QN1 với 8 microphones',
      Battery: '30 giờ (bật ANC), sạc nhanh 3 phút được 3 giờ',
      Bluetooth: '5.2, hỗ trợ LDAC Hi-Res Audio Wireless',
    },
    description: 'Chuẩn mực tai nghe chống ồn thế giới, đệm tai êm ái, đàm thoại trong trẻo với AI lọc tạp âm.',
    warrantyMonths: 12,
    inventories: [
      { branchId: 'b1', branchName: 'Hà Nội', city: 'Hà Nội', quantity: 12 },
      { branchId: 'b2', branchName: 'TP.HCM', city: 'TP.HCM', quantity: 12 },
      { branchId: 'b3', branchName: 'Đà Nẵng', city: 'Đà Nẵng', quantity: 6 },
    ],
  },
  {
    id: 'p1000000-0000-0000-0000-000000000007',
    name: 'Bàn phím cơ không dây Keychron Q1 Pro QMK/VIA Knob',
    slug: 'keychron-q1-pro-wireless-custom-keyboard',
    categorySlug: 'accessory',
    categoryName: 'Phụ kiện & Ngoại vi',
    brand: 'Keychron',
    price: 4690000,
    originalPrice: 5190000,
    stock: 20,
    thumbnail: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'],
    specs: {
      Layout: '75% Gasket Mount nhôm CNC',
      Switch: 'Keychron K Pro Banana (Tactile)',
      Connectivity: 'Bluetooth 5.1 & Type-C 1000Hz Polling',
      Keycap: 'KSA Double-shot PBT',
    },
    description: 'Thân nhôm nguyên khối 6063, thiết kế Double Gasket Mount êm ái, hỗ trợ tùy biến QMK/VIA không dây.',
    warrantyMonths: 12,
    inventories: [
      { branchId: 'b1', branchName: 'Hà Nội', city: 'Hà Nội', quantity: 8 },
      { branchId: 'b2', branchName: 'TP.HCM', city: 'TP.HCM', quantity: 8 },
      { branchId: 'b3', branchName: 'Đà Nẵng', city: 'Đà Nẵng', quantity: 4 },
    ],
  },
  {
    id: 'p1000000-0000-0000-0000-000000000008',
    name: 'Củ sạc nhanh Anker Prime 100W GaN 3 Cổng',
    slug: 'anker-prime-100w-gan-wall-charger',
    categorySlug: 'accessory',
    categoryName: 'Phụ kiện & Ngoại vi',
    brand: 'Anker',
    price: 1590000,
    originalPrice: 1990000,
    stock: 45,
    thumbnail: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'],
    specs: {
      Power: 'Tối đa 100W Power Delivery 3.0',
      Ports: '2 x USB-C + 1 x USB-A',
      Tech: 'GaNPrime & ActiveShield 2.0 kiểm soát nhiệt',
      Compatibility: 'MacBook Pro, iPhone 15, Samsung, Laptop Windows',
    },
    description: 'Thiết kế nhỏ hơn 43% so với củ sạc 96W thông thường, phân bổ công suất thông minh đa thiết bị.',
    warrantyMonths: 18,
    inventories: [
      { branchId: 'b1', branchName: 'Hà Nội', city: 'Hà Nội', quantity: 18 },
      { branchId: 'b2', branchName: 'TP.HCM', city: 'TP.HCM', quantity: 17 },
      { branchId: 'b3', branchName: 'Đà Nẵng', city: 'Đà Nẵng', quantity: 10 },
    ],
  },
];

// Normalize product properties
export function normalizeProduct(raw: Record<string, unknown>): Product {
  const specs = typeof raw.specs === 'object' && raw.specs !== null ? (raw.specs as Record<string, string>) : {};
  const thumbnail = (raw.thumbnail as string) || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';
  const images = Array.isArray(raw.images) && raw.images.length > 0 ? (raw.images as string[]) : [thumbnail];
  const inventories = Array.isArray(raw.inventories) ? (raw.inventories as BranchInventory[]) : [
    { branchId: 'b1', branchName: 'Hà Nội', city: 'Hà Nội', quantity: 5 },
    { branchId: 'b2', branchName: 'TP.HCM', city: 'TP.HCM', quantity: 4 },
    { branchId: 'b3', branchName: 'Đà Nẵng', city: 'Đà Nẵng', quantity: 3 },
  ];

  return {
    id: String(raw.id),
    name: String(raw.name),
    slug: String(raw.slug),
    categorySlug: (raw.categorySlug as string) || (raw.category_slug as string) || '',
    categoryName: (raw.categoryName as string) || (raw.category_name as string) || '',
    brand: (raw.brand as string) || '',
    price: Number(raw.price) || 0,
    originalPrice: raw.originalPrice ? Number(raw.originalPrice) : (raw.original_price ? Number(raw.original_price) : undefined),
    stock: raw.stock !== undefined ? Number(raw.stock) : (raw.stock_quantity !== undefined ? Number(raw.stock_quantity) : 10),
    thumbnail,
    images,
    specs,
    description: (raw.description as string) || '',
    warrantyMonths: Number(raw.warrantyMonths || raw.warranty_months) || 12,
    inventories,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
  } catch (error) {
    console.warn('[API] fetchCategories fallback to local seed:', error);
  }
  return FALLBACK_CATEGORIES;
}

export async function fetchBranches(): Promise<Branch[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/branches`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
  } catch (error) {
    console.warn('[API] fetchBranches fallback to local seed:', error);
  }
  return FALLBACK_BRANCHES;
}

export interface FetchProductsParams {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<{
  products: Product[];
  total: number;
  totalPages: number;
}> {
  try {
    const url = new URL(`${API_BASE_URL}/products`);
    if (params.category && params.category !== 'all') url.searchParams.set('category', params.category);
    if (params.brand && params.brand !== 'all') url.searchParams.set('brand', params.brand);
    if (params.minPrice !== undefined) url.searchParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) url.searchParams.set('maxPrice', params.maxPrice.toString());
    if (params.search) url.searchParams.set('search', params.search);
    if (params.sort) url.searchParams.set('sort', params.sort);
    if (params.page) url.searchParams.set('page', params.page.toString());
    if (params.limit) url.searchParams.set('limit', params.limit.toString());

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return {
        products: json.data.map(normalizeProduct),
        total: json.pagination?.total || json.data.length,
        totalPages: json.pagination?.totalPages || 1,
      };
    }
  } catch (error) {
    console.warn('[API] fetchProducts fallback to local seed filter:', error);
  }

  // Fallback client-side filter
  let list = [...FALLBACK_PRODUCTS];
  if (params.category && params.category !== 'all') {
    list = list.filter((p) => p.categorySlug?.toLowerCase() === params.category?.toLowerCase());
  }
  if (params.brand && params.brand !== 'all') {
    list = list.filter((p) => p.brand.toLowerCase() === params.brand?.toLowerCase());
  }
  if (params.minPrice !== undefined) {
    list = list.filter((p) => p.price >= (params.minPrice || 0));
  }
  if (params.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= (params.maxPrice || Infinity));
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (params.sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (params.sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  }

  return {
    products: list,
    total: list.length,
    totalPages: 1,
  };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return normalizeProduct(json.data);
      }
    }
  } catch (error) {
    console.warn('[API] fetchProductBySlug fallback:', error);
  }

  const found = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  return found || null;
}

export async function createProductApi(payload: Partial<Product>): Promise<ApiResponse<Product>> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        slug: payload.slug,
        categorySlug: payload.categorySlug,
        brand: payload.brand,
        price: Number(payload.price),
        originalPrice: payload.originalPrice ? Number(payload.originalPrice) : undefined,
        stockQuantity: Number(payload.stock ?? 10),
        thumbnail: payload.thumbnail,
        images: payload.images && payload.images.length > 0 ? payload.images : [payload.thumbnail],
        specs: payload.specs || {},
        description: payload.description,
        warrantyMonths: Number(payload.warrantyMonths ?? 12),
      }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      json.data = normalizeProduct(json.data);
    }
    return json;
  } catch (error: unknown) {
    console.warn('[API] createProductApi fallback mock:', error);
    const mockProduct: Product = {
      id: `p-${Date.now()}`,
      name: payload.name || 'Sản phẩm mới',
      slug: payload.slug || `san-pham-${Date.now()}`,
      categorySlug: payload.categorySlug || 'laptop',
      categoryName: payload.categoryName || (payload.categorySlug === 'laptop' ? 'Laptop & Máy tính xách tay' : payload.categorySlug === 'smartphone' ? 'Điện thoại thông minh' : 'Phụ kiện & Ngoại vi'),
      brand: payload.brand || 'BK-Store',
      price: Number(payload.price || 0),
      originalPrice: Number(payload.originalPrice || payload.price || 0),
      stock: Number(payload.stock ?? 10),
      thumbnail: payload.thumbnail || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      images: payload.images || [payload.thumbnail || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
      specs: payload.specs || {},
      description: payload.description || '',
      warrantyMonths: Number(payload.warrantyMonths ?? 12),
    };
    FALLBACK_PRODUCTS.unshift(mockProduct);
    return {
      success: true,
      data: mockProduct,
      message: 'Tạo sản phẩm thành công (Chế độ mô phỏng offline)!',
    };
  }
}

export async function updateProductApi(id: string, payload: Partial<Product>): Promise<ApiResponse<Product>> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        slug: payload.slug,
        categorySlug: payload.categorySlug,
        brand: payload.brand,
        price: payload.price !== undefined ? Number(payload.price) : undefined,
        originalPrice: payload.originalPrice !== undefined ? Number(payload.originalPrice) : undefined,
        stockQuantity: payload.stock !== undefined ? Number(payload.stock) : undefined,
        thumbnail: payload.thumbnail,
        images: payload.images,
        specs: payload.specs,
        description: payload.description,
        warrantyMonths: payload.warrantyMonths !== undefined ? Number(payload.warrantyMonths) : undefined,
      }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      json.data = normalizeProduct(json.data);
    }
    return json;
  } catch (error: unknown) {
    console.warn('[API] updateProductApi fallback mock:', error);
    const idx = FALLBACK_PRODUCTS.findIndex((p) => p.id === id || p.slug === id);
    if (idx !== -1) {
      FALLBACK_PRODUCTS[idx] = {
        ...FALLBACK_PRODUCTS[idx],
        ...payload,
        price: payload.price !== undefined ? Number(payload.price) : FALLBACK_PRODUCTS[idx].price,
        originalPrice: payload.originalPrice !== undefined ? Number(payload.originalPrice) : FALLBACK_PRODUCTS[idx].originalPrice,
        stock: payload.stock !== undefined ? Number(payload.stock) : FALLBACK_PRODUCTS[idx].stock,
      };
      return {
        success: true,
        data: FALLBACK_PRODUCTS[idx],
        message: 'Cập nhật sản phẩm thành công (Chế độ mô phỏng offline)!',
      };
    }
    return {
      success: false,
      error: 'Không tìm thấy sản phẩm để cập nhật.',
    };
  }
}

export async function deleteProductApi(id: string): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    return json;
  } catch (error: unknown) {
    console.warn('[API] deleteProductApi fallback mock:', error);
    const idx = FALLBACK_PRODUCTS.findIndex((p) => p.id === id || p.slug === id);
    if (idx !== -1) {
      FALLBACK_PRODUCTS.splice(idx, 1);
      return {
        success: true,
        message: 'Đã xóa sản phẩm thành công (Chế độ mô phỏng offline)!',
      };
    }
    return {
      success: false,
      error: 'Không tìm thấy sản phẩm để xóa.',
    };
  }
}

export async function createOrderApi(payload: CreateOrderPayload): Promise<ApiResponse<Order>> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return json;
  } catch (error: unknown) {
    console.warn('[API] createOrder fallback mock:', error);
    // Offline / Mock fallback order
    const randomCode = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockOrder: Order = {
      id: `ord-${Date.now()}`,
      orderCode: randomCode,
      customerName: payload.customerName,
      phone: payload.phone,
      address: payload.address,
      note: payload.note,
      totalAmount: 35990000,
      paymentMethod: payload.paymentMethod,
      status: 'pending',
      trackingInfo: 'Đơn hàng đang chờ nhân viên kiểm tra kho và xác nhận.',
      createdAt: new Date().toISOString(),
    };
    return {
      success: true,
      message: 'Đặt hàng thành công! (Chế độ mô phỏng offline)',
      data: mockOrder,
    };
  }
}

export async function trackOrderApi(orderCode: string, phone: string): Promise<ApiResponse<Order>> {
  try {
    const cleanCode = orderCode.trim().replace(/^#/, '');
    const cleanPhone = phone.trim();
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(cleanCode)}?phone=${encodeURIComponent(cleanPhone)}`, {
      cache: 'no-store',
    });
    const json = await res.json();
    return json;
  } catch {
    return {
      success: false,
      error: 'Không thể kết nối máy chủ để tra cứu đơn hàng. Vui lòng thử lại sau.',
    };
  }
}

// Fallback seed orders for Admin
export const FALLBACK_ORDERS: Order[] = [
  {
    id: 'ord-1024',
    orderCode: '#BK-1024',
    customerName: 'Nguyễn Quế Bắc',
    phone: '0912345678',
    address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
    note: 'Giao giờ hành chính, gọi trước khi đến 15 phút.',
    totalAmount: 89990000,
    paymentMethod: 'QR_PAY',
    status: 'shipping',
    trackingInfo: 'Đang vận chuyển: Đã xuất kho tổng và bàn giao bưu tá.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    items: [
      {
        productId: 'p1000000-0000-0000-0000-000000000001',
        productName: 'MacBook Pro 16 inch M3 Max (36GB/1TB SSD)',
        price: 89990000,
        quantity: 1,
      },
    ],
  },
  {
    id: 'ord-1025',
    orderCode: '#BK-1025',
    customerName: 'Hoàng Tuấn Kiệt',
    phone: '0988776655',
    address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
    note: 'Chuyển khoản thành công qua VietQR.',
    totalAmount: 31490000,
    paymentMethod: 'QR_PAY',
    status: 'confirmed',
    trackingInfo: 'Đã xác nhận: Đơn hàng đã đóng gói chuẩn bị giao cho đơn vị vận chuyển.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      {
        productId: 'p1000000-0000-0000-0000-000000000005',
        productName: 'Samsung Galaxy S24 Ultra 5G 12GB/512GB Xám Titan',
        price: 31490000,
        quantity: 1,
      },
    ],
  },
  {
    id: 'ord-1026',
    orderCode: '#BK-1026',
    customerName: 'Trần Minh Anh',
    phone: '0901234567',
    address: '54 Nguyễn Thị Minh Khai, Hải Châu, Đà Nẵng',
    note: 'Thanh toán tiền mặt khi nhận hàng (COD).',
    totalAmount: 7490000,
    paymentMethod: 'COD',
    status: 'pending',
    trackingInfo: 'Chờ xác nhận: Nhân viên cửa hàng đang liên hệ để chốt thông tin giao hàng.',
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    items: [
      {
        productId: 'p1000000-0000-0000-0000-000000000006',
        productName: 'Sony WH-1000XM5 Chống Ồn Chủ Động Đỉnh Cao',
        price: 7490000,
        quantity: 1,
      },
    ],
  },
];

export async function fetchAllOrders(status?: string, page = 1, limit = 20): Promise<{
  orders: Order[];
  total: number;
  totalPages: number;
}> {
  try {
    const url = new URL(`${API_BASE_URL}/orders`);
    if (status && status !== 'all') url.searchParams.set('status', status);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return {
          orders: json.data,
          total: json.pagination?.total || json.data.length,
          totalPages: json.pagination?.totalPages || 1,
        };
      }
    }
  } catch (error) {
    console.warn('[API] fetchAllOrders fallback to local seed:', error);
  }

  let list = [...FALLBACK_ORDERS];
  if (status && status !== 'all') {
    list = list.filter((o) => o.status.toLowerCase() === status.toLowerCase());
  }

  return {
    orders: list,
    total: list.length,
    totalPages: 1,
  };
}

export async function updateOrderStatusApi(
  orderCode: string,
  status: string,
  trackingInfo?: string
): Promise<ApiResponse<Order>> {
  try {
    const cleanCode = orderCode.trim().replace(/^#/, '');
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(cleanCode)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, trackingInfo }),
    });
    const json = await res.json();
    return json;
  } catch {
    // In-memory fallback
    const found = FALLBACK_ORDERS.find(
      (o) => o.orderCode.replace(/^#/, '') === orderCode.replace(/^#/, '')
    );
    if (found) {
      found.status = status as OrderStatus;
      if (trackingInfo) found.trackingInfo = trackingInfo;
      return { success: true, data: found, message: 'Cập nhật thành công (Chế độ mô phỏng)!' };
    }
    return { success: false, error: 'Không thể kết nối máy chủ để cập nhật.' };
  }
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  chunksCount: number;
  updatedAt: string;
}

export const FALLBACK_KNOWLEDGE_DOCS: KnowledgeDoc[] = [
  {
    id: 'k1',
    title: 'Chính sách bảo hành tiêu chuẩn và 1 đổi 1 trong 30 ngày',
    category: 'warranty',
    summary: 'Quy định điều kiện đổi mới trong 30 ngày và bảo hành chính hãng 12-24 tháng.',
    content: 'Tất cả sản phẩm bán ra tại BK-Store đều là hàng chính hãng 100% nguyên seal. Khách hàng được đổi mới 1-1 trong 30 ngày đầu tiên nếu máy phát sinh lỗi phần cứng từ nhà sản xuất. Sau 30 ngày, máy được bảo hành miễn phí theo chính sách của hãng tại các trung tâm bảo hành ủy quyền của Apple, Dell, Asus, Samsung, Sony.',
    chunksCount: 4,
    updatedAt: '2026-09-20',
  },
  {
    id: 'k2',
    title: 'Quy trình và phương thức giao hàng toàn quốc',
    category: 'shipping',
    summary: 'Miễn phí giao hàng toàn quốc cho đơn từ 1.000.000₫, giao hỏa tốc 2h nội thành.',
    content: 'BK-Store áp dụng chính sách miễn phí vận chuyển toàn quốc cho tất cả đơn hàng có giá trị từ 1.000.000₫ trở lên. Với các đơn hàng nội thành Hà Nội, TP.HCM và Đà Nẵng, khách hàng có thể chọn hình thức giao hỏa tốc nhận máy trong vòng 2 giờ. Khách hàng được đồng kiểm tra ngoại quan máy trước khi thanh toán COD.',
    chunksCount: 3,
    updatedAt: '2026-09-21',
  },
  {
    id: 'k3',
    title: 'Hướng dẫn thanh toán chuyển khoản tự động qua VietQR',
    category: 'payment',
    summary: 'Cú pháp chuyển khoản chuẩn, ngân hàng thụ hưởng và xác nhận tự động.',
    content: 'Hệ thống hỗ trợ thanh toán qua mã VietQR liên kết 40+ ngân hàng Việt Nam. Khách hàng chỉ cần quét mã QR trên màn hình đặt hàng, hệ thống tự động điền đúng số tiền và nội dung chuyển khoản là Mã đơn hàng (ví dụ #BK-1024). Sau khi chuyển khoản, đơn hàng sẽ được tự động kích hoạt xác nhận trong vòng 1-3 phút.',
    chunksCount: 3,
    updatedAt: '2026-09-21',
  },
  {
    id: 'k4',
    title: 'Tư vấn lựa chọn cấu hình Laptop cho Kỹ sư phần mềm & AI',
    category: 'hardware_guide',
    summary: 'Tiêu chuẩn RAM tối thiểu 32GB, chip M3 Max/Intel Core Ultra và card rời RTX.',
    content: 'Đối với lập trình viên AI & Data Science: Ưu tiên máy có tối thiểu 32GB RAM để chạy các mô hình Local LLM (Ollama, vLLM). Chip Apple M3 Max hoặc laptop Windows trang bị card rời NVIDIA GeForce RTX 4060 trở lên giúp tăng tốc độ huấn luyện mô hình và tính toán ma trận GPU.',
    chunksCount: 5,
    updatedAt: '2026-09-22',
  },
];

