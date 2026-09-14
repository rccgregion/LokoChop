import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FoodItem } from '../types';
import { triggerFlyToCart } from './FlyToCartParticle';
import { Plus, Minus, Star, Store, Flame, Clock } from 'lucide-react';

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
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-orange-500/10 hover:border-primary/40 transition-all duration-300 cursor-pointer"
    >
      {/* Food Photo Container - Clean presentation without dark murky overlays */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          onError={(e) => {
            // Guard against infinite loop and guarantee real food fallback
            const target = e.currentTarget;
            if (!target.src.includes('/images/dishes/jollof_rice.jpg')) {
              target.src = '/images/dishes/jollof_rice.jpg';
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Favorite Star Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(dish.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm backdrop-blur-md transition-all active:scale-90 cursor-pointer z-10 ${
            isStarred
              ? 'bg-amber-400 text-stone-950 ring-2 ring-white scale-105'
              : 'bg-white/85 text-stone-700 hover:text-amber-500 hover:bg-white'
          }`}
          title={isStarred ? 'Remove from starred' : 'Star this dish'}
        >
          <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-stone-950 text-stone-950' : ''}`} />
        </button>

        {/* Dish Badge (Clean floating chip on top-left) */}
        {dish.badge && (
          <span className="absolute top-3 left-3 bg-white/95 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md flex items-center gap-1 border border-primary/20">
            <Flame className="w-3 h-3 text-primary shrink-0" />
            <span>{dish.badge}</span>
          </span>
        )}
      </div>

      {/* Dish Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {/* Vendor Tag & Prep Time - Cleanly integrated in card body */}
          <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
            {dish.vendorName && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenVendor && dish.vendorId) onOpenVendor(dish.vendorId);
                }}
                className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-semibold transition-colors truncate max-w-[170px]"
                title={`View ${dish.vendorName}`}
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{dish.vendorName}</span>
              </button>
            )}
            {dish.prepTime && (
              <span className="text-[11px] text-stone-500 font-medium shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>{dish.prepTime}</span>
              </span>
            )}
          </div>

          <h3 
            className="font-headline text-base font-bold text-stone-900 group-hover:text-primary transition-colors leading-snug line-clamp-1"
            title={dish.name}
          >
            {dish.name}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-medium text-stone-500 block uppercase tracking-wider">
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
              className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-2 py-1 shadow-2xs"
            >
              <button
                type="button"
                onClick={() => onUpdateQty(dish.id, -1)}
                className="w-6 h-6 rounded-full bg-white hover:bg-error hover:text-white text-stone-800 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
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
              className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-container text-white shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer overflow-hidden group/btn"
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
