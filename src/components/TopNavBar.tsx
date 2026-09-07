import React, { useState } from 'react';
import { ActiveView, VendorUser, AdminUser } from '../types';
import { 
  Waves, 
  Search, 
  ShoppingBag, 
  Bell, 
  Lock,
  X,
  ShieldCheck
} from 'lucide-react';

interface TopNavBarProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenPortalModal?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  vendorUser?: VendorUser | null;
  adminUser?: AdminUser | null;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenNotifications,
  searchQuery,
  onSearchChange,
  vendorUser,
  adminUser,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md text-on-surface border-b border-outline-variant/30 shadow-[0_2px_10px_-4px_rgba(31,27,16,0.06)] transition-all">
      <div className="w-full px-3.5 sm:px-5 md:px-6 max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-[4.25rem]">
        
        {/* Brand & Confluence Motif */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
          <button 
            onClick={() => onNavigate('marketplace')} 
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
            title="LokoChop — Confluence Food Marketplace"
          >
            {/* Visual Logo Mark */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5 text-amber-300" />
            </div>

            {/* Brand Titles */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline text-xl sm:text-2xl font-black tracking-tight text-on-surface group-hover:text-primary transition-colors">
                  Loko<span className="text-primary">Chop</span>
                </span>
                {currentView === 'admin-portal' && (
                  <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] sm:text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full uppercase">
                    Admin HQ
                  </span>
                )}
                {currentView === 'vendor-hub' && (
                  <span className="bg-tertiary/10 text-tertiary border border-tertiary/20 text-[9px] sm:text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Vendor Hub
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-on-surface-variant/80 -mt-0.5 hidden xs:block">
                Confluence Food • Lokoja
              </span>
            </div>
          </button>
        </div>

        {/* Center Search Bar (Desktop & Tablet) */}
        <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-3 lg:mx-6">
          <div className="relative w-full group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Chicken Republic, Craving Spot, Shawarma, Suya..."
              className="w-full bg-surface-container-low/70 hover:bg-surface-container-low focus:bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 text-xs pl-10 pr-9 py-2.5 rounded-2xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="hidden xl:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-on-surface-variant/60 font-medium px-1.5 py-0.5 bg-surface-container rounded-md border border-outline-variant/20 pointer-events-none">
                /
              </span>
            )}
          </div>
        </div>

        {/* Right Navigation & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Quick View Portal Switcher Pill */}
          <div className="hidden sm:inline-flex items-center p-1 bg-surface-container-low rounded-2xl border border-outline-variant/30 text-xs shadow-2xs">
            <button
              onClick={() => onNavigate('marketplace')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                currentView === 'marketplace' || currentView === 'vendor-storefront' 
                  ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/20' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Diner
            </button>
            <button
              onClick={() => onNavigate('vendor-hub')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'vendor-hub' 
                  ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/20' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title={vendorUser ? `Active Kitchen: ${vendorUser.vendorName}` : 'Vendor Hub Portal (Secure PIN)'}
            >
              <span>Kitchen Hub</span>
              {vendorUser ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Kitchen Online"></span>
              ) : (
                <Lock className="w-3 h-3 text-on-surface-variant/60" />
              )}
            </button>
            {adminUser && (
              <button
                onClick={() => onNavigate('admin-portal')}
                className={`px-2 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  currentView === 'admin-portal' 
                    ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/20' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Super Admin HQ"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}
          </div>

          {/* Mobile Search Toggle Button */}
          <button 
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-2xl transition-colors cursor-pointer"
            title="Search dishes or vendors"
            aria-label="Toggle Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Button */}
          <button 
            onClick={onOpenNotifications}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-2xl transition-colors relative cursor-pointer"
            title="Lokoja Kitchen & Dispatch Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface animate-pulse"></span>
          </button>

          {/* Standout Primary Cart Trigger */}
          <button 
            onClick={onOpenCart}
            className="flex items-center gap-2 sm:gap-2.5 bg-primary hover:bg-primary-container text-white px-3 sm:px-4 py-2 rounded-2xl shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
            aria-label="Open food cart"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-bold font-headline tracking-tight">
                Cart
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-white/90 font-price-display">
                • ₦{cartTotal.toLocaleString()}
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-3.5 pb-3 pt-1 border-t border-outline-variant/20 bg-surface-container-lowest animate-fade-in">
          <div className="relative w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search food, vendors, buka..."
                className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 text-xs pl-10 pr-8 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-xs font-bold text-on-surface-variant hover:text-on-surface px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
