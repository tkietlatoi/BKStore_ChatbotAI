'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  Package,
  Edit3,
  X,
  Check,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { fetchAllOrders, updateOrderStatusApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Update Status Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('confirmed');
  const [trackingNote, setTrackingNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAllOrders(statusFilter);
      setOrders(res.orders);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    let ignore = false;
    fetchAllOrders(statusFilter)
      .then((res) => {
        if (!ignore) {
          setOrders(res.orders);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải danh sách đơn hàng:', err);
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [statusFilter]);

  // Open modal handler
  const handleOpenUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNote(order.trackingInfo || '');
  };

  // Submit status update handler
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const res = await updateOrderStatusApi(
        selectedOrder.orderCode,
        newStatus,
        trackingNote.trim() || undefined
      );

      if (res.success) {
        setToastMessage(`Đã cập nhật trạng thái đơn ${selectedOrder.orderCode} thành công!`);
        setTimeout(() => setToastMessage(''), 3000);
        setSelectedOrder(null);
        await loadOrders();
      } else {
        alert(res.error || 'Lỗi khi cập nhật trạng thái đơn hàng.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.';
      alert(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick 1-click status update handler
  const handleQuickStatusUpdate = async (
    orderCode: string,
    status: OrderStatus,
    defaultNote: string
  ) => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatusApi(orderCode, status, defaultNote);
      if (res.success) {
        setToastMessage(`Đã cập nhật đơn ${orderCode} sang trạng thái "${status}" thành công!`);
        setTimeout(() => setToastMessage(''), 3000);
        await loadOrders();
      } else {
        alert(res.error || 'Lỗi khi cập nhật trạng thái đơn hàng.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.';
      alert(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  // Status badges styling
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            Chờ xác nhận
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono bg-blue-100 text-blue-800">
            <Package className="w-3 h-3" />
            Đã xác nhận
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono bg-indigo-100 text-indigo-800">
            <Truck className="w-3 h-3" />
            Đang vận chuyển
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3" />
            Đã giao hàng
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" />
            Đã hủy đơn
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const statusOptions: { id: string; label: string }[] = [
    { id: 'all', label: 'Tất cả đơn' },
    { id: 'pending', label: 'Chờ duyệt' },
    { id: 'confirmed', label: 'Đã duyệt' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'delivered', label: 'Đã giao' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <span>Quản lý Đơn hàng & Vận chuyển</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi, cập nhật tiến trình đơn hàng liên thông trực tiếp với AI Chatbot BK-Bot.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {statusOptions.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 outline-none focus:bg-white focus:border-blue-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-mono text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Mã đơn</th>
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5">Sản phẩm</th>
                <th className="px-5 py-3.5">Thanh toán</th>
                <th className="px-5 py-3.5">Tổng tiền</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order Code & Date */}
                    <td className="px-5 py-4 font-mono">
                      <div className="font-bold text-blue-700 text-sm">{order.orderCode}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[200px]" title={order.address}>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{order.address}</span>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-5 py-4 max-w-[220px]">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="truncate text-[11px] text-slate-700">
                              <span className="font-mono font-bold text-slate-500">x{item.quantity}</span>{' '}
                              <span>{item.productName || item.productId}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              +{order.items.length - 2} sản phẩm khác...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chi tiết tại đơn</span>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {order.paymentMethod === 'QR_PAY' ? 'VietQR' : 'COD'}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {renderStatusBadge(order.status)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Approve Button for Pending Orders */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() =>
                              handleQuickStatusUpdate(
                                order.orderCode,
                                'confirmed',
                                'Đã duyệt đơn: Nhân viên BK-Store đã xác nhận và chuẩn bị xuất kho.'
                              )
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all"
                            title="Duyệt đơn hàng ngay (1-click)"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Duyệt đơn</span>
                          </button>
                        )}

                        {/* Quick Ship Button for Confirmed Orders */}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() =>
                              handleQuickStatusUpdate(
                                order.orderCode,
                                'shipping',
                                'Đang vận chuyển: Đã bàn giao cho nhân viên giao hàng phát tới khách.'
                              )
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-all"
                            title="Chuyển sang giao hàng (1-click)"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Giao hàng</span>
                          </button>
                        )}

                        {/* Quick Delivered Button for Shipping Orders */}
                        {order.status === 'shipping' && (
                          <button
                            onClick={() =>
                              handleQuickStatusUpdate(
                                order.orderCode,
                                'delivered',
                                'Giao thành công: Khách hàng đã nhận máy và thanh toán hoàn tất.'
                              )
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-all"
                            title="Xác nhận giao thành công"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Đã giao</span>
                          </button>
                        )}

                        {/* Edit Button to open full modal */}
                        <button
                          onClick={() => handleOpenUpdateModal(order)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Tùy chỉnh chi tiết trạng thái và ghi chú"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Cập nhật đơn hàng: <span className="font-mono text-blue-700">{selectedOrder.orderCode}</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Khách hàng: <strong>{selectedOrder.customerName}</strong> ({selectedOrder.phone})
            </p>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              {/* Select Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Trạng thái vận đơn mới:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="pending">Chờ xác nhận (pending)</option>
                  <option value="confirmed">Đã xác nhận (confirmed)</option>
                  <option value="shipping">Đang vận chuyển (shipping)</option>
                  <option value="delivered">Giao hàng thành công (delivered)</option>
                  <option value="cancelled">Đã hủy đơn (cancelled)</option>
                </select>
              </div>

              {/* Tracking Info Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ghi chú tiến trình vận chuyển (Hiển thị cho khách & AI tra cứu):
                </label>
                <textarea
                  rows={3}
                  value={trackingNote}
                  onChange={(e) => setTrackingNote(e.target.value)}
                  placeholder="Ví dụ: Đã đóng gói và bàn giao bưu tá bưu cục Cầu Giấy, đang phát hàng tới người nhận."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-60"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
