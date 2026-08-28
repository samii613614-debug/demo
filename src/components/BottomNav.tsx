import React from 'react';
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'category' | 'cart' | 'account';
  onChangeTab: (tab: 'home' | 'category' | 'cart' | 'account') => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  cartCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#c7ebfc] border-t border-sky-200 py-1.5 px-3 md:hidden shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home' 
              ? 'text-[#003893] font-bold' 
              : 'text-slate-700 hover:text-[#003893]'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">Home</span>
        </button>

        {/* Category */}
        <button
          onClick={() => onChangeTab('category')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'category' 
              ? 'text-[#003893] font-bold' 
              : 'text-slate-700 hover:text-[#003893]'
          }`}
          aria-label="Categories"
        >
          <LayoutGrid className={`w-5 h-5 ${activeTab === 'category' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">Category</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => onChangeTab('cart')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'cart' 
              ? 'text-[#003893] font-bold' 
              : 'text-slate-700 hover:text-[#003893]'
          }`}
          aria-label="Cart"
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 ${activeTab === 'cart' ? 'stroke-[2.5]' : ''}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#E31E24] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">Cart</span>
        </button>

        {/* Account */}
        <button
          onClick={() => onChangeTab('account')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'account' 
              ? 'text-[#003893] font-bold' 
              : 'text-slate-700 hover:text-[#003893]'
          }`}
          aria-label="Account"
        >
          <User className={`w-5 h-5 ${activeTab === 'account' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">Account</span>
        </button>

      </div>
    </nav>
  );
};
