import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  // Calculate discount based on coupon
  let discount = 0;
  if (appliedCoupon === 'WALTON10') {
    discount = Math.round(subtotal * 0.10);
  } else if (appliedCoupon === 'PLAZAFREE') {
    discount = 500;
  }

  const deliveryFee = 0; // 100% Free delivery promo
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const success = onApplyCoupon(couponInput.trim().toUpperCase());
    if (!success) {
      setCouponError('Invalid coupon code. Try WALTON10 or PLAZAFREE.');
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl bg-white sm:rounded-2xl md:rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="bg-[#003893] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Back button for mobile/tablet */}
            <button
              onClick={onClose}
              aria-label="Back"
              className="flex lg:hidden p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <ShoppingBag className="w-5 h-5 text-amber-300 hidden sm:block" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">My Shopping Cart</h3>
              <p className="text-xs text-sky-200">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</p>
            </div>
          </div>
          {/* Cross button on laptop */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="hidden lg:flex p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

          {/* Cart Items List */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-sky-50 text-[#003893] mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">Your Cart is Empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore DEMO COMPANY refrigerators, air conditioners, TVs, and gadgets with Free Delivery.
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 bg-[#003893] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#002663] cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* NEW Item Banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-800">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    100% Free Delivery Applied!
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded">
                    FREE
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3 pt-2">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-3 py-2">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-contain rounded-lg bg-slate-50 border border-slate-200 p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                            {item.product.name}
                          </h5>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.selectedColor && (
                          <p className="text-[10px] text-slate-500 mt-0.5">Color: {item.selectedColor}</p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs sm:text-sm font-black text-[#003893] font-['Hind_Siliguri',sans-serif]">
                            ৳ {(item.product.price * item.quantity).toLocaleString('en-BD')}
                          </span>

                          <div className="flex items-center border border-slate-200 rounded-md bg-white">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                              className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cart Footer / Checkout Area */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* Coupon Section */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Coupon <strong className="font-mono">{appliedCoupon}</strong> Applied!</span>
                  </div>
                  <button 
                    type="button"
                    onClick={onRemoveCoupon} 
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer ml-2 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCouponSubmit} className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon (e.g. WALTON10)"
                        className="w-full pl-8 pr-3 py-1.5 text-xs uppercase bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#003893]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#003893] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#002663] cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-600 pl-1">{couponError}</p>}
                </form>
              )}

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 font-['Hind_Siliguri',sans-serif]">
                    ৳ {subtotal.toLocaleString('en-BD')}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span className="font-['Hind_Siliguri',sans-serif]">- ৳ {discount.toLocaleString('en-BD')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between text-sm sm:text-base font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-[#003893] font-['Hind_Siliguri',sans-serif]">
                    ৳ {total.toLocaleString('en-BD')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-[#E31E24] hover:bg-[#c71016] text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-all active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

      </div>
    </div>
  );
};
