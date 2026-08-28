import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  User, 
  Search, 
  MapPin, 
  ChevronDown, 
  X,
  PhoneCall,
  Menu,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { LocationInfo, Product } from '../types';

interface HeaderProps {
  location: LocationInfo;
  onOpenLocationModal: () => void;
  onOpenOffersModal?: () => void;
  onOpenAccountModal: () => void;
  onOpenCartDrawer: () => void;
  onOpenWishlistModal: () => void;
  cartCount: number;
  wishlistCount: number;
  user: { name: string; isLoggedIn: boolean } | null;
  onSearch: (query: string) => void;
  searchQuery: string;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  location,
  onOpenLocationModal,
  onOpenOffersModal,
  onOpenAccountModal,
  onOpenCartDrawer,
  onOpenWishlistModal,
  cartCount,
  wishlistCount,
  user,
  onSearch,
  searchQuery,
  allProducts,
  onSelectProduct,
  activeCategory,
  onSelectCategory
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
    setShowSuggestions(false);
  };

  const filteredSuggestions = localSearch.trim() === '' 
    ? [] 
    : allProducts
        .filter(p => p.name.toLowerCase().includes(localSearch.toLowerCase()) || 
                     p.category.toLowerCase().includes(localSearch.toLowerCase()) ||
                     p.modelNumber.toLowerCase().includes(localSearch.toLowerCase()))
        .slice(0, 5);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-100 font-sans">
      {/* Top micro bar for helpline on all screens */}
      <div className="bg-[#002663] text-white text-[11px] sm:text-xs py-1 px-3 sm:px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5 text-sky-200">
            <PhoneCall className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Hotline (10 AM to 8 PM): <strong>12345</strong> or <strong>123456789</strong></span>
          </span>
        </div>
      </div>

      {/* Main App Header */}
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 py-2.5 sm:py-3">
        {/* Top Logo and Action Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <button 
            onClick={() => {
              onSelectCategory('all');
              onSearch('');
            }}
            className="flex items-center text-left cursor-pointer select-none group focus:outline-none shrink-0"
            aria-label="DEMO COMPANY Home"
          >
            <div className="flex items-center tracking-tight text-xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
              <span className="text-[#003893] group-hover:text-[#002663] transition-colors tracking-tighter">DEMO</span>
              <span className="text-[#E31E24] ml-1 tracking-wider font-black">COMPANY</span>
            </div>
          </button>

          {/* Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* Wishlist Icon */}
            <button 
              onClick={onOpenWishlistModal}
              className="relative p-1.5 sm:p-2 text-slate-700 hover:text-[#003893] hover:bg-sky-50 rounded-full transition-colors cursor-pointer"
              title="Wishlist"
              aria-label="View Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-[16px] bg-[#E31E24] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Separator */}
            <span className="text-slate-300 text-xs sm:text-sm">|</span>

            {/* Cart Icon */}
            <button 
              onClick={onOpenCartDrawer}
              className="relative p-1.5 sm:p-2 text-slate-700 hover:text-[#003893] hover:bg-sky-50 rounded-full transition-colors cursor-pointer"
              title="Shopping Cart"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-[16px] bg-[#E31E24] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Separator */}
            <span className="text-slate-300 text-xs sm:text-sm">|</span>

            {/* Profile Icon (Login text removed as requested) */}
            <button 
              onClick={onOpenAccountModal}
              className="relative p-1.5 sm:p-2 text-slate-700 hover:text-[#003893] hover:bg-sky-50 rounded-full transition-colors cursor-pointer"
              aria-label="User Account"
              title={user?.isLoggedIn ? user.name : 'Account'}
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
              {user?.isLoggedIn && (
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar matching the exact screenshot rounded input + navy button */}
        <div ref={searchContainerRef} className="relative mt-2.5">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="relative flex-1 flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalSearch(val);
                  onSearch(val);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setShowSuggestions(true);
                }}
                placeholder="Search Your Product Here..."
                className="w-full pl-10 pr-10 py-2.5 text-sm sm:text-base bg-white border border-slate-300 rounded-l-lg sm:rounded-l-xl focus:border-[#003893] focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 placeholder-slate-400 transition-all shadow-2xs"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    onSearch('');
                  }}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <button
              type="submit"
              className="bg-[#0e2752] hover:bg-[#001c47] text-white font-medium text-sm sm:text-base px-5 sm:px-7 py-2.5 rounded-r-lg sm:rounded-r-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-xs active:scale-[0.98]"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && localSearch.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
              {filteredSuggestions.length > 0 ? (
                <>
                  <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    Matching Products
                  </div>
                  {filteredSuggestions.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        setShowSuggestions(false);
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={prod.image} alt={prod.name} className="w-10 h-10 object-contain rounded bg-slate-100 p-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">{prod.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">Model: {prod.modelNumber}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#003893] whitespace-nowrap">
                        ৳ {prod.price.toLocaleString('en-BD')}
                      </span>
                    </div>
                  ))}
                  <div 
                    onClick={handleSearchSubmit}
                    className="p-2.5 bg-sky-50 text-center text-xs font-bold text-[#003893] hover:bg-sky-100 cursor-pointer border-t border-sky-100"
                  >
                    View all matching results for "{localSearch}"
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-slate-600 space-y-1">
                  <p className="font-bold text-sm text-slate-800">No Product Found</p>
                  <p className="text-xs text-slate-500">We couldn't find any products matching "{localSearch}".</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
