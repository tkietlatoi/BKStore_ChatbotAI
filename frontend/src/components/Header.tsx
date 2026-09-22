'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Truck, Phone, Sparkles, X, Shield } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  onOpenChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenTracking,
  onOpenChat,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [isCartJumping, setIsCartJumping] = useState(false);
  const prevItemsRef = useRef(totalItems);

  useEffect(() => {
    if (totalItems > prevItemsRef.current) {
      setIsCartJumping(true);
      const timer = setTimeout(() => setIsCartJumping(false), 550);
      prevItemsRef.current = totalItems;
      return () => clearTimeout(timer);
    }
    prevItemsRef.current = totalItems;
  }, [totalItems]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Ambient Ticker */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="truncate">
              🚀 Trợ lý ảo AI BK-Bot tư vấn cấu hình chuẩn 24/7 | Miễn phí giao hàng toàn quốc cho đơn từ 1.000.000₫
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6 font-mono text-[11px] text-slate-400">
            <a href="tel:18006868" className="hover:text-white flex items-center gap-1.5 transition-colors">
              <Phone className="w-3 h-3 text-blue-400" />
              <span>Hotline: 1800 6868</span>
            </a>
            <span className="text-slate-700">|</span>
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
              <span>BK-Bot AI Live</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            BK
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              BK-STORE
            </span>
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500">
              Smart Tech Commerce
            </span>
          </div>
        </a>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                if (e.target.value === '') onSearchChange('');
              }}
              placeholder="Tìm kiếm MacBook, iPhone, bàn phím cơ, chip M3, RTX 4060..."
              className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full pl-11 pr-10 py-2.5 border border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-3">
          

          {/* Order Tracking Button */}
          <button
            onClick={onOpenTracking}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 bg-slate-100/80 hover:bg-blue-50 rounded-xl transition-all"
            title="Tra cứu trạng thái đơn hàng"
          >
            <Truck className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Tra cứu đơn</span>
          </button>

          {/* Cart Button with Jumping Animation */}
          <button
            onClick={onOpenCart}
            className={`relative flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm shadow-blue-500/25 transition-all ${
              isCartJumping ? 'animate-cart-jump ring-4 ring-blue-400/40 shadow-blue-500/50' : ''
            }`}
          >
            <ShoppingBag className={`w-4 h-4 transition-transform ${isCartJumping ? 'scale-125 text-amber-300' : ''}`} />
            <span className="hidden sm:inline">Giỏ hàng</span>
            {totalItems > 0 && (
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold rounded-full transition-all ${
                  isCartJumping
                    ? 'scale-125 bg-amber-300 text-slate-950 font-black'
                    : 'bg-white text-blue-700'
                }`}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              if (e.target.value === '') onSearchChange('');
            }}
            placeholder="Tìm kiếm thiết bị công nghệ..."
            className="w-full bg-slate-100 text-sm text-slate-800 placeholder-slate-400 rounded-lg pl-10 pr-9 py-2 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>
    </header>
  );
};
