import React, { useState, useEffect } from 'react';
import { X, Zap, Gift, Clock, Sparkles, Tag, Check, Copy, ArrowRight, ArrowLeft } from 'lucide-react';

interface OffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (catId: string) => void;
}

export const OffersModal: React.FC<OffersModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 48 });
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const copyToClipboard = (code: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(code).catch(() => {});
      }
    } catch {
      // ignore
    }
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/55 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E31E24] via-[#c71016] to-[#003893] text-white p-3.5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Back button on mobile/tablet */}
            <button
              onClick={onClose}
              aria-label="Back"
              className="flex lg:hidden p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs hidden sm:block">
              <Zap className="w-6 h-6 text-amber-300 fill-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-2xl tracking-tight">DEMO COMPANY Mega Offers</h3>
              <p className="text-xs sm:text-sm text-red-100">Exclusive online discounts, 0% EMI & exchange bonanza</p>
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Flash Deal Timer Box */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Clock className="w-5 h-5 text-amber-600 animate-spin" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">Today's Flash Deals Ending In:</h4>
                <p className="text-xs text-slate-600">Extra 5% to 15% discount on AC, Fridge & Smart TVs</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 font-mono font-black text-slate-900">
              <div className="bg-slate-900 text-amber-400 px-2.5 py-1.5 rounded-lg text-sm shadow-xs">
                {String(timeLeft.hours).padStart(2, '0')}h
              </div>
              <span>:</span>
              <div className="bg-slate-900 text-amber-400 px-2.5 py-1.5 rounded-lg text-sm shadow-xs">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </div>
              <span>:</span>
              <div className="bg-slate-900 text-amber-400 px-2.5 py-1.5 rounded-lg text-sm shadow-xs">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </div>
            </div>
          </div>

          {/* Active Promo Vouchers */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#003893]" />
              Active Discount Coupons
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Voucher 1 */}
              <div className="border border-dashed border-sky-400 bg-sky-50/60 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#003893]">10% Flat Instant Discount</div>
                  <div className="text-[11px] text-slate-500">Min. order ৳ 5,000</div>
                  <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-sky-200 text-slate-800 mt-1 inline-block">
                    WALTON10
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard('WALTON10')}
                  className="bg-[#003893] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#002663] cursor-pointer flex items-center gap-1"
                >
                  {copiedCoupon === 'WALTON10' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCoupon === 'WALTON10' ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Voucher 2 */}
              <div className="border border-dashed border-emerald-400 bg-emerald-50/60 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-800">Free Gift Box + Zero Delivery</div>
                  <div className="text-[11px] text-slate-500">Applicable on any order</div>
                  <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-slate-800 mt-1 inline-block">
                    PLAZAFREE
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard('PLAZAFREE')}
                  className="bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-800 cursor-pointer flex items-center gap-1"
                >
                  {copiedCoupon === 'PLAZAFREE' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCoupon === 'PLAZAFREE' ? 'Copied' : 'Copy'}
                </button>
              </div>

            </div>
          </div>

          {/* Campaign Banners */}
          <div className="space-y-3">
            
            {/* Mega Cool AC campaign */}
            <div 
              onClick={() => {
                onClose();
                onSelectCategory('air-conditioner');
              }}
              className="bg-gradient-to-r from-sky-600 to-blue-700 text-white p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="space-y-1 max-w-[75%]">
                <div className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded inline-block">
                  SUMMER SPECIAL
                </div>
                <h5 className="font-extrabold text-base sm:text-lg font-['Hind_Siliguri',sans-serif]">
                  মেগা কুল এসি অফার — শুরু মাত্র ৳ ৩২,২০০
                </h5>
                <p className="text-xs text-sky-100">ফ্রি হোম ডেলিভারি ও ফ্রি ইন্সটলেশন সার্ভিস</p>
              </div>
              <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Exchange Offer campaign */}
            <div 
              onClick={() => {
                onClose();
                onSelectCategory('refrigerator');
              }}
              className="bg-gradient-to-r from-amber-600 to-red-600 text-white p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="space-y-1 max-w-[75%]">
                <div className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded inline-block">
                  PLAZA EXCHANGE
                </div>
                <h5 className="font-extrabold text-base sm:text-lg">
                  পুরনো ফ্রিজ বা এসি বদলে নতুন পণ্য নিন
                </h5>
                <p className="text-xs text-amber-100">যেকোনো ব্র্যান্ডের পুরনো পণ্যে পান ৳ ৫,০০০ পর্যন্ত ক্যাশব্যাক</p>
              </div>
              <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
            </div>

            {/* 0% EMI Campaign */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <h5 className="font-bold text-sm text-sky-300">০% ইন্টারেস্টে ১২ মাস পর্যন্ত কিস্তি সুবিধা</h5>
                <p className="text-xs text-slate-300">City Bank, BRAC Bank, SCB, EBL, DBBL সহ ২৬টি শীর্ষস্থানীয় ব্যাংকের ক্রেডিট কার্ডে।</p>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#003893] hover:bg-[#002663] text-white font-bold text-sm px-6 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
