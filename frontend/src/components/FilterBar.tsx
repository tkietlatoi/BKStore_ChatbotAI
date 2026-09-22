'use client';

import React from 'react';
import { Laptop, Smartphone, Headphones, LayoutGrid, ArrowUpDown, Filter } from 'lucide-react';
import { Category } from '@/types';

interface FilterBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  selectedPriceRange: string;
  onSelectPriceRange: (range: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  selectedSort: string;
  onSelectSort: (sort: string) => void;
  brands: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedPriceRange,
  onSelectPriceRange,
  selectedBrand,
  onSelectBrand,
  selectedSort,
  onSelectSort,
  brands,
}) => {
  const categoryTabs = [
    { id: 'all', label: 'Tất cả sản phẩm', icon: LayoutGrid },
    { id: 'laptop', label: 'Laptop & Máy tính', icon: Laptop },
    { id: 'smartphone', label: 'Điện thoại', icon: Smartphone },
    { id: 'accessory', label: 'Phụ kiện & Ngoại vi', icon: Headphones },
  ];

  const priceRanges = [
    { id: 'all', label: 'Tất cả mức giá' },
    { id: 'under-10', label: 'Dưới 10 triệu' },
    { id: '10-25', label: '10 - 25 triệu' },
    { id: '25-40', label: '25 - 40 triệu' },
    { id: 'above-40', label: 'Trên 40 triệu' },
  ];

  const sortOptions = [
    { id: 'newest', label: 'Mới nhất' },
    { id: 'price_asc', label: 'Giá: Thấp đến Cao' },
    { id: 'price_desc', label: 'Giá: Cao đến Thấp' },
  ];

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs mb-8">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-100 scrollbar-none">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Row: Price Range, Brand, Sort */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Price Range Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Khoảng giá:</span>
            <select
              value={selectedPriceRange}
              onChange={(e) => onSelectPriceRange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              {priceRanges.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-500 font-medium">Hãng:</span>
            <select
              value={selectedBrand}
              onChange={(e) => onSelectBrand(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">Tất cả thương hiệu</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Sắp xếp:</span>
          <select
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
          >
            {sortOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
