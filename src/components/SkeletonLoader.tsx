import React from 'react';

export const CategorySkeleton: React.FC = () => {
  return (
    <div className="flex space-x-3 overflow-hidden py-2 px-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex-shrink-0 w-24 sm:w-28 flex flex-col items-center animate-pulse">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 rounded-xl border border-slate-200"></div>
          <div className="h-3 bg-slate-200 rounded w-16 mt-2"></div>
        </div>
      ))}
    </div>
  );
};

export const BannerSkeleton: React.FC = () => {
  return (
    <div className="w-full h-44 sm:h-64 bg-slate-200 rounded-2xl animate-pulse flex items-center justify-between p-6">
      <div className="space-y-3 w-1/2">
        <div className="h-6 bg-slate-300 rounded w-3/4"></div>
        <div className="h-4 bg-slate-300 rounded w-1/2"></div>
        <div className="h-8 bg-slate-300 rounded-full w-28 mt-2"></div>
      </div>
      <div className="w-1/3 h-28 bg-slate-300 rounded-lg"></div>
    </div>
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between animate-pulse relative shadow-sm">
      <div className="w-full h-36 sm:h-44 bg-slate-100 rounded-lg"></div>
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        <div className="h-3 bg-slate-150 rounded w-2/3"></div>
        <div className="h-5 bg-emerald-100 rounded w-40 mt-1"></div>
        <div className="h-9 bg-amber-200 rounded-lg w-full mt-2"></div>
      </div>
    </div>
  );
};
