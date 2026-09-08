import React from 'react';
import appLogoSrc from '../assets/images/lokochop_logo_1788865254933.jpg';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  tagline?: boolean | string;
  badge?: string;
  className?: string;
  imgClassName?: string;
}

const sizeMap = {
  xs: { box: 'w-6 h-6', img: 'w-6 h-6 rounded-md', text: 'text-base', sub: 'text-[9px]' },
  sm: { box: 'w-8 h-8', img: 'w-8 h-8 rounded-lg', text: 'text-lg', sub: 'text-[10px]' },
  md: { box: 'w-10 h-10', img: 'w-10 h-10 rounded-xl', text: 'text-xl sm:text-2xl', sub: 'text-[11px]' },
  lg: { box: 'w-12 h-12', img: 'w-12 h-12 rounded-2xl', text: 'text-2xl sm:text-3xl', sub: 'text-xs' },
  xl: { box: 'w-16 h-16', img: 'w-16 h-16 rounded-2xl', text: 'text-3xl sm:text-4xl', sub: 'text-xs' },
  '2xl': { box: 'w-20 h-20', img: 'w-20 h-20 rounded-3xl', text: 'text-4xl', sub: 'text-sm' },
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = false,
  tagline,
  badge,
  className = '',
  imgClassName = '',
}) => {
  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Brand Icon Artwork Container */}
      <div 
        className={`relative ${currentSize.box} shrink-0 rounded-2xl overflow-hidden bg-white shadow-xs border border-outline-variant/30 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform`}
      >
        <img
          src={appLogoSrc}
          alt="LokoChop - Confluence Food Logo"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-contain select-none ${imgClassName}`}
          onError={(e) => {
            // Fallback to static public logo if needed
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>

      {/* Optional Brand Text */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`font-headline font-black tracking-tight text-on-surface ${currentSize.text} leading-none`}>
              Loko<span className="text-primary">Chop</span>
            </span>
            {badge && (
              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full uppercase leading-none">
                {badge}
              </span>
            )}
          </div>
          {tagline && (
            <span className={`font-medium text-on-surface-variant/80 mt-0.5 ${currentSize.sub} truncate`}>
              {typeof tagline === 'string' ? tagline : 'Confluence Food • Lokoja'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
