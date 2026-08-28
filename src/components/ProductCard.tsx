import React from 'react';
import { Heart, ShoppingBag, Eye, Star, Zap, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
  isWishlisted: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}) => {
  return (
    <div 
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#003893]/40 p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg cursor-pointer relative"
      id={`product-card-${product.id}`}
    >
      {/* Top badges & Wishlist Button */}
      <div className="relative w-full aspect-square bg-slate-50/70 rounded-xl overflow-hidden flex items-center justify-center p-2">
        {/* Discount Badge if available (Top Right) */}
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <div className="absolute top-1.5 right-1.5 z-10 bg-[#34A853] text-white text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-md shadow-xs">
            {product.discountPercentage}% OFF
          </div>
        ) : product.badge ? (
          <div className="absolute top-1.5 right-1.5 z-10 bg-[#003893] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs">
            {product.badge}
          </div>
        ) : null}

        {/* Wishlist Heart Button (Top Left) */}
        <button
          onClick={(e) => onToggleWishlist(product, e)}
          className={`absolute top-1.5 left-1.5 z-10 p-1.5 rounded-full transition-all cursor-pointer backdrop-blur-xs ${
            isWishlisted 
              ? 'bg-rose-50 text-[#E31E24]' 
              : 'bg-white/80 text-slate-400 hover:text-[#E31E24] hover:bg-white'
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#E31E24]' : ''}`} />
        </button>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Quick View overlay on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/90 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-[#003893]" />
            Quick View
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-2.5 flex-1 flex flex-col justify-between space-y-2">
        {/* Brand and Title */}
        <div className="space-y-1">
          {product.brand && (
            <div className="flex items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#003893] bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded">
                {product.brand}
              </span>
            </div>
          )}
          <h3 
            className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#003893] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Cart Button in Yellow Bar (Exact visual copy from screenshot) */}
        <div className="pt-1">
          <div className="bg-[#FFBE18] hover:bg-[#ffb300] text-slate-950 rounded-lg sm:rounded-xl p-1.5 sm:p-2 flex items-center justify-between gap-1 shadow-2xs transition-colors">
            
            {/* Price values with BDT symbol ৳ */}
            <div className="flex items-center space-x-1.5 overflow-hidden pl-1">
              {product.originalPrice && product.originalPrice > product.price ? (
                <div className="flex items-baseline space-x-1 sm:space-x-1.5">
                  <span className="text-[11px] sm:text-xs text-red-700 line-through font-semibold font-['Hind_Siliguri',sans-serif]">
                    ৳{product.originalPrice.toLocaleString('en-BD')}
                  </span>
                  <span className="text-xs sm:text-sm md:text-base font-black text-slate-950 font-['Hind_Siliguri',sans-serif] tracking-tight">
                    ৳{product.price.toLocaleString('en-BD')}
                  </span>
                </div>
              ) : (
                <span className="text-xs sm:text-sm md:text-base font-black text-slate-950 font-['Hind_Siliguri',sans-serif] tracking-tight">
                  ৳{product.price.toLocaleString('en-BD')}
                </span>
              )}
            </div>

            {/* Quick Add To Cart Button */}
            <button
              onClick={(e) => onAddToCart(product, e)}
              className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white p-1.5 sm:p-2 rounded-md sm:rounded-lg shadow-xs transition-transform cursor-pointer shrink-0"
              title="Add to Cart"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
