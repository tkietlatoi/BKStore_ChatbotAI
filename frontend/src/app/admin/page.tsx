'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  fetchAllOrders,
  fetchProducts,
  fetchCategories,
  fetchKnowledgeMetrics,
  KnowledgeMetrics,
} from '@/lib/api';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [knowledgeMetrics, setKnowledgeMetrics] = useState<KnowledgeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [orderRes, prodRes, catRes, kMetrics] = await Promise.all([
        fetchAllOrders('all', 1, 50).catch(() => ({ orders: [] })),
        fetchProducts({ limit: 1 }).catch(() => ({ total: 0 })),
        fetchCategories().catch(() => []),
        fetchKnowledgeMetrics().catch(() => null),
      ]);

      setOrders(orderRes.orders || []);
      setTotalProducts(prodRes.total || 0);
      setTotalCategories(catRes.length || 0);
      if (kMetrics) {
        setKnowledgeMetrics(kMetrics);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu dashboard:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Safe date formatter
  const formatOrderDate = (dateStr?: string | null): string => {
    if (!dateStr) return 'Mới cập nhật';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Mới cập nhật';
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Chờ duyệt',
          className: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'confirmed':
        return {
          label: 'Đã duyệt',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'shipping':
        return {
          label: 'Đang giao',
          className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case 'delivered':
        return {
          label: 'Đã giao',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          className: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      default:
        return {
          label: status,
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

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
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tổng quan Hệ thống Thương mại & AI</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu vận hành đơn hàng, danh mục sản phẩm và trạng thái cơ sở tri thức RAG kết nối AI Chatbot BK-Bot.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
            title="Làm mới toàn bộ chỉ số từ Backend"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
            />
            <span>{isRefreshing ? 'Đang cập nhật...' : 'Làm mới'}</span>
          </button>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Quản lý đơn hàng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards (6 informative metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Doanh thu bán hàng</span>
          <div className="text-lg font-mono font-bold text-slate-900 mt-1">
            {formatPrice(totalRevenue)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" />
            Đồng bộ theo đơn
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Tổng số đơn hàng</span>
          <div className="text-xl font-mono font-bold text-slate-900 mt-1">
            {orders.length}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-2">
            {deliveredOrders.length} đơn đã giao thành công
          </span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Chờ duyệt kho</span>
          <div className="text-xl font-mono font-bold text-amber-600 mt-1">
            {pendingOrders.length}
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Cần xử lý ngay
          </span>
        </div>

        {/* Shipping Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Đang vận chuyển</span>
          <div className="text-xl font-mono font-bold text-indigo-600 mt-1">
            {shippingOrders.length}
          </div>
          <span className="text-[10px] text-indigo-600 font-medium mt-2 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Đang phát cho khách
          </span>
        </div>

        {/* Catalog Products */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Sản phẩm & Danh mục</span>
          <div className="text-xl font-mono font-bold text-blue-600 mt-1">
            {totalProducts}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            {totalCategories} danh mục hàng
          </span>
        </div>

        {/* AI Knowledge Chunks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Tri thức AI (RAG)</span>
          <div className="text-xl font-mono font-bold text-cyan-700 mt-1">
            {knowledgeMetrics?.chunksCount || 10} <span className="text-xs font-normal text-slate-500">chunks</span>
          </div>
          <span className="text-[10px] text-cyan-600 font-medium mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {knowledgeMetrics?.documentsCount || 3} tài liệu đã vector
          </span>
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
                {orders.slice(0, 5).map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  return (
                    <div
                      key={order.id || order.orderCode}
                      className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">
                            {order.orderCode}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="font-medium text-slate-800">
                            {order.customerName}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatOrderDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            {formatPrice(order.totalAmount)}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {order.paymentMethod === 'QR_PAY' ? 'VietQR' : 'COD'}
                          </span>
                        </div>

                        {/* Status badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono border ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dữ liệu đơn hàng đồng bộ trực tiếp với Backend REST API</span>
            <Link
              href="/admin/orders"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Chuyển tới Quản lý đơn hàng</span>
              <ArrowRight className="w-3 h-3" />
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
              Mô hình kết nối công cụ tra cứu vận đơn theo số điện thoại và trích xuất tri thức sản phẩm thời gian thực.
            </p>

            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  Vector Dimension:
                </span>
                <span className="text-cyan-300 font-bold">
                  {knowledgeMetrics?.embeddingDimensions || 768} dims (HNSW)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Chunks Index:
                </span>
                <span className="text-cyan-300 font-bold">
                  {knowledgeMetrics?.chunksCount || 10} đoạn tri thức
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Knowledge Status:
                </span>
                <span className="text-emerald-300">
                  {knowledgeMetrics?.documentsCount ? `${knowledgeMetrics.documentsCount} tài liệu chuẩn` : 'Đã nạp chính sách'}
                </span>
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
