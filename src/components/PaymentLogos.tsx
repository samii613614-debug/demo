import React, { useState } from 'react';

// Official bKash Logo
export const BKashLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-auto' }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#E2136E" />
        {/* bKash Origami Bird */}
        <g transform="translate(4, 4)">
          <path d="M12 24L4 16L18 4L28 10L12 24Z" fill="#FFFFFF" />
          <path d="M18 4L32 8L28 10L18 4Z" fill="#FCE4EC" />
          <path d="M28 10L30 20L20 18L28 10Z" fill="#FFFFFF" />
          <path d="M12 24L20 18L18 28L12 24Z" fill="#F8BBD0" />
        </g>
      </svg>
    );
  }

  return (
    <img
      src="https://download.logo.wine/logo/BKash/BKash-Icon2-Logo.wine.png"
      alt="bKash"
      className={`${className} object-contain`}
      onError={() => setImgError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

// Official Nagad Logo
export const NagadLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-auto' }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#F7941D" />
        {/* Nagad Swirl */}
        <circle cx="20" cy="20" r="13" fill="#ED1C24" />
        <path d="M15 25C15 25 18 14 24 15C29 16 26 24 21 24C17 24 16 19 21 17" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="15" r="2" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <img
      src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png"
      alt="Nagad"
      className={`${className} object-contain`}
      onError={() => setImgError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

// Official Dutch-Bangla Bank Rocket Logo (DBBL Rocket from seeklogo 317692)
export const RocketLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-auto' }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 100 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* DBBL Purple Background Container */}
          <rect width="100" height="40" rx="6" fill="#8C3494" />
          
          {/* Dutch-Bangla Bank (DBBL) Iconic Emblem */}
          <g transform="translate(6, 7)">
            {/* Top Red Node */}
            <circle cx="13" cy="6" r="4.5" fill="#ED1C24" />
            {/* Left Green Node */}
            <circle cx="6.5" cy="16" r="4.5" fill="#008751" />
            {/* Right Green Node */}
            <circle cx="19.5" cy="16" r="4.5" fill="#008751" />
            {/* Center Branch */}
            <path d="M13 10V21M7 16L13 13L19 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
          
          {/* Official Rocket Brand Wordmark */}
          <text x="33" y="22" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.2">
            rocket
          </text>
          <text x="33" y="31" fill="#E9D5FF" fontSize="7" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.3">
            DBBL MFS
          </text>
        </svg>
      </div>
    );
  }

  return (
    <img
      src="https://images.seeklogo.com/logo-png/31/1/dutch-bangla-rocket-logo-png_seeklogo-317692.png"
      alt="Dutch-Bangla Rocket"
      className={`${className} object-contain`}
      onError={(e) => {
        // Try wikimedia fallback if seeklogo hotlink is restricted
        if (e.currentTarget.src !== "https://upload.wikimedia.org/wikipedia/commons/e/e4/Rocket_ddbl.png") {
          e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/e/e4/Rocket_ddbl.png";
        } else {
          setImgError(true);
        }
      }}
      referrerPolicy="no-referrer"
    />
  );
};

// Cash on Delivery Logo
export const CashOnDeliveryLogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-auto' }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap">
        COD
      </span>
    );
  }

  return (
    <img
      src="https://share.google/FmOMHdJ5EGZcrockj"
      alt="Cash On Delivery"
      className={`${className} object-contain`}
      onError={() => setImgError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

// 0% EMI Logo
export const EMILogo: React.FC<{ className?: string }> = ({ className = 'h-5 w-auto' }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <span className="bg-[#003893] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap">
        0% EMI
      </span>
    );
  }

  return (
    <img
      src="https://share.google/GFnq46P5RhKLSnSjE"
      alt="0% EMI Available"
      className={`${className} object-contain`}
      onError={() => setImgError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

