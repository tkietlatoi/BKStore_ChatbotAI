'use client';

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPrice = getTotalPrice();

  const handleUpdate = (productId: string, newQty: number) => {
    const res = updateQuantity(productId, newQty);
    if (!res.success && res.message) {
      setWarningMsg(res.message);
      setTimeout(() => setWarningMsg(null), 3500);
    }
  };

  // Check if any item exceeds available stock
  const hasOverstockItem = items.some(({ product, quantity }) => {
    const maxStock = product.stock ?? product.stock_quantity ?? 0;
    return quantity > maxStock || maxStock <= 0;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Giỏ hàng của bạn</h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {items.length} món
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Warning banner if stock adjusted */}
          {warningMsg && (
            <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium leading-tight">{warningMsg}</span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-16 h-16 text-slate-200 stroke-1 mb-3" />
                <p className="text-sm font-semibold text-slate-600">Giỏ hàng của bạn đang trống</p>
                <p className="text-xs text-slate-400 mt-1">Hãy khám phá các thiết bị flagship tại BK-Store!</p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Mua sắm ngay
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const maxStock = product.stock ?? product.stock_quantity ?? 0;
                const isOutOfStock = maxStock <= 0;
                const isMaxReached = quantity >= maxStock;

                return (
                  <div
                    key={product.id}
                    className={`flex gap-3 p-3 rounded-xl border transition-colors ${
                      isOutOfStock
                        ? 'border-rose-200 bg-rose-50/40'
                        : isMaxReached
                        ? 'border-amber-200/80 bg-amber-50/30'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-18 h-18 rounded-lg bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className={`w-full h-full object-contain mix-blend-multiply ${
                          isOutOfStock ? 'grayscale opacity-75' : ''
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors"
                            title="Xóa khỏi giỏ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-blue-700 font-mono mt-1">
                          {formatPrice(product.price)}
                        </div>
                      </div>

                      {/* Quantity controls & stock warnings */}
                      <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden text-xs">
                            <button
                              onClick={() => handleUpdate(product.id, quantity - 1)}
                              className="px-2.5 py-0.5 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-0.5 font-mono font-semibold text-slate-800">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleUpdate(product.id, quantity + 1)}
                              disabled={isMaxReached || isOutOfStock}
                              className="px-2.5 py-0.5 text-slate-600 hover:bg-slate-100 font-bold disabled:opacity-40 disabled:hover:bg-white"
                              title={isMaxReached ? `Đã đạt giới hạn tồn kho (${maxStock} máy)` : 'Tăng số lượng'}
                            >
                              +
                            </button>
                          </div>

                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold text-rose-600">Hết hàng</span>
                          ) : isMaxReached ? (
                            <span className="text-[10px] text-amber-700 font-medium font-mono">
                              (Tối đa: {maxStock})
                            </span>
                          ) : null}
                        </div>

                        <span className="text-xs font-mono font-bold text-slate-700">
                          {formatPrice(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Tạm tính:</span>
                <span className="text-lg font-extrabold text-blue-700 font-mono">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {hasOverstockItem && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Một số sản phẩm trong giỏ đã vượt tồn kho hoặc hết hàng. Vui lòng điều chỉnh trước khi đặt hàng.</span>
                </div>
              )}

              <div className="text-[11px] text-slate-500">
                Đã bao gồm VAT và miễn phí giao hàng toàn quốc tiêu chuẩn.
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={clearCart}
                  className="px-3.5 py-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Xóa giỏ
                </button>
                <button
                  onClick={() => {
                    if (hasOverstockItem) return;
                    onClose();
                    onProceedToCheckout();
                  }}
                  disabled={hasOverstockItem}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Tiến hành Đặt hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
