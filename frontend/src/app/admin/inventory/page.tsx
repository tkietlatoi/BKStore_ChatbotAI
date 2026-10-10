'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Store,
  RefreshCw,
  Search,
  ArrowLeftRight,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
  Layers,
  MapPin,
  TrendingDown,
  X,
  Package,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import {
  fetchInventoryOverview,
  updateInventoryStock,
  transferInventoryStock,
} from '@/lib/api';
import {
  InventoryOverviewData,
  ProductInventoryItem,
  Branch,
  BranchStockDetail,
} from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminInventoryPage() {
  const [data, setData] = useState<InventoryOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [adjustModalItem, setAdjustModalItem] = useState<ProductInventoryItem | null>(null);
  const [adjustBranchQuantities, setAdjustBranchQuantities] = useState<Record<string, number>>({});
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  const [transferModalItem, setTransferModalItem] = useState<ProductInventoryItem | null>(null);
  const [transferFromBranch, setTransferFromBranch] = useState<string>('');
  const [transferToBranch, setTransferToBranch] = useState<string>('');
  const [transferQuantity, setTransferQuantity] = useState<number>(1);
  const [transferNote, setTransferNote] = useState<string>('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadInventory = useCallback(async () => {
    try {
      const res = await fetchInventoryOverview();
      setData(res);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu tồn kho:', err);
      showToast('error', 'Không thể kết nối đến hệ thống kho.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadInventory();
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    if (!data || !data.items) return [];

    return data.items.filter((item) => {
      // Branch filter
      if (selectedBranch !== 'all') {
        const branchStock = item.branchesStock.find((b) => b.branchId === selectedBranch);
        if (!branchStock) return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && item.stockStatus !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.productName.toLowerCase().includes(q);
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchCategory = item.categoryName.toLowerCase().includes(q);
        const matchSlug = item.productSlug.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCategory && !matchSlug) return false;
      }

      return true;
    });
  }, [data, selectedBranch, selectedStatus, searchQuery]);

  // Handle open adjust modal
  const openAdjustModal = (item: ProductInventoryItem) => {
    setAdjustModalItem(item);
    const initialQuantities: Record<string, number> = {};
    item.branchesStock.forEach((b) => {
      initialQuantities[b.branchId] = b.quantity;
    });
    setAdjustBranchQuantities(initialQuantities);
  };

  // Submit adjust
  const handleSaveAdjust = async () => {
    if (!adjustModalItem) return;
    setIsSubmittingAdjust(true);

    try {
      // Update each modified branch
      for (const branch of adjustModalItem.branchesStock) {
        const newQty = adjustBranchQuantities[branch.branchId];
        if (newQty !== undefined && newQty !== branch.quantity) {
          await updateInventoryStock({
            productId: adjustModalItem.productId,
            branchId: branch.branchId,
            quantity: Number(newQty),
          });
        }
      }

      showToast('success', `Đã cập nhật số lượng kho cho sản phẩm ${adjustModalItem.productName}!`);
      setAdjustModalItem(null);
      await loadInventory();
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi cập nhật tồn kho.');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  // Handle open transfer modal
  const openTransferModal = (item: ProductInventoryItem) => {
    setTransferModalItem(item);
    if (item.branchesStock.length >= 2) {
      // Find branch with highest stock to set as default 'from'
      const sorted = [...item.branchesStock].sort((a, b) => b.quantity - a.quantity);
      setTransferFromBranch(sorted[0].branchId);
      const other = sorted.find((b) => b.branchId !== sorted[0].branchId);
      setTransferToBranch(other ? other.branchId : '');
    }
    setTransferQuantity(1);
    setTransferNote('Điều chuyển cân đối tồn kho showroom');
  };

  // Submit transfer
  const handleSaveTransfer = async () => {
    if (!transferModalItem) return;

    if (!transferFromBranch || !transferToBranch) {
      showToast('error', 'Vui lòng chọn cả kho xuất và kho nhận.');
      return;
    }

    if (transferFromBranch === transferToBranch) {
      showToast('error', 'Kho xuất và kho nhận không được trùng nhau.');
      return;
    }

    const fromBranchStock = transferModalItem.branchesStock.find(
      (b) => b.branchId === transferFromBranch
    );
    const currentStock = fromBranchStock?.quantity || 0;

    if (transferQuantity <= 0 || transferQuantity > currentStock) {
      showToast(
        'error',
        `Số lượng chuyển không hợp lệ (Kho xuất hiện chỉ có ${currentStock} máy).`
      );
      return;
    }

    setIsSubmittingTransfer(true);

    try {
      const res = await transferInventoryStock({
        productId: transferModalItem.productId,
        fromBranchId: transferFromBranch,
        toBranchId: transferToBranch,
        quantity: Number(transferQuantity),
        note: transferNote,
      });

      if (res.success) {
        showToast('success', res.message || 'Chuyển kho thành công!');
        setTransferModalItem(null);
        await loadInventory();
      } else {
        showToast('error', res.error || 'Lỗi chuyển kho.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi chuyển kho.');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const getBranchStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-500" />
          Hết hàng (0)
        </span>
      );
    }
    if (quantity <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          Sắp hết ({quantity})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        Còn {quantity} máy
      </span>
    );
  };

  const branchesList = data?.branches || [];
  const summary = data?.summary || {
    totalStockUnits: 0,
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    branchSummaries: [],
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold text-white animate-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 shadow-emerald-500/20'
              : 'bg-rose-600 shadow-rose-500/20'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Quản lý Kho & Tồn kho Chi nhánh
              </h1>
              <p className="text-xs text-slate-500">
                Phân bổ, kiểm kê và điều chuyển hàng hóa thực tế giữa 3 showroom Hà Nội, TP.HCM và Đà Nẵng
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors disabled:opacity-60"
            title="Làm mới dữ liệu từ hệ thống"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Đang đồng bộ...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (4 global metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Tổng thiết bị toàn hệ thống</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-2">
            {isLoading ? '...' : summary.totalStockUnits}{' '}
            <span className="text-xs font-normal text-slate-500">máy</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            Đồng bộ theo 3 tổng kho thực tế
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Mã sản phẩm quản lý</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-indigo-600 mt-2">
            {isLoading ? '...' : summary.totalProducts}{' '}
            <span className="text-xs font-normal text-slate-500">SKUs</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            Laptop, Smartphone & Phụ kiện
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Cảnh báo sắp hết hàng</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-600 mt-2">
            {isLoading ? '...' : summary.lowStockCount}{' '}
            <span className="text-xs font-normal text-slate-500">máy</span>
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Tồn kho toàn hệ thống ≤ 5
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Cảnh báo hết hàng</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-600 mt-2">
            {isLoading ? '...' : summary.outOfStockCount}{' '}
            <span className="text-xs font-normal text-slate-500">máy</span>
          </div>
          <span className="text-[10px] text-rose-600 font-medium mt-1">
            Cần lên đơn nhập kho ngay
          </span>
        </div>
      </div>

      {/* 3 Showroom Branch Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branchesList.map((branch) => {
          const bSum = summary.branchSummaries?.find((s) => s.branchId === branch.id);
          const isSelected = selectedBranch === branch.id;

          return (
            <div
              key={branch.id}
              onClick={() => setSelectedBranch(isSelected ? 'all' : branch.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Store className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                    <h3 className="text-xs font-bold text-slate-900">{branch.name}</h3>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                    {branch.city}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{branch.address}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Tồn kho chi nhánh</span>
                  <span className="font-mono font-extrabold text-slate-900 text-base">
                    {bSum?.totalUnits ?? 0} <span className="text-xs font-normal text-slate-500">máy</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (bSum?.lowStockCount ?? 0) > 0
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {bSum?.lowStockCount ?? 0} sắp hết
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (bSum?.outOfStockCount ?? 0) > 0
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {bSum?.outOfStockCount ?? 0} hết
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Branch Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => setSelectedBranch('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedBranch === 'all'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả chi nhánh
            </button>
            {branchesList.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedBranch === b.id
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b.name.split(' (')[0].replace('BK-Store ', '')} ({b.city})
              </button>
            ))}
          </div>

          {/* Right Status Filter & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="in_stock">Còn hàng dồi dào (&gt; 5)</option>
              <option value="low_stock">Cảnh báo sắp hết (1 - 5)</option>
              <option value="out_of_stock">Đã hết hàng (0)</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên máy, thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
          <span>
            Đang hiển thị <strong className="text-slate-700">{filteredItems.length}</strong> / {data?.items.length || 0} sản phẩm
          </span>
          {selectedBranch !== 'all' && (
            <button
              onClick={() => setSelectedBranch('all')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Xóa bộ lọc chi nhánh
            </button>
          )}
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Đang tải dữ liệu tồn kho 3 chi nhánh...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy sản phẩm nào</p>
            <p className="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[280px]">Sản phẩm</th>
                  <th className="py-3 px-3 text-center min-w-[120px]">Tổng tồn kho</th>
                  {branchesList.map((branch) => (
                    <th key={branch.id} className="py-3 px-3 min-w-[160px]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{branch.name.split(' (')[0].replace('BK-Store ', '')}</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-200 text-slate-600 rounded">
                          {branch.city}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right min-w-[150px]">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  return (
                    <tr
                      key={item.productId}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Product Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.thumbnail}
                            alt={item.productName}
                            className="w-11 h-11 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-100 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider">
                                {item.brand}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] text-slate-400 truncate">
                                {item.categoryName}
                              </span>
                            </div>
                            <h4
                              className="font-bold text-slate-900 truncate max-w-[240px] text-xs mt-0.5"
                              title={item.productName}
                            >
                              {item.productName}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-slate-600 text-[11px] font-semibold">
                                {formatPrice(item.price)}
                              </span>
                              <Link
                                href={`/products/${item.productSlug}`}
                                target="_blank"
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                title="Xem trên storefront"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Stock */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-extrabold text-sm ${
                              item.totalStock === 0
                                ? 'text-rose-600'
                                : item.totalStock <= 5
                                ? 'text-amber-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {item.totalStock}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">máy</span>
                        </div>
                      </td>

                      {/* Branch stock columns */}
                      {branchesList.map((branch) => {
                        const bStock = item.branchesStock.find(
                          (bs) => bs.branchId === branch.id
                        );
                        const qty = bStock?.quantity || 0;

                        return (
                          <td key={branch.id} className="py-3 px-3">
                            <div className="flex flex-col gap-0.5">
                              {getBranchStockBadge(qty)}
                              {bStock?.updatedAt && (
                                <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                  {new Date(bStock.updatedAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAdjustModal(item)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                            title="Chỉnh sửa số lượng kho"
                          >
                            <Pencil className="w-3.5 h-3.5 text-blue-500" />
                            <span className="hidden sm:inline">Chỉnh kho</span>
                          </button>
                          <button
                            onClick={() => openTransferModal(item)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                            title="Điều chuyển hàng sang showroom khác"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="hidden sm:inline">Chuyển kho</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADJUST BRANCH QUANTITY */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Điều chỉnh tồn kho sản phẩm
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Cập nhật số lượng kiểm kê thực tế theo từng showroom
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdjustModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Product preview */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={adjustModalItem.thumbnail}
                  alt={adjustModalItem.productName}
                  className="w-12 h-12 object-cover rounded-lg bg-white border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-blue-600 uppercase">
                    {adjustModalItem.brand}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {adjustModalItem.productName}
                  </h4>
                  <p className="text-xs font-mono text-slate-600">
                    {formatPrice(adjustModalItem.price)}
                  </p>
                </div>
              </div>

              {/* Branch inputs */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Số lượng máy tại từng chi nhánh:
                </label>
                {branchesList.map((branch) => {
                  const currentQty =
                    adjustModalItem.branchesStock.find((b) => b.branchId === branch.id)
                      ?.quantity || 0;
                  const newQty = adjustBranchQuantities[branch.id] ?? currentQty;
                  const diff = newQty - currentQty;

                  return (
                    <div
                      key={branch.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-800 truncate">
                          {branch.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {branch.address}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {diff !== 0 && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              diff > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        )}
                        <input
                          type="number"
                          min="0"
                          value={newQty}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                            setAdjustBranchQuantities((prev) => ({
                              ...prev,
                              [branch.id]: val,
                            }));
                          }}
                          className="w-20 px-2.5 py-1.5 text-right font-mono font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary note */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-800 flex items-center justify-between">
                <span>Tổng tồn kho mới dự kiến:</span>
                <span className="font-mono font-extrabold text-sm">
                  {Object.values(adjustBranchQuantities).reduce((a, b) => a + b, 0)} máy
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustModalItem(null)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveAdjust}
                disabled={isSubmittingAdjust}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                {isSubmittingAdjust && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isSubmittingAdjust ? 'Đang lưu...' : 'Lưu cập nhật kho'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INTER-BRANCH STOCK TRANSFER */}
      {transferModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Điều chuyển hàng liên chi nhánh
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Chuyển thiết bị từ showroom này sang showroom khác
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTransferModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Product preview */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={transferModalItem.thumbnail}
                  alt={transferModalItem.productName}
                  className="w-12 h-12 object-cover rounded-lg bg-white border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-blue-600 uppercase">
                    {transferModalItem.brand}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {transferModalItem.productName}
                  </h4>
                  <p className="text-xs font-mono text-slate-600">
                    Tổng tồn toàn hệ thống: {transferModalItem.totalStock} máy
                  </p>
                </div>
              </div>

              {/* Transfer Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* From branch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kho xuất hàng (From):
                  </label>
                  <select
                    value={transferFromBranch}
                    onChange={(e) => setTransferFromBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {branchesList.map((b) => {
                      const qty =
                        transferModalItem.branchesStock.find((bs) => bs.branchId === b.id)
                          ?.quantity || 0;
                      return (
                        <option key={b.id} value={b.id}>
                          {b.name.split(' (')[0].replace('BK-Store ', '')} ({qty} máy có sẵn)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* To branch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Kho nhận hàng (To):
                  </label>
                  <select
                    value={transferToBranch}
                    onChange={(e) => setTransferToBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {branchesList
                      .filter((b) => b.id !== transferFromBranch)
                      .map((b) => {
                        const qty =
                          transferModalItem.branchesStock.find((bs) => bs.branchId === b.id)
                            ?.quantity || 0;
                        return (
                          <option key={b.id} value={b.id}>
                            {b.name.split(' (')[0].replace('BK-Store ', '')} (hiện có {qty})
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              {/* Quantity input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-700">Số lượng máy chuyển:</label>
                  <span className="text-slate-500 text-[11px]">
                    Tối đa:{' '}
                    <strong>
                      {transferModalItem.branchesStock.find(
                        (b) => b.branchId === transferFromBranch
                      )?.quantity || 0}
                    </strong>{' '}
                    máy
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={
                    transferModalItem.branchesStock.find(
                      (b) => b.branchId === transferFromBranch
                    )?.quantity || 1
                  }
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 font-mono font-bold text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Lý do / Ghi chú điều chuyển:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bổ sung showroom Cầu Giấy đang sắp hết hàng"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTransferModalItem(null)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveTransfer}
                disabled={isSubmittingTransfer}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                {isSubmittingTransfer && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isSubmittingTransfer ? 'Đang chuyển...' : 'Xác nhận chuyển kho'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
