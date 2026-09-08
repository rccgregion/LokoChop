import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SlidersHorizontal, 
  UtensilsCrossed, 
  Utensils,
  Store,
  MapPin,
  Flame, 
  Soup, 
  Beef, 
  Sandwich, 
  Coffee, 
  Tag, 
  Check, 
  X, 
  RotateCcw, 
  ArrowUpDown,
  ChevronDown,
  Star,
  Zap,
  Sparkles
} from 'lucide-react';

export interface CategoryOption {
  id: string;
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
}

export interface TagOption {
  name: string;
  count: number;
}

export type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'fastest';
export type BrowseTab = 'food' | 'restaurants' | 'neighborhoods';

interface DishesFilterBarProps {
  browseTab: BrowseTab;
  onSelectBrowseTab: (tab: BrowseTab) => void;
  restaurantCount?: number;
  quickFilter: string;
  onSelectQuickFilter: (filterId: string) => void;
  favoritesCount?: number;
  categories: CategoryOption[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  tags: TagOption[];
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  totalResults: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const DishesFilterBar: React.FC<DishesFilterBarProps> = ({
  browseTab,
  onSelectBrowseTab,
  restaurantCount = 14,
  quickFilter,
  onSelectQuickFilter,
  favoritesCount = 0,
  categories,
  selectedCategory,
  onSelectCategory,
  tags,
  selectedTag,
  onSelectTag,
  totalResults,
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  const [showMoreTags, setShowMoreTags] = useState(false);

  // The primary tags explicitly requested by user
  const primaryTagNames = [
    '#FriedChicken',
    '#Jollof',
    '#Shawarma',
    '#Burgers',
    '#Cakes',
    '#Amala',
    '#Swallow',
    '#LocalDelicacies'
  ];

  // Separate tags into primary (requested) and extra
  const primaryTags = tags.filter(t => primaryTagNames.includes(t.name));
  const extraTags = tags.filter(t => !primaryTagNames.includes(t.name));

  // Determine if active tag is in extra tags
  const isExtraTagActive = extraTags.some(t => t.name.toLowerCase() === selectedTag.toLowerCase());

  const currentCategoryObj = categories.find(c => c.id === selectedCategory);

  const getQuickFilterLabel = (key: string) => {
    switch (key) {
      case 'favorites': return `Starred Favorites (${favoritesCount})`;
      case 'under2500': return '🔥 Under ₦2,500';
      case 'tier1': return '⚡ Tier 1 Fast (15m)';
      case 'catfish': return '🐟 Fresh Catfish Today';
      default: return key;
    }
  };

  return (
    <motion.div 
      id="unified-marketplace-filter-command"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-surface-container-low/90 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-3.5 sm:p-5 space-y-4 sm:space-y-4.5 shadow-xs"
    >
      
      {/* 1. TOP SECTION: Master Browse Navigation + Quick Filters Deck */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
        
        {/* Browse Mode Segmented Switcher (Browse by Food, Browse Restaurants, Browse Neighborhoods) */}
        <div 
          role="tablist"
          aria-label="Marketplace scope"
          className="relative flex items-center gap-1 bg-surface-container-high/80 p-1 rounded-xl text-xs sm:text-sm font-semibold overflow-x-auto custom-scroll w-full lg:w-auto"
        >
          {/* Tab 1: Browse by Food */}
          <button
            role="tab"
            aria-selected={browseTab === 'food'}
            onClick={() => onSelectBrowseTab('food')}
            className={`relative z-10 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
              browseTab === 'food'
                ? 'text-on-secondary font-bold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/60'
            }`}
          >
            {browseTab === 'food' && (
              <motion.div
                layoutId="activeBrowseTabBg"
                className="absolute inset-0 bg-secondary rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Utensils className="w-4 h-4" />
            <span>Browse by Food</span>
          </button>

          {/* Tab 2: Browse Restaurants (14) */}
          <button
            role="tab"
            aria-selected={browseTab === 'restaurants'}
            onClick={() => onSelectBrowseTab('restaurants')}
            className={`relative z-10 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
              browseTab === 'restaurants'
                ? 'text-on-secondary font-bold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/60'
            }`}
          >
            {browseTab === 'restaurants' && (
              <motion.div
                layoutId="activeBrowseTabBg"
                className="absolute inset-0 bg-secondary rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Store className="w-4 h-4" />
            <span>Browse Restaurants ({restaurantCount})</span>
          </button>

          {/* Tab 3: Browse Neighborhoods */}
          <button
            role="tab"
            aria-selected={browseTab === 'neighborhoods'}
            onClick={() => onSelectBrowseTab('neighborhoods')}
            className={`relative z-10 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap ${
              browseTab === 'neighborhoods'
                ? 'text-on-secondary font-bold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/60'
            }`}
          >
            {browseTab === 'neighborhoods' && (
              <motion.div
                layoutId="activeBrowseTabBg"
                className="absolute inset-0 bg-secondary rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <MapPin className="w-4 h-4" />
            <span>Browse Neighborhoods</span>
          </button>
        </div>

        {/* Quick Filters Row (Quick: Starred Favorites, Under 2500, Tier 1 Fast, Fresh Catfish) */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll py-0.5 text-xs whitespace-nowrap w-full lg:w-auto">
          <span className="text-on-surface-variant font-bold text-[11px] px-1 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick:</span>
          </span>

          {/* Quick: Starred Favorites (4) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectQuickFilter(quickFilter === 'favorites' ? 'none' : 'favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer text-xs shrink-0 ${
              quickFilter === 'favorites'
                ? 'bg-amber-400 text-stone-950 border-amber-500 font-bold shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:border-amber-400'
            }`}
            title="Show your saved favorite dishes"
          >
            <Star className={`w-3.5 h-3.5 ${quickFilter === 'favorites' ? 'fill-stone-950 text-stone-950' : 'text-amber-500 fill-amber-500'}`} />
            <span>Starred Favorites ({favoritesCount})</span>
          </motion.button>

          {/* Quick: 🔥 Under ₦2,500 */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectQuickFilter(quickFilter === 'under2500' ? 'none' : 'under2500')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer text-xs shrink-0 ${
              quickFilter === 'under2500'
                ? 'bg-primary text-white border-primary font-bold shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:border-primary'
            }`}
          >
            <span>🔥 Under ₦2,500</span>
          </motion.button>

          {/* Quick: ⚡ Tier 1 Fast (15m) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectQuickFilter(quickFilter === 'tier1' ? 'none' : 'tier1')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer text-xs shrink-0 ${
              quickFilter === 'tier1'
                ? 'bg-primary text-white border-primary font-bold shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:border-primary'
            }`}
          >
            <span>⚡ Tier 1 Fast (15m)</span>
          </motion.button>

          {/* Quick: 🐟 Fresh Catfish Today */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectQuickFilter(quickFilter === 'catfish' ? 'none' : 'catfish')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer text-xs shrink-0 ${
              quickFilter === 'catfish'
                ? 'bg-primary text-white border-primary font-bold shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:border-primary'
            }`}
          >
            <span>🐟 Fresh Catfish Today</span>
          </motion.button>
        </div>

      </div>

      {/* 2. SPECIFIC CONTROLS FOR 'Browse by Food' MODE */}
      {browseTab === 'food' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Sub-header: Filter Title, Live Count, Sorting, and Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
            
            {/* Left: Filter Details */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-sm sm:text-base text-on-surface">
                    Filter Dishes
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface-variant font-price-display">
                    {totalResults} {totalResults === 1 ? 'Dish' : 'Dishes'}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant hidden xs:block">
                  Select menu category and authentic Confluence tags
                </p>
              </div>
            </div>

            {/* Right: Sort & Reset */}
            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
              <div className="relative flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1.5 rounded-xl border border-outline-variant/30 text-xs text-on-surface">
                <ArrowUpDown className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-on-surface-variant font-medium text-[11px] hidden md:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                  className="bg-transparent font-bold text-xs text-on-surface focus:outline-none cursor-pointer pr-1"
                  aria-label="Sort dishes"
                >
                  <option value="featured">Featured / Best Sellers</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated ★</option>
                  <option value="fastest">Fastest Prep Time</option>
                </select>
              </div>

              {hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Reset</span>
                </motion.button>
              )}
            </div>

          </div>

          {/* Dish Categories Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <span>Categories</span>
              <span className="text-[10px] font-normal lowercase">Select one</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scroll">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-high'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <Icon className={`w-3.5 h-3.5 transition-colors ${
                      isSelected ? 'text-amber-300' : 'text-primary group-hover:scale-110'
                    }`} />
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-price-display font-black transition-colors ${
                      isSelected 
                        ? 'bg-white/25 text-white' 
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {cat.count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Popular Tags Filter Strip */}
          <div className="space-y-2 pt-1 border-t border-outline-variant/20">
            <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>Popular Tags</span>
              </span>
              {extraTags.length > 0 && (
                <button
                  onClick={() => setShowMoreTags(!showMoreTags)}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>{showMoreTags ? 'Show less' : `+${extraTags.length} more`}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showMoreTags ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Tag Pills Container */}
            <div className="flex flex-wrap items-center gap-1.5">
              
              {/* 'All Tags' Pill */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectTag('all')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedTag === 'all'
                    ? 'bg-secondary text-on-secondary border-secondary font-bold shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {selectedTag === 'all' && <Check className="w-3 h-3 text-white" />}
                <span>All Tags</span>
              </motion.button>

              {/* Primary Tags explicitly requested */}
              {primaryTags.map(tag => {
                const isSelected = selectedTag.toLowerCase() === tag.name.toLowerCase();

                return (
                  <motion.button
                    key={tag.name}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelectTag(isSelected ? 'all' : tag.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-secondary text-on-secondary border-secondary font-bold shadow-xs'
                        : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-secondary/40 hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                    title={`Filter dishes tagged ${tag.name}`}
                  >
                    {isSelected ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <span className="text-secondary font-bold">#</span>
                    )}
                    <span>{tag.name.replace(/^#/, '')}</span>
                    {tag.count > 0 && (
                      <span className={`text-[10px] px-1 py-0.2 rounded-md font-price-display font-semibold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant/80'
                      }`}>
                        {tag.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}

              {/* Expanded Extra Tags */}
              <AnimatePresence>
                {(showMoreTags || isExtraTagActive) && extraTags.map(tag => {
                  const isSelected = selectedTag.toLowerCase() === tag.name.toLowerCase();

                  return (
                    <motion.button
                      key={tag.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSelectTag(isSelected ? 'all' : tag.name)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-secondary text-on-secondary border-secondary font-bold shadow-xs'
                          : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-secondary/40 hover:text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <span className="text-secondary font-bold">#</span>
                      )}
                      <span>{tag.name.replace(/^#/, '')}</span>
                      {tag.count > 0 && (
                        <span className={`text-[10px] px-1 py-0.2 rounded-md font-price-display font-semibold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant/80'
                        }`}>
                          {tag.count}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>

            </div>
          </div>

        </div>
      )}

      {/* 3. ACTIVE FILTERS BREADCRUMBS ROW (Visible when any filter applied) */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-2 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-xs overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-on-surface-variant">Active Filters:</span>

              {/* Quick Filter Chip */}
              {quickFilter !== 'none' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 text-stone-900 dark:text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                  <span>{getQuickFilterLabel(quickFilter)}</span>
                  <button 
                    onClick={() => onSelectQuickFilter('none')}
                    className="hover:bg-amber-400/30 p-0.5 rounded-full cursor-pointer"
                    title="Remove quick filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Category Chip */}
              {selectedCategory !== 'all' && currentCategoryObj && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 font-bold text-[11px]">
                  <span>Category: {currentCategoryObj.label}</span>
                  <button 
                    onClick={() => onSelectCategory('all')}
                    className="hover:text-primary-container p-0.5 rounded-full hover:bg-primary/20 cursor-pointer"
                    title="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Tag Chip */}
              {selectedTag !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/25 font-bold text-[11px]">
                  <span>Tag: {selectedTag}</span>
                  <button 
                    onClick={() => onSelectTag('all')}
                    className="hover:text-secondary p-0.5 rounded-full hover:bg-secondary/20 cursor-pointer"
                    title="Remove tag filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Sort Chip */}
              {sortBy !== 'featured' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary/15 text-tertiary border border-tertiary/25 font-bold text-[11px]">
                  <span>Sorted</span>
                  <button 
                    onClick={() => onSortChange('featured')}
                    className="hover:text-tertiary p-0.5 rounded-full hover:bg-tertiary/20 cursor-pointer"
                    title="Reset sort to featured"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={onResetFilters}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer ml-auto"
            >
              Clear All
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
