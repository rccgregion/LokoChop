import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface FloatingMobileCartCapsuleProps {
  items: CartItem[];
  cartTotal: number;
  onOpenCart: () => void;
}

export const FloatingMobileCartCapsule: React.FC<FloatingMobileCartCapsuleProps> = ({
  items,
  cartTotal,
  onOpenCart,
}) => {
  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const [bounce, setBounce] = useState(false);

  // Trigger brief bounce effect when items change
  useEffect(() => {
    if (itemCount > 0) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 400);
      return () => clearTimeout(t);
    }
  }, [itemCount, cartTotal]);

  if (itemCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="mobile-floating-cart-capsule"
        initial={{ y: 50, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: bounce ? 1.04 : 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-18 left-3 right-3 z-30 md:hidden"
      >
        <button
          type="button"
          onClick={onOpenCart}
          className="w-full relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-r from-stone-900/95 via-stone-900/90 to-primary/95 text-white backdrop-blur-xl border border-white/25 shadow-2xl shadow-orange-500/25 flex items-center justify-between cursor-pointer active:scale-98 transition-all group"
        >
          {/* Ambient Liquid Shimmer Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          {/* Left info: Icon & Items Counter */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            </div>
            
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-xs text-white/85 uppercase tracking-wide">
                  Chop Cart
                </span>
                <span className="text-[10px] bg-white/20 text-white font-bold px-1.5 py-0.2 rounded">
                  {itemCount} item{itemCount > 1 ? 's' : ''}
                </span>
              </div>

              {/* Animated Live Price Ticker */}
              <div className="font-price-display text-lg font-black text-amber-400 tracking-tight flex items-baseline gap-1">
                <span>₦</span>
                <motion.span
                  key={cartTotal}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {cartTotal.toLocaleString()}
                </motion.span>
              </div>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-1.5 bg-white text-stone-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-md group-hover:bg-amber-300 transition-colors">
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
