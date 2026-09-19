import React, { useState } from 'react';

interface DevlustroLogoProps {
  variant?: 'full' | 'horizontal' | 'icon' | 'image';
  theme?: 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const DevlustroIcon: React.FC<{ size?: number; className?: string; darkTheme?: boolean }> = ({
  size = 36,
  className = '',
  darkTheme = true
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Outer Bracket / C Frame */}
      <path
        d="M12 12 H88 V30 H32 V70 H88 V88 H12 Z"
        fill={darkTheme ? '#FFFFFF' : '#0B1E2D'}
      />
      {/* Inner Red Triangle */}
      <polygon
        points="55,34 32,70 78,70"
        fill="#E52320"
      />
    </svg>
  );
};

export const DevlustroLogo: React.FC<DevlustroLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  size = 'md',
  className = '',
  showTagline = true
}) => {
  const [imageError, setImageError] = useState(false);
  const isDark = theme === 'dark';

  const iconSizes = {
    xs: 20,
    sm: 26,
    md: 36,
    lg: 46,
    xl: 56
  };

  const imageHeights = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  const titleSizes = {
    xs: 'text-sm tracking-tight',
    sm: 'text-base tracking-tight',
    md: 'text-xl tracking-tight',
    lg: 'text-2xl tracking-tight',
    xl: 'text-3xl tracking-tight'
  };

  const taglineSizes = {
    xs: 'text-[7px]',
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  if (variant === 'icon') {
    return <DevlustroIcon size={iconSizes[size]} darkTheme={isDark} className={className} />;
  }

  // If image variant requested or preferred on light backgrounds, can use the official PNG
  if (variant === 'image' && !imageError) {
    return (
      <img
        src="/devlustro-logo.png"
        alt="Devlustro Logo"
        className={`${imageHeights[size]} object-contain select-none ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Logo Icon */}
      <DevlustroIcon size={iconSizes[size]} darkTheme={isDark} />

      {/* Brand Text & Tagline */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center">
          <span
            className={`font-black uppercase leading-none font-sans ${titleSizes[size]} ${
              isDark ? 'text-white' : 'text-[#0B1E2D]'
            }`}
            style={{ letterSpacing: '-0.02em' }}
          >
            DEVLUSTRO
          </span>
        </div>

        {variant === 'full' && showTagline && (
          <div
            className={`flex items-center gap-1.5 font-medium mt-1 leading-none ${taglineSizes[size]} ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            <span>Empowering Talent</span>
            <span className="text-[#E52320] text-[7px] leading-none">▲</span>
            <span>Enabling Careers</span>
          </div>
        )}
      </div>
    </div>
  );
};

