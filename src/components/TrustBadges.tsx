import React from 'react';
import { ShieldCheck, Truck, Award, CreditCard } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-6 py-2">
      <div className="bg-white rounded-xl border border-slate-200/80 p-2.5 sm:p-4 shadow-2xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 items-center">
          
          {/* 1. Safe Payments */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 p-1">
            <div className="text-[#003893] bg-blue-50 p-1.5 sm:p-2 rounded-full shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 fill-[#003893] text-white" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-snug truncate">
              Safe Payments
            </span>
          </div>

          {/* 2. Nationwide Delivery */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 p-1">
            <div className="text-[#0284c7] bg-sky-50 p-1.5 sm:p-2 rounded-full shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#0284c7]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-snug truncate">
              Nationwide Delivery
            </span>
          </div>

          {/* 3. Official Warranty */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 p-1">
            <div className="text-amber-600 bg-amber-50 p-1.5 sm:p-2 rounded-full shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-snug truncate">
              Official Warranty
            </span>
          </div>

          {/* 4. 0% EMI Available */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 p-1">
            <div className="text-emerald-600 bg-emerald-50 p-1.5 sm:p-2 rounded-full shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-snug truncate">
              0% EMI Available
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

