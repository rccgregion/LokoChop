import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ActiveView } from '../types';
import { UtensilsCrossed, Store, ShoppingBag, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenPortalModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenPortalModal
}) => {
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    const handleBounce = () => {
      setIsBouncing(true);
      const t = setTimeout(() => setIsBouncing(false), 500);
      return () => clearTimeout(t);
    };

    window.addEventListener('lokochop-cart-bounce', handleBounce);
    return () => window.removeEventListener('lokochop-cart-bounce', handleBounce);
  }, []);

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 sm:px-4 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] bg-white/85 backdrop-blur-2xl border-t border-white/60 md:hidden shadow-2xl shadow-orange-500/10"
    >
      {/* 1. Chop Life */}
      <button 
        onClick={() => onNavigate('marketplace')} 
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-3 py-1 rounded-2xl transition-all cursor-pointer ${
          currentView === 'marketplace' 
            ? 'bg-primary text-on-primary font-bold shadow-xs' 
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <UtensilsCrossed className="w-5 h-5" />
        <span className="text-[11px] font-semibold mt-0.5 whitespace-nowrap">Chop Life</span>
      </button>

      {/* 2. Vendors */}
      <button 
        onClick={() => onNavigate('vendor-storefront')} 
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-3 py-1 rounded-2xl transition-all cursor-pointer ${
          currentView === 'vendor-storefront' 
            ? 'bg-primary text-on-primary font-bold shadow-xs' 
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <Store className="w-5 h-5" />
        <span className="text-[11px] font-semibold mt-0.5 whitespace-nowrap">Vendors</span>
      </button>

      {/* 3. Chop Cart */}
      <motion.button 
        id="mobile-cart-icon-target"
        animate={{ scale: isBouncing ? [1, 1.25, 0.95, 1.05, 1] : 1 }}
        transition={{ duration: 0.45 }}
        onClick={onOpenCart} 
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-on-surface-variant hover:text-on-surface px-3 py-1 transition-colors relative cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-on-surface" />
          {cartCount > 0 && (
            <motion.span 
              animate={{ scale: isBouncing ? [1, 1.4, 1] : 1 }}
              className="absolute -top-1 -right-2 bg-amber-400 text-stone-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
            >
              {cartCount}
            </motion.span>
          )}
        </div>
        <span className="text-[11px] font-semibold mt-0.5 whitespace-nowrap">Chop Cart</span>
      </motion.button>

      {/* 4. My Account / Portals */}
      <button 
        onClick={onOpenPortalModal} 
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-3 py-1 rounded-2xl transition-all cursor-pointer ${
          currentView === 'order-history' || currentView === 'order-tracking'
            ? 'bg-primary text-on-primary font-bold shadow-xs'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[11px] font-semibold mt-0.5 whitespace-nowrap">Portals</span>
      </button>
    </nav>
  );
};
