import React from 'react';
import { PhoneCall, MapPin, Mail, ShieldCheck, Clock, Award, HelpCircle } from 'lucide-react';
import { BKashLogo, NagadLogo, RocketLogo, CashOnDeliveryLogo, EMILogo } from './PaymentLogos';

interface FooterProps {
  onOpenLocationModal: () => void;
  onOpenOffersModal: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLocationModal,
  onOpenOffersModal,
  onSelectCategory
}) => {
  return (
    <footer className="bg-[#002663] text-white pt-10 pb-20 md:pb-10 mt-10 border-t border-sky-950 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 pb-8 border-b border-sky-900/60">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center tracking-tight text-2xl font-extrabold">
              <span className="text-white">DEMO</span>
              <span className="text-[#E31E24] ml-1.5 font-black">COMPANY</span>
            </div>
            <p className="text-xs text-sky-200 leading-relaxed">
              DEMO COMPANY is Bangladesh's largest official consumer electronics and smart home appliances network.
            </p>
            <div className="text-xs text-amber-300 font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Genuine Official Warranty</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">Popular Categories</h4>
            <ul className="space-y-1.5 text-xs text-slate-200">
              <li>
                <button onClick={() => onSelectCategory('refrigerator')} className="hover:text-white cursor-pointer transition-colors">
                  Refrigerators & Deep Freezers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('air-conditioner')} className="hover:text-white cursor-pointer transition-colors">
                  Dual Inverter Air Conditioners
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('television')} className="hover:text-white cursor-pointer transition-colors">
                  4K Frameless Google Smart TVs
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('washing-machine')} className="hover:text-white cursor-pointer transition-colors">
                  Front & Top Load Washing Machines
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('smartphones')} className="hover:text-white cursor-pointer transition-colors">
                  Walpad Tablets & Primo Smartphones
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Helpline */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">Customer Support</h4>
            <div className="space-y-2 text-xs text-slate-200">
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Call Center: <strong>12345</strong> or <strong>123456789</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-300 shrink-0" />
                <span>Working Hours: 10 AM to 8 PM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-sky-300 shrink-0" />
                <span>info@democompany.com</span>
              </div>
            </div>
          </div>

          {/* Col 4: Payment Partners */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">Safe Payment Methods</h4>
            <p className="text-xs text-sky-200">We accept mobile banking, cash on delivery & 0% EMI:</p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <div className="bg-white rounded px-1.5 py-0.5 flex items-center justify-center shadow-xs h-7">
                <BKashLogo className="h-4.5 w-auto" />
              </div>
              <div className="bg-white rounded px-1.5 py-0.5 flex items-center justify-center shadow-xs h-7">
                <NagadLogo className="h-4.5 w-auto" />
              </div>
              <div className="bg-white rounded px-1.5 py-0.5 flex items-center justify-center shadow-xs h-7">
                <RocketLogo className="h-4.5 w-auto" />
              </div>
              <div className="bg-white rounded px-1.5 py-0.5 flex items-center justify-center shadow-xs h-7">
                <CashOnDeliveryLogo className="h-5 w-auto" />
              </div>
              <div className="bg-white rounded px-1.5 py-0.5 flex items-center justify-center shadow-xs h-7">
                <EMILogo className="h-5 w-auto" />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-sky-300 gap-2">
          <p>© {new Date().getFullYear()} DEMO COMPANY Bangladesh. All rights reserved.</p>
          <div className="flex space-x-4 text-[11px]">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Warranty Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">EMI Terms</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
