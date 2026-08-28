import React, { useState } from 'react';
import { Category } from '../types';
import { 
  Refrigerator, 
  Wind, 
  Tv, 
  Waves, 
  Microwave, 
  Smartphone, 
  Laptop, 
  Utensils, 
  Fan,
  LayoutGrid
} from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Refrigerator,
  Wind,
  Tv,
  Waves,
  Microwave,
  Smartphone,
  Laptop,
  Utensils,
  Fan,
  LayoutGrid
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <div className="w-full bg-white border-b border-slate-100 py-3.5 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start space-x-3 sm:space-x-4 overflow-x-auto pb-2 scrollbar-none no-scrollbar snap-x">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComponent = iconMap[cat.iconName] || LayoutGrid;
            const hasImageFailed = failedImages[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center flex-shrink-0 w-[84px] sm:w-[104px] group focus:outline-none snap-start cursor-pointer text-center"
              >
                {/* Category Thumbnail Box */}
                <div 
                  className={`w-18 h-18 sm:w-22 sm:h-22 rounded-xl sm:rounded-2xl bg-white border transition-all duration-200 flex items-center justify-center p-2 shadow-xs group-hover:shadow-md group-hover:-translate-y-0.5 relative overflow-hidden ${
                    isSelected 
                      ? 'border-[#003893] ring-2 ring-[#003893]/20 bg-sky-50/50' 
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {!hasImageFailed && cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setFailedImages(prev => ({ ...prev, [cat.id]: true }));
                      }}
                    />
                  ) : (
                    <div 
                      className="w-full h-full rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.accentColor || '#003893'}15` }}
                    >
                      <IconComponent 
                        className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110 duration-200"
                        style={{ color: cat.accentColor || '#003893' }}
                      />
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#003893] ring-2 ring-white"></div>
                  )}
                </div>

                {/* Category Title matching the image font & layout */}
                <span 
                  className={`mt-1.5 text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 px-0.5 transition-colors ${
                    isSelected ? 'text-[#003893]' : 'text-slate-800 group-hover:text-[#003893]'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
