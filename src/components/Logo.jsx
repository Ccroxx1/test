import React, { useState } from 'react';
import logoAsset from '../assets/images/magnet_logo_1788397535940.jpg';

export default function Logo({ className = "w-10 h-10", size = 40 }) {
  const [imgError, setImgError] = useState(false);
  const [src, setSrc] = useState(logoAsset || '/logo.png');

  const handleImageError = () => {
    if (src !== '/logo.png') {
      setSrc('/logo.png');
    } else {
      setImgError(true);
    }
  };

  if (!imgError) {
    return (
      <div className={`relative shrink-0 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 ring-1 ring-slate-800/10 dark:ring-white/15 bg-slate-950 flex items-center justify-center ${className}`}>
        <img
          src={src}
          alt="MiTorrents Logo"
          className="w-full h-full object-cover select-none"
          onError={handleImageError}
          draggable={false}
        />
      </div>
    );
  }

  // Fallback high-fidelity SVG Magnet Logo
  return (
    <div className={`relative shrink-0 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20 bg-slate-900 flex items-center justify-center p-0.5 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blueArm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00c6ff" />
            <stop offset="100%" stopColor="#0072ff" />
          </linearGradient>
          <linearGradient id="redArm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff416c" />
            <stop offset="100%" stopColor="#ff4b2b" />
          </linearGradient>
          <linearGradient id="silverM" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="poleTip" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Glow Background */}
        <circle cx="50" cy="50" r="46" fill="#0b1120" />

        {/* Left Magnet Arm (Blue with film strip frames) */}
        <path
          d="M 16 70 L 16 44 C 16 25 31 14 50 14 L 50 28 C 39 28 30 35 30 46 L 30 70 Z"
          fill="url(#blueArm)"
          filter="url(#glow)"
        />
        {/* Film strip notches on blue arm */}
        <rect x="20" y="32" width="6" height="4" rx="1" fill="#ffffff" opacity="0.6" />
        <rect x="20" y="42" width="6" height="4" rx="1" fill="#ffffff" opacity="0.6" />
        <rect x="20" y="52" width="6" height="4" rx="1" fill="#ffffff" opacity="0.6" />
        <rect x="20" y="62" width="6" height="4" rx="1" fill="#ffffff" opacity="0.6" />

        {/* Right Magnet Arm (Red with film reel emblem) */}
        <path
          d="M 84 70 L 84 44 C 84 25 69 14 50 14 L 50 28 C 61 28 70 35 70 46 L 70 70 Z"
          fill="url(#redArm)"
          filter="url(#glow)"
        />
        {/* Film reel circle inside red arm */}
        <circle cx="76" cy="56" r="6" stroke="#ffffff" strokeWidth="1.5" fill="#e11d48" opacity="0.9" />
        <circle cx="76" cy="56" r="2" fill="#ffffff" />
        <circle cx="73" cy="54" r="1" fill="#ffffff" />
        <circle cx="79" cy="54" r="1" fill="#ffffff" />
        <circle cx="76" cy="59" r="1" fill="#ffffff" />

        {/* Silver Pole Ends */}
        <rect x="15" y="70" width="16" height="12" rx="2" fill="url(#poleTip)" />
        <rect x="69" y="70" width="16" height="12" rx="2" fill="url(#poleTip)" />

        {/* Center 3D Metallic 'M' */}
        <path
          d="M 37 66 L 37 38 L 46 52 L 50 52 L 54 38 L 63 66 L 57 66 L 51 46 L 49 46 L 43 66 Z"
          fill="url(#silverM)"
          filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.8))"
        />
      </svg>
    </div>
  );
}
