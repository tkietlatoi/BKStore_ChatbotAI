'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  CheckCircle2,
  Package,
  Store,
  MapPin,
} from 'lucide-react';
import { fetchProductBySlug, fetchProducts } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import { ChatWidget } from '@/components/ChatWidget';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState('');

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!slug) return;
    let ignore = false;
    setIsLoading(true);

    fetchProductBySlug(slug)
      .then((data) => {
        if (!ignore) {
          setProduct(data);
          if (data?.thumbnail) setSelectedImg(data.thumbnail);
          setIsLoading(false);

          if (data?.categorySlug) {
            fetchProducts({ category: data.categorySlug, limit: 6 })
              .then((res) => {
                if (!ignore) {
                  setRelatedProducts(
                    res.products.filter((p) => p.slug !== slug && p.id !== data.id).slice(0, 4)
                  );
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-sm text-slate-500 mb-6">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = selectedImg || product.thumbnail;
  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  const stock = product.stock ?? product.stock_quantity ?? 0;
  const isOutOfStock = stock <= 0;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleAskAI = () => {
    setChatInitialPrompt(`Tư vấn cho tôi về sản phẩm ${product.name}, cấu hình này phù hợp với nhu cầu nào?`);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Sticky Header */}
      <Header
        searchQuery=""
        onSearchChange={() => {}}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenChat={() => setIsChatOpen((prev) => !prev)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link
            href={`/brands/${encodeURIComponent(product.brand.toLowerCase())}`}
            className="uppercase font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            title={`Xem thương hiệu ${product.brand}`}
          >
            {product.brand}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Gallery - 6 cols */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="aspect-4/3 rounded-2xl bg-slate-50 border border-slate-200/80 p-6 flex items-center justify-center overflow-hidden">
              <img
                src={currentImage}
                alt={product.name}
                className={`max-h-full max-w-full object-contain mix-blend-multiply ${
                  isOutOfStock ? 'grayscale opacity-75' : ''
                }`}
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    className={`w-20 h-20 rounded-xl border-2 p-1.5 bg-slate-50 shrink-0 transition-all ${
                      currentImage === img
                        ? 'border-blue-600 scale-95 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}

            {/* AI Advisor Button */}
            <button
              onClick={handleAskAI}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Hỏi BK-Bot: &ldquo;Cấu hình {product.name} có phù hợp với tôi?&rdquo;</span>
            </button>
          </div>

          {/* Details - 6 cols */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/brands/${encodeURIComponent(product.brand.toLowerCase())}`}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-colors shadow-2xs"
                  title={`Xem tất cả sản phẩm của ${product.brand}`}
                >
                  {product.brand}
                </Link>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-700">4.9</span>
                  <span className="text-slate-400">(128 đánh giá)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
                      Tiết kiệm {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-[11px] font-bold text-slate-800">100% Chính Hãng</span>
                  <span className="text-[9px] text-slate-400">Bảo hành 12-24T</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                  <RotateCcw className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-[11px] font-bold text-slate-800">1 Đổi 1 Trong 30 Ngày</span>
                  <span className="text-[9px] text-slate-400">Lỗi nhà sản xuất</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                  <Truck className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="text-[11px] font-bold text-slate-800">Giao Hỏa Tốc 2H</span>
                  <span className="text-[9px] text-slate-400">Đồng kiểm khi nhận</span>
                </div>
              </div>

              {/* Quantity selector & Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">Số lượng:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-slate-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                      disabled={quantity >= stock || isOutOfStock}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    {isOutOfStock ? (
                      <span className="text-rose-600 font-semibold">Tạm hết hàng</span>
                    ) : (
                      `Còn ${stock} máy trong kho`
                    )}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Đã thêm vào giỏ!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Thêm vào giỏ</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mua ngay
                  </button>
                </div>

                {/* Showroom Stock Availability */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Tồn kho thực tế tại 3 Showroom BK-Store
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      Thời gian thực
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(product.inventories && product.inventories.length > 0
                      ? product.inventories
                      : [
                          { branchName: 'Hà Nội', city: 'Hà Nội', address: '268 Cầu Giấy', quantity: Math.ceil(stock * 0.4) },
                          { branchName: 'TP.HCM', city: 'TP.HCM', address: '142 Thành Thái, Q.10', quantity: Math.ceil(stock * 0.4) },
                          { branchName: 'Đà Nẵng', city: 'Đà Nẵng', address: '89 Nguyễn Văn Linh', quantity: Math.max(0, stock - 2 * Math.ceil(stock * 0.4)) },
                        ]
                    ).map((inv, idx) => {
                      const q = inv.quantity;
                      const inStock = q > 0;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex flex-col justify-between gap-1 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {inv.branchName}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {inv.city || inv.address || 'Chi nhánh trung tâm'}
                            </p>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                inStock
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  inStock ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              ></span>
                              {inStock ? `Còn ${q} máy` : 'Hết hàng'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Hardware Specs */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span>Thông số kỹ thuật chi tiết</span>
            </h3>

            {product.specs && Object.keys(product.specs).length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="py-2.5 flex justify-between gap-4">
                    <span className="font-semibold text-slate-600 capitalize shrink-0">{key}:</span>
                    <span className="font-mono text-slate-800 text-right">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Đang cập nhật thông số chi tiết...</p>
            )}
          </div>

          {/* Description */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Đặc điểm nổi bật & Đánh giá
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-6">
              {product.description || 'Sản phẩm công nghệ chính hãng cao cấp tại hệ thống BK-Store.'}
            </p>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs text-blue-950">
              <div className="font-bold flex items-center gap-1.5 text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Quyền lợi khi mua sắm tại BK-Store:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Bảo hành chính hãng tại tất cả các trung tâm ủy quyền toàn quốc.</li>
                <li>Đặc quyền 1 đổi 1 trong 30 ngày nếu phát sinh lỗi phần cứng nhà sản xuất.</li>
                <li>Hỗ trợ mượn máy miễn phí trong thời gian chờ thẩm định bảo hành.</li>
                <li>Miễn phí vận chuyển toàn quốc cho đơn hàng từ 1.000.000 VNĐ.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider">
                  Cùng phân khúc & danh mục
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Sản phẩm tương tự bạn có thể quan tâm
                </h3>
              </div>
              <Link
                href="/"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAskAI={(prod) => {
                    setChatInitialPrompt(
                      `Tư vấn cho tôi về sản phẩm ${prod.name}, cấu hình này phù hợp với nhu cầu nào?`
                    );
                    setIsChatOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenTracking={() => setIsTrackingOpen(true)} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        key={`checkout-${isCheckoutOpen ? 'open' : 'closed'}`}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          setIsCheckoutOpen(false);
          setIsTrackingOpen(true);
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />

      {/* Chat Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
        initialPrompt={chatInitialPrompt}
      />
    </div>
  );
}
