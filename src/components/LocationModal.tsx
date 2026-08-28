import React, { useState } from 'react';
import { X, MapPin, Check, Store, Clock, Phone, Navigation, ArrowLeft } from 'lucide-react';
import { LocationInfo } from '../types';
import { divisions, districtsByDivision, plazaStores, PlazaStore } from '../data/locations';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation
}) => {
  const [selectedDivision, setSelectedDivision] = useState(currentLocation.division || 'Dhaka');
  const [selectedDistrict, setSelectedDistrict] = useState(currentLocation.district || 'Dhaka City');
  const [selectedPlaza, setSelectedPlaza] = useState(currentLocation.plazaBranch || 'DEMO COMPANY Mirpur 10');

  if (!isOpen) return null;

  const districts = districtsByDivision[selectedDivision] || ['Dhaka City'];
  const availableStores = plazaStores.filter(store => store.district === selectedDistrict || store.division === selectedDivision);

  const handleApply = () => {
    onSelectLocation({
      division: selectedDivision,
      district: selectedDistrict,
      plazaBranch: selectedPlaza,
      deliveryTimeDays: selectedDistrict === 'Dhaka City' || selectedDistrict === 'Chattogram City' ? '24 Hours' : '24 - 48 Hours',
      deliveryFee: 0 // Free delivery promotion
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#003893] text-white p-3.5 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Back button on mobile/tablet */}
            <button
              onClick={onClose}
              aria-label="Back"
              className="flex lg:hidden p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-white/10 rounded-xl hidden sm:block">
              <MapPin className="w-5 h-5 text-red-400 fill-red-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Select Delivery Location & Store</h3>
              <p className="text-xs text-sky-200">Find nearest DEMO COMPANY store for fastest express delivery</p>
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Division Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Select Division
            </label>
            <div className="flex flex-wrap gap-1.5">
              {divisions.map((div) => (
                <button
                  key={div}
                  onClick={() => {
                    setSelectedDivision(div);
                    const newDistricts = districtsByDivision[div];
                    if (newDistricts && newDistricts.length > 0) {
                      setSelectedDistrict(newDistricts[0]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedDivision === div
                      ? 'bg-[#003893] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Select District / Area
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#003893] focus:ring-2 focus:ring-sky-100 cursor-pointer"
            >
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Nearest Store Outlets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. Nearest DEMO COMPANY Outlets
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableStores.length > 0 ? (
                availableStores.map((store) => {
                  const isSelected = selectedPlaza === store.name;
                  return (
                    <div
                      key={store.id}
                      onClick={() => setSelectedPlaza(store.name)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                        isSelected 
                          ? 'border-[#003893] bg-sky-50/70 ring-1 ring-[#003893]' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <Store className="w-4 h-4 text-[#003893]" />
                          <span className="text-xs sm:text-sm font-bold text-slate-900">{store.name}</span>
                          {store.isFlagship && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded">
                              Flagship
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 pl-5">{store.address}</p>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 pl-5 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {store.openHours}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {store.phone}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 pt-1">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#003893] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-300"></div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-600">
                  Defaulting to Regional Hub for {selectedDistrict}. Delivery within 24-48 hours.
                </div>
              )}
            </div>
          </div>

          {/* Delivery Promise Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-3 text-xs text-emerald-900">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Fast Nationwide Delivery Guaranteed</p>
              <p className="text-[11px] text-emerald-700">100% Free Shipping on all major appliances & gadgets directly from DEMO COMPANY.</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="bg-[#003893] hover:bg-[#002663] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            Set Location
          </button>
        </div>

      </div>
    </div>
  );
};
