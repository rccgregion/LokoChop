import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FoodItem } from '../types';
import { triggerFlyToCart } from './FlyToCartParticle';
import { Plus, Minus, Star, Store, Sparkles, Flame, Clock } from 'lucide-react';

interface InteractiveDishCardProps {
  dish: FoodItem;
  onAddToCart: (dish: FoodItem) => void;
  onOpenVendor?: (vendorId: string) => void;
  isStarred?: boolean;
  onToggleFavorite?: (id: string) => void;
  currentCartQty?: number;
  onUpdateQty?: (id: string, delta: number) => void;
}

export const InteractiveDishCard: React.FC<InteractiveDishCardProps> = ({
  dish,
  onAddToCart,
  onOpenVendor,
  isStarred = false,
  onToggleFavorite,
  currentCartQty = 0,
  onUpdateQty,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerFlyToCart(e, dish.category === 'Drinks' ? '🥤' : '🍲');
    onAddToCart(dish);
  };

  return (
    <motion.article
      id={`dish-card-${dish.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
      className="group relative bg-white/85 backdrop-blur-xl rounded-2xl border border-white/60 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-2xl hover:shadow-orange-500/15 hover:border-primary/40 transition-all duration-300 cursor-pointer"
    >
      {/* Food Photo Container with Image Zoom & Badges */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-surface-container">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Subtle Dark Vignette on Bottom of Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-black/10 pointer-events-none" />

        {/* Favorite Star Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(dish.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer z-10 ${
            isStarred
              ? 'bg-amber-400 text-stone-950 ring-2 ring-white scale-110'
              : 'bg-stone-900/60 text-white hover:text-amber-400 hover:bg-stone-900/80'
          }`}
          title={isStarred ? 'Remove from starred' : 'Star this dish'}
        >
          <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-stone-950 text-stone-950' : ''}`} />
        </button>

        {/* Primary Dish Badge (e.g., Hot & Spicy, Best Seller) */}
        {dish.badge && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-primary to-orange-600 text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-md backdrop-blur-xs flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-300" />
            <span>{dish.badge}</span>
          </span>
        )}

        {/* Vendor Tag on Bottom Left of Image */}
        {dish.vendorName && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenVendor && dish.vendorId) onOpenVendor(dish.vendorId);
            }}
            className="absolute bottom-3 left-3 bg-stone-950/75 hover:bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-md transition-colors shadow-sm"
          >
            <Store className="w-3 h-3 text-amber-400" />
            <span className="line-clamp-1 max-w-[160px]">{dish.vendorName}</span>
          </button>
        )}
      </div>

      {/* Dish Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
            {dish.name}
          </h3>
          <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-wider">
              Price
            </span>
            <span className="font-price-display text-lg sm:text-xl text-primary font-black tracking-tight">
              ₦{dish.price.toLocaleString()}
            </span>
          </div>

          {/* If already in cart, show quantity pill; otherwise show "Add to Cart" */}
          {currentCartQty > 0 && onUpdateQty ? (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-2 py-1 shadow-2xs"
            >
              <button
                type="button"
                onClick={() => onUpdateQty(dish.id, -1)}
                className="w-6 h-6 rounded-full bg-white hover:bg-error hover:text-white text-on-surface flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-headline font-bold text-xs text-primary min-w-4 text-center">
                {currentCartQty}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  triggerFlyToCart(e, '🍲');
                  onUpdateQty(dish.id, 1);
                }}
                className="w-6 h-6 rounded-full bg-primary hover:bg-primary-container text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-90"
                title="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={handleAddClick}
              className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-container text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer overflow-hidden group/btn"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add to Cart</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
};
