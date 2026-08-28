import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Star, 
  Check, 
  Share2,
  ArrowLeft
} from 'lucide-react';
import { Product, LocationInfo } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  location: LocationInfo;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'warranty' | 'reviews'>('specs');
  const [copiedShare, setCopiedShare] = useState(false);

  // Set initial image and color when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const images = [product.image, ...(product.additionalImages || [])].filter((v, i, a) => a.indexOf(v) === i);

  const handleShare = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }
    } catch {
      // ignore clipboard permission error
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
        
        {/* Modal Top Bar */}
        <div className="bg-white border-b border-slate-100 px-3.5 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Back button on mobile/tablet */}
            <button
              onClick={onClose}
              aria-label="Back"
              className="flex lg:hidden p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {product.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono text-slate-600">Model: {product.modelNumber}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-[#003893] hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
              title="Share product link"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                isWishlisted ? 'text-[#E31E24] bg-rose-50' : 'text-slate-500 hover:text-[#E31E24] hover:bg-slate-100'
              }`}
              title="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#E31E24]' : ''}`} />
            </button>
            {/* Cross button on laptop only */}
            <button
              onClick={onClose}
              className="hidden lg:flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left: Product Images (5 cols) */}
            <div className="md:col-span-5 flex flex-col space-y-3">
              <div className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-center overflow-hidden">
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <div className="absolute top-3 right-3 bg-[#34A853] text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs">
                    {product.discountPercentage}% OFF
                  </div>
                )}
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-14 h-14 rounded-xl border p-1 bg-slate-50 overflow-hidden cursor-pointer transition-all ${
                        selectedImage === img ? 'border-[#003893] ring-2 ring-[#003893]/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details & Purchase Options (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Brand & Category pill */}
                <div className="flex items-center space-x-2">
                  {product.brand && (
                    <span className="text-xs font-black uppercase tracking-wider text-[#003893] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                      {product.brand}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-500">
                    {product.category}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-snug font-['Hind_Siliguri',sans-serif]">
                  {product.name}
                </h1>

                {/* Rating & Review Badge */}
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-slate-500">({product.reviewsCount} Customer Reviews)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    In Stock
                  </span>
                </div>

                {/* Price Display */}
                <div className="bg-[#FFF9E6] border border-[#FFE082] rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-600">DEMO COMPANY Special Price</span>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-slate-950 font-['Hind_Siliguri',sans-serif]">
                        ৳ {product.price.toLocaleString('en-BD')}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm sm:text-base text-red-600 line-through font-semibold font-['Hind_Siliguri',sans-serif]">
                          ৳ {product.originalPrice.toLocaleString('en-BD')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 0% EMI tag */}
                  {product.emiAvailable && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">EMI Starting At</span>
                      <span className="text-sm font-extrabold text-[#003893] font-['Hind_Siliguri',sans-serif]">
                        ৳ {product.emiStartPrice ? product.emiStartPrice.toLocaleString('en-BD') : Math.round(product.price / 12).toLocaleString('en-BD')}/mo
                      </span>
                    </div>
                  )}
                </div>

                {/* Color Selection if available */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Available Color: <span className="text-[#003893] normal-case">{selectedColor}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            selectedColor === color
                              ? 'border-[#003893] bg-sky-50 text-[#003893] ring-1 ring-[#003893]'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center space-x-3 pt-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs sm:text-sm font-bold text-slate-900 min-w-[28px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Button: Add to Cart */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onAddToCart(product, quantity, selectedColor);
                      onClose();
                    }}
                    className="w-full bg-[#003893] hover:bg-[#002663] text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2.5 shadow-md hover:shadow-lg cursor-pointer active:scale-98 transition-all"
                  >
                    <ShoppingBag className="w-5 h-5 text-amber-300" />
                    <span>Add to Cart</span>
                  </button>
                </div>

                {/* Tabs for Specs, Warranty, Reviews */}
                <div className="pt-3">
                  <div className="flex border-b border-slate-200 text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('specs')}
                      className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'specs' ? 'border-[#003893] text-[#003893]' : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Specifications
                    </button>
                    <button
                      onClick={() => setActiveTab('warranty')}
                      className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'warranty' ? 'border-[#003893] text-[#003893]' : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Warranty & Service
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'reviews' ? 'border-[#003893] text-[#003893]' : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Reviews ({product.reviewsCount})
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="pt-3 text-xs">
                    
                    {/* Specs Tab */}
                    {activeTab === 'specs' && (
                      <div className="space-y-2">
                        <p className="text-slate-600 text-xs leading-relaxed mb-3">{product.description}</p>
                        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                          {Object.entries(product.specs).map(([key, val]) => (
                            <div key={key} className="grid grid-cols-3 p-2 bg-white even:bg-slate-50/50">
                              <span className="font-semibold text-slate-700">{key}</span>
                              <span className="col-span-2 text-slate-900">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warranty Tab */}
                    {activeTab === 'warranty' && (
                      <div className="space-y-2 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 text-slate-800">
                        <div className="flex items-center space-x-2 font-bold text-emerald-900">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          <span>{product.warranty || 'Official Brand Warranty'}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 pt-1">
                          <li>Free home service visit for installation & diagnostics.</li>
                          <li>100% Genuine spare parts support from 80+ Service Points nationwide.</li>
                          <li>Digital Warranty card linked directly to your DEMO COMPANY mobile number.</li>
                          <li>7 Days easy replacement guarantee for manufacturing defects.</li>
                        </ul>
                      </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                          <div className="text-center pr-3 border-r border-slate-200">
                            <span className="text-2xl font-black text-slate-900">{product.rating}</span>
                            <div className="flex text-amber-400 text-xs justify-center mt-0.5">
                              {'★'.repeat(5)}
                            </div>
                          </div>
                          <div className="text-xs text-slate-600">
                            <p className="font-semibold text-slate-900">98% of buyers recommend this product</p>
                            <p className="text-[11px] text-slate-500">Verified purchases from DEMO COMPANY Bangladesh</p>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          <div className="border-b border-slate-100 pb-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">AR Sami</span>
                              <span className="text-[10px] text-slate-400">2 days ago</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5">Great build quality and very fast delivery by the local DEMO COMPANY team! Highly satisfied.</p>
                          </div>
                          <div className="border-b border-slate-100 pb-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">Shamsul Huda</span>
                              <span className="text-[10px] text-slate-400">1 week ago</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5">Dual inverter cooling is superb, low electricity consumption. 10/10 recommended.</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
