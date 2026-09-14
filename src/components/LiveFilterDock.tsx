import React from 'react';
import { motion } from 'motion/react';
import { 
  UtensilsCrossed, 
  Store, 
  Flame, 
  Zap, 
  Star, 
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
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-xs border border-stone-200/80 space-y-3">
        
        {/* Main Dock Header: Primary Switcher & Quick Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Mode Switcher with layoutId="activeBrowseTabIndicator" */}
          <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200/60 text-xs font-bold relative">
            <button
              type="button"
              onClick={() => onSelectBrowseMode('vendors')}
              className={`relative z-10 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                browseMode === 'vendors'
                  ? 'text-white font-extrabold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {browseMode === 'vendors' && (
                <motion.div
                  layoutId="activeBrowseTabIndicator"
                  className="absolute inset-0 bg-primary rounded-lg shadow-xs z-[-1]"
                  transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                />
              )}
              <Store className="w-3.5 h-3.5" />
              <span>Browse Restaurants ({vendorCount})</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectBrowseMode('dishes')}
              className={`relative z-10 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                browseMode === 'dishes'
                  ? 'text-white font-extrabold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {browseMode === 'dishes' && (
                <motion.div
                  layoutId="activeBrowseTabIndicator"
                  className="absolute inset-0 bg-primary rounded-lg shadow-xs z-[-1]"
                  transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                />
              )}
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Browse Dishes ({dishCount})</span>
            </button>
          </div>

          {/* Clean Quick Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scroll pb-1 md:pb-0">
            {/* 1. Under 2500 */}
            <button
              type="button"
              onClick={() => onSelectQuickFilter(quickFilter === 'under2500' ? '' : 'under2500')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                quickFilter === 'under2500'
                  ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs font-bold'
                  : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
              }`}
            >
              <span>Under ₦2,500</span>
            </button>

            {/* 2. Fast Tier 1 Dispatch */}
            <button
              type="button"
              onClick={() => onSelectQuickFilter(quickFilter === 'tier1' ? '' : 'tier1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                quickFilter === 'tier1'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold'
                  : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Fast Dispatch (15-25m)</span>
            </button>

            {/* 3. Starred Favorites */}
            <button
              type="button"
              onClick={() => onSelectQuickFilter(quickFilter === 'favorites' ? '' : 'favorites')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                quickFilter === 'favorites'
                  ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-xs font-bold'
                  : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Starred</span>
            </button>

            {/* 4. Confluence Catfish */}
            <button
              type="button"
              onClick={() => onSelectQuickFilter(quickFilter === 'catfish' ? '' : 'catfish')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                quickFilter === 'catfish'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs font-bold'
                  : 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100'
              }`}
            >
              <span>River Niger Catfish</span>
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

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scroll pt-1 border-t border-stone-100">
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
                    ? 'text-primary font-black bg-primary/10'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-stone-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
