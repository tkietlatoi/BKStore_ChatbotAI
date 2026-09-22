'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Truck,
  ArrowRight,
  CreditCard,
  Banknote,
  Bot,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { fetchAllOrders } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetchAllOrders('all', 1, 50)
      .then((res) => {
        if (!ignore) {
          setOrders(res.orders);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Compute KPI statistics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const shippingOrders = orders.filter((o) => o.status === 'shipping');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  const qrPayCount = orders.filter((o) => o.paymentMethod === 'QR_PAY').length;
  const codCount = orders.filter((o) => o.paymentMethod === 'COD').length;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tổng quan Hệ thống Thương mại & AI
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi doanh thu, trạng thái đơn hàng và hiệu năng mô hình AI Chatbot BK-Bot.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors self-start"
        >
          <span>Quản lý đơn hàng</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng doanh thu (ước tính)</span>
            <div className="text-xl font-mono font-bold text-slate-900 mt-1">
              {formatPrice(totalRevenue)}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Tự động cập nhật
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Tổng số đơn hàng</span>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-1">
              {orders.length}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              {deliveredOrders.length} đơn đã giao thành công
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Đơn chờ duyệt kho</span>
            <div className="text-2xl font-mono font-bold text-amber-600 mt-1">
              {pendingOrders.length}
            </div>
            <span className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Cần xử lý ngay
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Shipping Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Đang vận chuyển</span>
            <div className="text-2xl font-mono font-bold text-blue-600 mt-1">
              {shippingOrders.length}
            </div>
            <span className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Đang giao tới khách
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & AI System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col (8): Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Đơn hàng mới nhận gần đây</h3>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Chưa có đơn hàng nào trong hệ thống.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs mt-1">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{order.orderCode}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-slate-700">{order.customerName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">
                          {formatPrice(order.totalAmount)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {order.paymentMethod === 'QR_PAY' ? 'VietQR' : 'COD'}
                        </span>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono uppercase tracking-wider ${
                          order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'shipping'
                            ? 'bg-indigo-100 text-indigo-800'
                            : order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dữ liệu đơn hàng đồng bộ trực tiếp với Backend REST API</span>
            <Link
              href="/admin/orders"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Chuyển tới trang Quản lý đơn →
            </Link>
          </div>
        </div>

        {/* Right Col (4): Payment breakdown & AI RAG Status */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Payment breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Phương thức thanh toán
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Chuyển khoản VietQR:</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{qrPayCount} đơn</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Tiền mặt COD:</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{codCount} đơn</span>
              </div>
            </div>
          </div>

          {/* AI & Vector DB Status */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Bot className="w-4 h-4" />
                <span>Trợ lý BK-Bot & RAG</span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                READY
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Mô hình sẵn sàng kết nối công cụ tra cứu vận đơn thời gian thực và trích xuất tri thức sản phẩm.
            </p>

            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-300">
                  <Database className="w-3 h-3 text-cyan-400" />
                  Vector Dimension:
                </span>
                <span className="text-cyan-300 font-bold">768 dims (HNSW)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Knowledge Status:
                </span>
                <span className="text-emerald-300">Đã nạp chính sách</span>
              </div>
            </div>

            <Link
              href="/admin/knowledge"
              className="mt-2 block text-center py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 transition-colors"
            >
              Xem tài liệu tri thức RAG →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
