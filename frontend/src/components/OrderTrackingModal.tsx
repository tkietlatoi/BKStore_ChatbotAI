'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, ShieldCheck, AlertCircle, Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { trackOrderApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderCode?: string;
  initialPhone?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderCode = '',
  initialPhone = '',
}) => {
  const [orderCode, setOrderCode] = useState(initialOrderCode);
  const [phone, setPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderData, setOrderData] = useState<Order | null>(null);

  const handleSearch = React.useCallback(async (codeToSearch: string, phoneToSearch: string) => {
    setErrorMsg('');
    setOrderData(null);

    if (!codeToSearch.trim()) {
      setErrorMsg('Vui lòng nhập mã đơn hàng (ví dụ: BK-1024).');
      return;
    }

    if (!phoneToSearch.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại dùng đặt hàng để xác thực bảo mật.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await trackOrderApi(codeToSearch, phoneToSearch);
      if (res.success && res.data) {
        setOrderData(res.data);
      } else {
        setErrorMsg(res.error || 'Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại đã nhập.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialOrderCode && initialPhone) {
      let ignore = false;
      trackOrderApi(initialOrderCode, initialPhone)
        .then((res) => {
          if (!ignore && res.success && res.data) {
            setOrderData(res.data);
          }
        })
        .catch(() => {});
      return () => {
        ignore = true;
      };
    }
  }, [initialOrderCode, initialPhone]);

  if (!isOpen) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(orderCode, phone);
  };

  // Status Stepper helpers
  const steps: { key: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'pending', label: 'Chờ xác nhận', icon: Clock },
    { key: 'confirmed', label: 'Đã xác nhận', icon: Package },
    { key: 'shipping', label: 'Đang vận chuyển', icon: Truck },
    { key: 'delivered', label: 'Đã giao hàng', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === 'cancelled') return 'cancelled';
    const orderIndexMap: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 1,
      shipping: 2,
      delivered: 3,
      cancelled: -1,
    };
    const currentIdx = orderIndexMap[currentStatus];
    const stepIdx = orderIndexMap[stepKey];

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-1">
          <Truck className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-900">Tra cứu vận đơn bảo mật</h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Theo tiêu chuẩn NFR-03, vui lòng nhập cả <strong>Mã đơn hàng</strong> và <strong>Số điện thoại</strong> để bảo mật thông tin đơn hàng.
        </p>

        {/* Search Form */}
        <form onSubmit={onSubmit} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã đơn hàng</label>
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Ví dụ: BK-1024"
                className="w-full text-xs font-mono uppercase bg-white px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại đặt hàng</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full text-xs font-mono bg-white px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Kiểm tra trạng thái đơn hàng</span>
              </>
            )}
          </button>
        </form>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Order Result Details */}
        {orderData && (
          <div className="border border-slate-200 rounded-2xl p-5 space-y-5">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-500 font-medium">Mã đơn hàng:</span>
                <span className="text-base font-bold text-blue-700 font-mono ml-2">{orderData.orderCode}</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {new Date(orderData.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>

            {/* Stepper Timeline */}
            {orderData.status === 'cancelled' ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <div className="flex items-center justify-center gap-2 text-rose-700 font-bold text-sm mb-1">
                  <XCircle className="w-5 h-5" />
                  <span>Đơn hàng đã bị hủy</span>
                </div>
                <p className="text-xs text-rose-600">
                  {orderData.trackingInfo || 'Đơn hàng này đã được hủy theo yêu cầu của khách hàng hoặc hết hàng.'}
                </p>
              </div>
            ) : (
              <div className="py-2">
                <div className="grid grid-cols-4 gap-2 relative">
                  {steps.map((step) => {
                    const status = getStepStatus(step.key, orderData.status);
                    const StepIcon = step.icon;
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors mb-1.5 ${
                            status === 'completed'
                              ? 'bg-emerald-600 text-white'
                              : status === 'current'
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[11px] font-medium leading-tight ${
                            status === 'current' ? 'text-blue-700 font-bold' : 'text-slate-600'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {orderData.trackingInfo && (
                  <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Cập nhật vận chuyển:</strong> {orderData.trackingInfo}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recipient info */}
            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1 text-slate-600">
              <div><strong className="text-slate-800">Người nhận:</strong> {orderData.customerName} - {orderData.phone}</div>
              <div><strong className="text-slate-800">Địa chỉ giao:</strong> {orderData.address}</div>
              <div><strong className="text-slate-800">Hình thức thanh toán:</strong> {orderData.paymentMethod === 'COD' ? 'Thanh toán tiền mặt khi nhận hàng (COD)' : 'Chuyển khoản VietQR'}</div>
            </div>

            {/* Items */}
            {orderData.items && orderData.items.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Danh sách sản phẩm trong đơn:
                </h5>
                <div className="divide-y divide-slate-100 text-xs">
                  {orderData.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500">x{item.quantity}</span>
                        <span className="font-semibold text-slate-800">{item.productName || item.productId}</span>
                      </div>
                      <span className="font-mono font-bold text-blue-700">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Tổng giá trị đơn hàng:</span>
              <span className="text-base font-extrabold text-blue-700 font-mono">
                {formatPrice(orderData.totalAmount)}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
