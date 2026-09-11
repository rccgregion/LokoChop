import React from 'react';
import { motion } from 'motion/react';
import { 
  UtensilsCrossed, 
  Store, 
  Flame, 
  Zap, 
  Star, 
  Fish, 
  Soup, 
  Beef, 
  Sandwich, 
  Coffee, 
  Users, 
  RotateCcw 
} from 'lucide-react';

export type MarketplaceBrowseMode = 'dishes' | 'vendors';

interface LiveFilterDockProps {
  browseMode: MarketplaceBrowseMode;
  onSelectBrowseMode: (mode: MarketplaceBrowseMode) => void;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  quickFilter: string;
  onSelectQuickFilter: (qf: string) => void;
  dishCount: number;
  vendorCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const LiveFilterDock: React.FC<LiveFilterDockProps> = ({
  browseMode,
  onSelectBrowseMode,
  selectedCategory,
  onSelectCategory,
  quickFilter,
  onSelectQuickFilter,
  dishCount,
  vendorCount,
  hasActiveFilters,
  onResetFilters,
}) => {
  const categories = [
    { id: 'all', label: 'All Dishes', icon: UtensilsCrossed },
    { id: 'rice', label: 'Jollof & Combos', icon: Flame },
    { id: 'swallow', label: 'Swallow & Soups', icon: Soup },
    { id: 'grill', label: 'Grills & Suya', icon: Beef },
    { id: 'pastries', label: 'Pastries & Shawarma', icon: Sandwich },
    { id: 'drinks', label: 'Drinks & Zobo', icon: Coffee },
    { id: 'family', label: 'Family Meals', icon: Users },
  ];

  return (
    <div className="sticky top-16 sm:top-20 z-30 w-full max-w-7xl mx-auto space-y-3 px-3.5 sm:px-4 md:px-6">
      <div className="glass-capsule rounded-3xl p-3 sm:p-4 shadow-xl border border-white/70 space-y-3 backdrop-blur-2xl">
        
        {/* Main Dock Header: Primary Switcher & Quick Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Mode Switcher with layoutId="activeBrowseMode" */}
          <div className="inline-flex p-1.5 rounded-2xl bg-surface-container-low/90 border border-outline-variant/30 text-xs font-extrabold relative shadow-inner">
            <button
              type="button"
              onClick={() => onSelectBrowseMode('dishes')}
              className={`relative z-10 px-4 sm:px-5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
                browseMode === 'dishes'
                  ? 'text-white font-black'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {browseMode === 'dishes' && (
                <motion.div
                  layoutId="activeBrowseTabIndicator"
                  className="absolute inset-0 bg-primary rounded-xl shadow-md z-[-1]"
                  transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                />
              )}
              <UtensilsCrossed className="w-4 h-4" />
              <span>Browse by Food ({dishCount})</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectBrowseMode('vendors')}
              className={`relative z-10 px-4 sm:px-5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
                browseMode === 'vendors'
                  ? 'text-white font-black'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {browseMode === 'vendors' && (
                <motion.div
                  layoutId="activeBrowseTabIndicator"
                  className="absolute inset-0 bg-primary rounded-xl shadow-md z-[-1]"
                  transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                />
              )}
              <Store className="w-4 h-4" />
              <span>Browse Restaurants ({vendorCount})</span>
            </button>
          </div>

          {/* Dynamic Quick Filter Chips with Shimmer Effects */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scroll pb-1 md:pb-0">
            {/* 1. Hot Under 2500 Shimmer */}
            <button
              type="button"
              onClick={() => onSelectQuickFilter(quickFilter === 'under2500' ? '' : 'under2500')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                quickFilter === 'under2500'
                  ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md font-black'
                  : 'shimmer-badge text-amber-900 dark:text-amber-300 border-amber-500/40 hover:border-amber-500'
              }`}
            >
              <span>🔥 Under ₦2,500</span>
            </button>

            {/* 2. Fast Tier 1 Dispatch Shimmer */}
            <button
              type="button"
              onClick={() => onSelectQuickFilter(quickFilter === 'tier1' ? '' : 'tier1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                quickFilter === 'tier1'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-md font-black'
                  : 'shimmer-fast text-teal-800 dark:text-teal-200 border-teal-500/40 hover:border-teal-500'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Tier 1 Fast (15m)</span>
            </button>

            {/* 3. Starred Favorites */}
            <button
              type="button"
              onClick={() => onSelectQuickFilter(quickFilter === 'favorites' ? '' : 'favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                quickFilter === 'favorites'
                  ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-md'
                  : 'bg-white/80 hover:bg-white text-on-surface-variant border-outline-variant/30'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Starred</span>
            </button>

            {/* 4. Confluence Catfish */}
            <button
              type="button"
              onClick={() => onSelectQuickFilter(quickFilter === 'catfish' ? '' : 'catfish')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                quickFilter === 'catfish'
                  ? 'bg-secondary text-white border-secondary shadow-md'
                  : 'bg-white/80 hover:bg-white text-on-surface-variant border-outline-variant/30'
              }`}
            >
              <span>🐟 Fresh Catfish</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 border border-primary/20 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 active:scale-95"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills with Animated Underline Indicator */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scroll pt-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'text-primary font-black'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`} />
                <span>{cat.label}</span>
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryUnderline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                  />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
