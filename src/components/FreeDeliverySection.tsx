import React from 'react';
import { Truck, Sparkles, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FreeDeliverySectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
  wishlistIds: Set<string>;
  onViewAllCategory: (categoryId: string) => void;
}

export const FreeDeliverySection: React.FC<FreeDeliverySectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  onViewAllCategory
}) => {
  return (
    <section className="max-w-6xl mx-auto px-3.5 sm:px-6 py-3">
      {/* Outer Sky Blue Styled Container matching the screenshot */}
      <div className="bg-[#42a5f5] rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm space-y-3">
        
        {/* Sky Blue Section Header Bar */}
        <div className="flex items-center justify-between text-white px-1">
          <div className="flex items-center space-x-2.5">
            {/* New Icon Box */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/25 backdrop-blur-xs rounded-xl flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-tight drop-shadow-xs">
              New
            </h2>
          </div>

          <button
            onClick={() => onViewAllCategory('all')}
            className="text-xs sm:text-sm font-bold bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Cards Grid inside the Free Delivery Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlistIds.has(product.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
