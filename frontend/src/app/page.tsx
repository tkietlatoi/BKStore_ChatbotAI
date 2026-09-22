'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { FilterBar } from '@/components/FilterBar';
import { ProductCard } from '@/components/ProductCard';
import { ProductQuickView } from '@/components/ProductQuickView';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import { ChatWidget } from '@/components/ChatWidget';
import { Footer } from '@/components/Footer';

import { Category, Order, Product } from '@/types';
import { fetchCategories, fetchProducts } from '@/lib/api';
import { PackageX, Sparkles } from 'lucide-react';

export default function HomePage() {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Tracking pre-fill
  const [trackingInitialCode, setTrackingInitialCode] = useState<string>('');
  const [trackingInitialPhone, setTrackingInitialPhone] = useState<string>('');

  // Chat pre-fill prompt
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');

  // Load initial Categories
  useEffect(() => {
    async function loadMeta() {
      const cats = await fetchCategories();
      setCategories(cats);
    }
    loadMeta();
  }, []);

  // Compute price range numbers
  const priceRangeFilter = useMemo(() => {
    switch (selectedPriceRange) {
      case 'under-10':
        return { minPrice: 0, maxPrice: 10000000 };
      case '10-25':
        return { minPrice: 10000000, maxPrice: 25000000 };
      case '25-40':
        return { minPrice: 25000000, maxPrice: 40000000 };
      case 'above-40':
        return { minPrice: 40000000, maxPrice: undefined };
      default:
        return { minPrice: undefined, maxPrice: undefined };
    }
  }, [selectedPriceRange]);

  // Load Products when filters change
  useEffect(() => {
    let ignore = false;
    fetchProducts({
      category: selectedCategory,
      brand: selectedBrand,
      minPrice: priceRangeFilter.minPrice,
      maxPrice: priceRangeFilter.maxPrice,
      search: searchQuery,
      sort: selectedSort,
      limit: 24,
    })
      .then((res) => {
        if (!ignore) {
          setProducts(res.products);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading products:', err);
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectedCategory, selectedBrand, priceRangeFilter, searchQuery, selectedSort]);

  // Extract distinct brand list for filter options
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandSet.add(p.brand);
    });
    // Default well-known brands if products list is currently small
    ['Apple', 'Dell', 'Asus', 'Samsung', 'Sony', 'Keychron', 'Anker'].forEach((b) => brandSet.add(b));
    return Array.from(brandSet).sort();
  }, [products]);

  // Scroll smoothly to catalog section
  const handleExploreClick = () => {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Quick View "Buy Now" flow -> open CheckoutModal
  const handleBuyNow = () => {
    setQuickViewProduct(null);
    setIsCheckoutOpen(true);
  };

  // Open Chat with product query
  const handleOpenChatWithProduct = (productName: string) => {
    setQuickViewProduct(null);
    setChatInitialPrompt(`Tư vấn cấu hình sản phẩm ${productName} có phù hợp với nhu cầu của tôi không?`);
    setIsChatOpen(true);
  };

  // Quick Ask AI from Product Card
  const handleAskAI = (product: Product) => {
    setChatInitialPrompt(`Tư vấn cho tôi về sản phẩm ${product.name}, cấu hình này phù hợp với nhu cầu nào?`);
    setIsChatOpen(true);
  };

  // After order created successfully, can open tracking directly
  const handleOrderSuccess = (order: Order) => {
    setTrackingInitialCode(order.orderCode);
    setTrackingInitialPhone(order.phone);
    setIsTrackingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* 1. Sticky Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => {
          setTrackingInitialCode('');
          setTrackingInitialPhone('');
          setIsTrackingOpen(true);
        }}
        onOpenChat={() => setIsChatOpen((prev) => !prev)}
      />

      {/* 2. Hero Section */}
      <Hero
        onExploreClick={handleExploreClick}
        onOpenChat={() => {
          setChatInitialPrompt('Chào BK-Bot! Bạn có thể tư vấn cho tôi một chiếc laptop lập trình tốt không?');
          setIsChatOpen(true);
        }}
      />

      {/* 3. Main Catalog Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kho Thiết Bị Công Nghệ Chính Hãng</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Danh Mục Sản Phẩm Đột Phá
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Hiển thị <strong>{products.length}</strong> thiết bị công nghệ sẵn có
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedPriceRange={selectedPriceRange}
          onSelectPriceRange={setSelectedPriceRange}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
          selectedSort={selectedSort}
          onSelectSort={setSelectedSort}
          brands={availableBrands}
        />

        {/* Product Grid */}
        {isLoading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-4 animate-pulse"
              >
                <div className="aspect-4/3 bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
                <div className="h-6 bg-slate-200 rounded-md w-1/3 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Không có thiết bị nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Thử xóa bớt bộ lọc hoặc gõ từ khóa khác.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedPriceRange('all');
                setSelectedBrand('all');
                setSearchQuery('');
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
                onAskAI={handleAskAI}
              />
            ))}
          </div>
        )}

      </main>

      {/* 4. Footer */}
      <Footer
        onOpenTracking={() => {
          setTrackingInitialCode('');
          setTrackingInitialPhone('');
          setIsTrackingOpen(true);
        }}
      />

      {/* 5. Modals & Slide-overs */}
      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onBuyNow={handleBuyNow}
        onOpenChatWithProduct={handleOpenChatWithProduct}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        key={`${trackingInitialCode}-${trackingInitialPhone}-${isTrackingOpen ? 'open' : 'closed'}`}
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderCode={trackingInitialCode}
        initialPhone={trackingInitialPhone}
      />

      {/* Floating BK-Bot Chat Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
        initialPrompt={chatInitialPrompt}
      />
    </div>
  );
}
