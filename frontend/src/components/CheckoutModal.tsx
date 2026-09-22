'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Copy, Check, CreditCard, Banknote, ShieldAlert, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { createOrderApi } from '@/lib/api';
import { Order } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'QR_PAY'>('COD');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const totalPrice = getTotalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validations matching backend schema
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMsg('Vui lòng nhập họ và tên (tối thiểu 2 ký tự).');
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      setErrorMsg('Số điện thoại không hợp lệ (yêu cầu 10 số bắt đầu bằng 0, ví dụ: 0987654321).');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMsg('Vui lòng nhập địa chỉ nhận hàng chi tiết (tối thiểu 5 ký tự).');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Giỏ hàng trống! Vui lòng chọn ít nhất 1 sản phẩm.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim() || undefined,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await createOrderApi(payload);

      if (res.success && res.data) {
        setCreatedOrder(res.data);
        clearCart();
      } else {
        setErrorMsg(res.error || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!createdOrder) return;
    navigator.clipboard.writeText(createdOrder.orderCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTrackCreatedOrder = () => {
    if (createdOrder) {
      onOrderSuccess(createdOrder);
      onClose();
    }
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

        {/* ORDER SUCCESS VIEW */}
        {createdOrder ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">Đặt hàng thành công!</h3>
            <p className="text-sm text-slate-500 mt-1">
              Cảm ơn bạn đã tin tưởng mua sắm tại hệ thống BK-Store.
            </p>

            {/* Order Code Box */}
            <div className="mt-5 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 w-full flex items-center justify-between">
              <div className="text-left">
                <div className="text-xs text-blue-600 font-medium">Mã đơn hàng của bạn:</div>
                <div className="text-xl font-mono font-bold text-blue-900">{createdOrder.orderCode}</div>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            {/* If QR_PAY is selected -> Display VietQR Bank Transfer Card */}
            {createdOrder.paymentMethod === 'QR_PAY' && (
              <div className="mt-5 p-5 rounded-2xl bg-slate-900 text-white w-full flex flex-col items-center">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm font-bold text-slate-100">Quét mã VietQR để thanh toán</h4>
                </div>

                {/* QR Image Mock (VietQR quick link format) */}
                <div className="bg-white p-3 rounded-xl shadow-md my-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `STK: 0987654321|MBBANK|BK-STORE|SO TIEN: ${createdOrder.totalAmount}|NOI DUNG: ${createdOrder.orderCode}`
                    )}`}
                    alt="VietQR Payment"
                    className="w-44 h-44"
                  />
                </div>

                <div className="w-full text-left text-xs space-y-1.5 mt-3 pt-3 border-t border-slate-800 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <span className="font-bold text-white">MB Bank (Quân Đội)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <span className="font-bold text-cyan-300">0987 654 321</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chủ tài khoản:</span>
                    <span className="font-bold text-white">BK-STORE VIETNAM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số tiền:</span>
                    <span className="font-bold text-amber-400">{formatPrice(createdOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nội dung CK:</span>
                    <span className="font-bold text-emerald-400">{createdOrder.orderCode}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recipient summary */}
            <div className="mt-4 w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1 text-slate-600">
              <div><strong className="text-slate-800">Người nhận:</strong> {createdOrder.customerName} ({createdOrder.phone})</div>
              <div><strong className="text-slate-800">Giao đến:</strong> {createdOrder.address}</div>
              <div><strong className="text-slate-800">Phương thức:</strong> {createdOrder.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản QR'}</div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleTrackCreatedOrder}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <span>Tra cứu tiến trình đơn hàng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="py-3 px-5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM VIEW */
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Thông tin đặt hàng</h3>
            <p className="text-xs text-slate-500 mb-6">
              Vui lòng cung cấp số điện thoại chính xác để tra cứu tiến trình vận đơn sau này.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên người nhận <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Quế Bắc"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại <span className="text-rose-500">* (10 số, bắt đầu bằng số 0)</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full text-sm font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ giao hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú cho shipper (tùy chọn)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Giao giờ hành chính, gọi trước khi đến..."
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/10'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Thanh toán COD</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Tiền mặt khi nhận hàng</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QR_PAY')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      paymentMethod === 'QR_PAY'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/10'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Chuyển khoản QR</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Quét mã VietQR nhanh 24/7</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Order items summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Số lượng sản phẩm:</span>
                  <span className="font-semibold text-slate-800">{items.reduce((s, i) => s + i.quantity, 0)} món</span>
                </div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-emerald-600">Miễn phí toàn quốc</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200 mt-2">
                  <span>Tổng thanh toán:</span>
                  <span className="text-lg text-blue-700 font-mono">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Xác nhận đặt hàng</span>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
