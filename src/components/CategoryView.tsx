import React, { useState } from 'react';
import { Category, Product, SortOption } from '../types';
import { ProductCard } from './ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';

interface CategoryViewProps {
  categories: Category[];
  products: Product[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
  wishlistIds: Set<string>;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  categories,
  products,
  selectedCategoryId,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistIds
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under10k' | '10k-30k' | 'above30k'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Extract available brands
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Filter products
  let filtered = products.filter(p => {
    if (selectedCategoryId !== 'all' && p.categoryId !== selectedCategoryId) return false;
    if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
    if (onlyInStock && !p.inStock) return false;
    if (priceFilter === 'under10k' && p.price >= 10000) return false;
    if (priceFilter === '10k-30k' && (p.price < 10000 || p.price > 30000)) return false;
    if (priceFilter === 'above30k' && p.price <= 30000) return false;
    return true;
  });

  // Sort products
  filtered.sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  const currentCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-4 space-y-4">
      {/* Category header & Filter controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {currentCategory ? currentCategory.name : 'All Products'}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filtered.length} products {selectedBrand !== 'all' ? `(${selectedBrand})` : ''}
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#003893] cursor-pointer"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quick Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-[#003893] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-[#003893] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Brand Selector Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 border-t border-slate-100 scrollbar-none text-xs">
          <span className="font-bold text-slate-600 shrink-0 mr-1">Brand:</span>
          <button
            onClick={() => setSelectedBrand('all')}
            className={`px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap transition-colors ${
              selectedBrand === 'all' ? 'bg-[#003893] text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Brands
          </button>
          {availableBrands.map((brandName) => (
            <button
              key={brandName}
              onClick={() => setSelectedBrand(brandName)}
              className={`px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                selectedBrand === brandName
                  ? 'bg-[#003893] text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {brandName}
            </button>
          ))}
        </div>

        {/* Price & In-stock Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-600">Price:</span>
          <button
            onClick={() => setPriceFilter('all')}
            className={`px-2.5 py-1 rounded-md cursor-pointer ${
              priceFilter === 'all' ? 'bg-sky-100 text-[#003893] font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPriceFilter('under10k')}
            className={`px-2.5 py-1 rounded-md cursor-pointer ${
              priceFilter === 'under10k' ? 'bg-sky-100 text-[#003893] font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Under ৳ 10,000
          </button>
          <button
            onClick={() => setPriceFilter('10k-30k')}
            className={`px-2.5 py-1 rounded-md cursor-pointer ${
              priceFilter === '10k-30k' ? 'bg-sky-100 text-[#003893] font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ৳ 10,000 - ৳ 30,000
          </button>
          <button
            onClick={() => setPriceFilter('above30k')}
            className={`px-2.5 py-1 rounded-md cursor-pointer ${
              priceFilter === 'above30k' ? 'bg-sky-100 text-[#003893] font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Above ৳ 30,000
          </button>

          <label className="ml-auto flex items-center space-x-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-[#003893] focus:ring-0 cursor-pointer"
            />
            <span className="font-semibold text-slate-700">In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <p className="font-extrabold text-base text-slate-800">No Product Found</p>
          <p className="text-xs text-slate-500">Try changing the filters or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlistIds.has(prod.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
