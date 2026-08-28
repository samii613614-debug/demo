import React, { useState } from 'react';
import { X, CheckCircle2, Truck, ShieldCheck, MapPin, Sparkles, ArrowRight, Package, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, LocationInfo, Order } from '../types';
import { BKashLogo, NagadLogo, RocketLogo, CashOnDeliveryLogo, EMILogo } from './PaymentLogos';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  appliedCoupon: string | null;
  location: LocationInfo;
  onOrderPlaced: (order: Order) => void;
  currentUser?: { name?: string; phone?: string; email?: string } | null;
  userId?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  appliedCoupon,
  location,
  onOrderPlaced,
  currentUser,
  userId
}) => {
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'cod' | 'emi'>('bkash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const prevIsOpenRef = React.useRef(false);

  // Reset form and order state only when modal transitions from closed to open
  React.useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setPlacedOrder(null);
      setIsSubmitting(false);
      if (currentUser?.name) {
        setFullName(currentUser.name);
      }
      if (currentUser?.phone) {
        setPhone(currentUser.phone);
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, currentUser?.name, currentUser?.phone]);

  const handleClose = () => {
    setPlacedOrder(null);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  let discount = 0;
  if (appliedCoupon === 'WALTON10') {
    discount = Math.round(subtotal * 0.10);
  } else if (appliedCoupon === 'PLAZAFREE') {
    discount = 500;
  }
  const deliveryFee = 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = `WP-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: Order = {
        id: orderId,
        userId: userId || '',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: [...cartItems],
        subtotal,
        discount,
        deliveryFee,
        total,
        status: 'Pending',
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          district: location.district,
          division: location.division
        },
        paymentMethod: paymentMethod.toUpperCase()
      };

      setPlacedOrder(newOrder);
      onOrderPlaced(newOrder);
      setIsSubmitting(false);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#003893] text-white p-3.5 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Back button on mobile/tablet */}
            <button
              onClick={handleClose}
              aria-label="Back"
              className="flex lg:hidden p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-white/10 hidden sm:flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">DEMO COMPANY Secure Checkout</h3>
              <p className="text-xs text-sky-200">100% Genuine Official Products</p>
            </div>
          </div>
          {/* Cross button on laptop */}
          <button 
            onClick={handleClose}
            aria-label="Close"
            className="hidden lg:flex p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {placedOrder ? (
            /* Order Placed Success Screen */
            <div className="text-center py-6 space-y-4 animate-scale-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900">Order Placed!</h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Thank you for shopping with DEMO COMPANY. Your order has been placed successfully.
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-sky-200/60 pb-1.5 font-bold">
                  <span className="text-slate-600">Order Invoice ID:</span>
                  <span className="text-[#003893] font-mono font-bold text-sm">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Customer:</span>
                  <span className="font-semibold text-slate-800">{placedOrder.shippingAddress.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Delivery Address:</span>
                  <span className="font-semibold text-slate-800">{placedOrder.shippingAddress.address}, {location.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Estimated Delivery:</span>
                  <span className="font-bold text-emerald-700">{location.deliveryTimeDays}</span>
                </div>
                <div className="flex justify-between border-t border-sky-200/60 pt-1.5 font-black text-sm">
                  <span>Total Amount:</span>
                  <span className="text-[#003893] font-['Hind_Siliguri',sans-serif]">৳ {placedOrder.total.toLocaleString('en-BD')}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="bg-[#003893] hover:bg-[#002663] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              
              {/* Delivery Banner (Home Delivery Only) */}
              <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#003893] text-white flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#003893]">Nationwide Home Delivery</div>
                  <div className="text-[11px] text-slate-600">Delivering to {location.district}, {location.division} within {location.deliveryTimeDays} (100% Free Shipping)</div>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Recipient & Delivery Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[11px] text-slate-600 block mb-1">Full Name *</span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. AR Sami"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#003893]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-600 block mb-1">Mobile Number (BD) *</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#003893]"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-600 block mb-1">Full Street Address (House, Road, Area, Landmark) *</span>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. House #12, Road #4, Block B, Mirpur-10, Dhaka"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#003893]"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  
                  {/* bKash */}
                  <div
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'bkash' ? 'border-[#E2136E] bg-pink-50/50 ring-1 ring-[#E2136E]' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                        <BKashLogo className="w-full h-full object-contain" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">bKash</span>
                    </div>
                    {paymentMethod === 'bkash' && <div className="w-2.5 h-2.5 rounded-full bg-[#E2136E]"></div>}
                  </div>

                  {/* Nagad */}
                  <div
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'nagad' ? 'border-[#F7941D] bg-orange-50/50 ring-1 ring-[#F7941D]' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                        <NagadLogo className="w-full h-full object-contain" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Nagad</span>
                    </div>
                    {paymentMethod === 'nagad' && <div className="w-2.5 h-2.5 rounded-full bg-[#F7941D]"></div>}
                  </div>

                  {/* Rocket */}
                  <div
                    onClick={() => setPaymentMethod('rocket')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'rocket' ? 'border-[#8C3494] bg-purple-50/50 ring-1 ring-[#8C3494]' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                        <RocketLogo className="w-full h-full object-contain" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Rocket</span>
                    </div>
                    {paymentMethod === 'rocket' && <div className="w-2.5 h-2.5 rounded-full bg-[#8C3494]"></div>}
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 p-0.5 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                        <CashOnDeliveryLogo className="w-full h-full object-contain" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                    </div>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>}
                  </div>

                  {/* 0% EMI */}
                  <div
                    onClick={() => setPaymentMethod('emi')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all sm:col-span-2 ${
                      paymentMethod === 'emi' ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 p-0.5 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                        <EMILogo className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">0% EMI (3-12 Months)</span>
                        <span className="text-[10px] text-slate-500">26+ Partner Banks</span>
                      </div>
                    </div>
                    {paymentMethod === 'emi' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                  </div>

                </div>
              </div>

              {/* Order Summary box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cartItems.length} items):</span>
                  <span className="font-semibold text-slate-900 font-['Hind_Siliguri',sans-serif]">৳ {subtotal.toLocaleString('en-BD')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount:</span>
                    <span className="font-['Hind_Siliguri',sans-serif]">- ৳ {discount.toLocaleString('en-BD')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Nationwide Express Delivery:</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between text-sm sm:text-base font-black text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-[#003893] font-['Hind_Siliguri',sans-serif]">৳ {total.toLocaleString('en-BD')}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E31E24] hover:bg-[#c71016] text-white font-bold text-sm py-3.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span>Placing DEMO COMPANY Order...</span>
                ) : (
                  <>
                    <span>Place Order (৳ {total.toLocaleString('en-BD')})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

