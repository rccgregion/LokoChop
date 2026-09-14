import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem, Restaurant, ActiveView } from '../types';
import { RESTAURANTS_DATA, FOOD_ITEMS_DATA } from '../data/mockData';
import { CustomerReviews } from '../components/CustomerReviews';
import { Interactive3DCateringHero } from '../components/Interactive3DCateringHero';
import { NeighborhoodPillPicker } from '../components/NeighborhoodPillPicker';
import { LiveFilterDock, MarketplaceBrowseMode } from '../components/LiveFilterDock';
import { InteractiveDishCard } from '../components/InteractiveDishCard';
import { 
  Timer, 
  MapPin, 
  ChevronRight, 
  RotateCcw, 
  UtensilsCrossed, 
  Store,
  Users, 
  Star,
  Search,
  X
} from 'lucide-react';

interface MarketplaceViewProps {
  onAddToCart: (item: FoodItem) => void;
  onNavigate: (view: ActiveView, vendorId?: string, zoneKey?: string) => void;
  searchQuery: string;
  onSearchChange?: (q: string) => void;
  favoriteFoodIds?: string[];
  onToggleFavorite?: (id: string) => void;
  selectedDeliveryLocation?: string;
  onSelectDeliveryLocation?: (locId: string) => void;
  cartItems?: { id: string; quantity: number }[];
  onUpdateCartQty?: (id: string, delta: number) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onAddToCart,
  onNavigate,
  searchQuery,
  onSearchChange,
  favoriteFoodIds = [],
  onToggleFavorite,
  selectedDeliveryLocation = 'lokongoma-phase-1',
  onSelectDeliveryLocation,
  cartItems = [],
  onUpdateCartQty,
}) => {
  // Browsing modes: 'vendors' (Browse Restaurants by default) or 'dishes' (Browse by Food)
  const [browseMode, setBrowseMode] = useState<MarketplaceBrowseMode>('vendors');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [localSearch, setLocalSearch] = useState<string>('');

  const effectiveSearch = searchQuery || localSearch;

  // Catering WhatsApp Configuration
  const CATERING_WHATSAPP_PHONE = '2349074072454';
  const CATERING_WHATSAPP_MESSAGE = `Hi LokoChop! I'm hosting an event in Lokoja and need a caterer. Here are my details:
Event type:
Date:
Number of guests:
Location/venue:
Budget range:
Please connect me with a suitable vendor. Thanks!`;
  const CATERING_WHATSAPP_URL = `https://wa.me/${CATERING_WHATSAPP_PHONE}?text=${encodeURIComponent(CATERING_WHATSAPP_MESSAGE)}`;

  // Filtered Dishes
  const filteredDishes = useMemo(() => {
    return FOOD_ITEMS_DATA.filter((dish) => {
      // 1. Search Query
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase().trim();
        const matchName = dish.name.toLowerCase().includes(q);
        const matchDesc = dish.description.toLowerCase().includes(q);
        const matchVendor = dish.vendorName ? dish.vendorName.toLowerCase().includes(q) : false;
        const matchCat = dish.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchVendor && !matchCat) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        const catLower = dish.category.toLowerCase();
        if (selectedCategory === 'rice') {
          if (!catLower.includes('rice') && !dish.name.toLowerCase().includes('jollof') && !dish.name.toLowerCase().includes('fried rice')) return false;
        } else if (selectedCategory === 'swallow') {
          if (!catLower.includes('swallow') && !catLower.includes('soup') && !dish.name.toLowerCase().includes('amala') && !dish.name.toLowerCase().includes('egusi') && !dish.name.toLowerCase().includes('semo')) return false;
        } else if (selectedCategory === 'grill') {
          if (!catLower.includes('grill') && !catLower.includes('suya') && !dish.name.toLowerCase().includes('chicken') && !dish.name.toLowerCase().includes('fish') && !dish.name.toLowerCase().includes('turkey')) return false;
        } else if (selectedCategory === 'pastries') {
          if (!catLower.includes('pastr') && !catLower.includes('bakery') && !dish.name.toLowerCase().includes('shawarma') && !dish.name.toLowerCase().includes('burger') && !dish.name.toLowerCase().includes('pie')) return false;
        } else if (selectedCategory === 'drinks') {
          if (!catLower.includes('drink') && !catLower.includes('beverage') && !dish.name.toLowerCase().includes('zobo') && !dish.name.toLowerCase().includes('juice')) return false;
        } else if (selectedCategory === 'family') {
          if (!dish.name.toLowerCase().includes('family') && !dish.name.toLowerCase().includes('platter') && !dish.name.toLowerCase().includes('combo') && !dish.badge?.toLowerCase().includes('family')) return false;
        }
      }

      // 3. Quick Filters
      if (quickFilter === 'under2500') {
        if (dish.price > 2500) return false;
      } else if (quickFilter === 'tier1') {
        // Fast Tier 1 vendors
        const tier1VendorIds = ['chicken-republic', 'craving-spot', 'foodcastle', 'charlies-buka', 'mama-comfort', 'mr-biggs'];
        if (dish.vendorId && !tier1VendorIds.includes(dish.vendorId)) return false;
      } else if (quickFilter === 'favorites') {
        if (!favoriteFoodIds.includes(dish.id)) return false;
      } else if (quickFilter === 'catfish') {
        const isCatfish = dish.name.toLowerCase().includes('catfish') || dish.description.toLowerCase().includes('catfish');
        if (!isCatfish) return false;
      }

      return true;
    });
  }, [effectiveSearch, selectedCategory, quickFilter, favoriteFoodIds]);

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return RESTAURANTS_DATA.filter((vendor) => {
      // 1. Search Query
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase().trim();
        const qClean = q.replace(/^#/, '');
        const matchSearch =
          vendor.name.toLowerCase().includes(q) ||
          vendor.address.toLowerCase().includes(q) ||
          vendor.zoneText.toLowerCase().includes(q) ||
          (vendor.primaryOfferings && vendor.primaryOfferings.toLowerCase().includes(q)) ||
          (vendor.signatureDishes && vendor.signatureDishes.some((d) => d.toLowerCase().includes(q))) ||
          vendor.tags.some((t) => {
            const tClean = t.toLowerCase().replace(/^#/, '');
            return tClean.includes(qClean) || t.toLowerCase().includes(q);
          });

        if (!matchSearch) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'family') {
          if (!vendor.hasFamilyMeals) return false;
        } else if (selectedCategory === 'premium') {
          if (!vendor.hasPremiumMenu) return false;
        } else if (selectedCategory === 'rice') {
          const matchesRice =
            vendor.tags.some((t) => t.toLowerCase().includes('jollof') || t.toLowerCase().includes('rice')) ||
            (vendor.primaryOfferings && vendor.primaryOfferings.toLowerCase().includes('rice'));
          if (!matchesRice) return false;
        } else if (selectedCategory === 'swallow') {
          const matchesSwallow =
            vendor.tags.some((t) => t.toLowerCase().includes('amala') || t.toLowerCase().includes('swallow') || t.toLowerCase().includes('soup')) ||
            (vendor.primaryOfferings && (vendor.primaryOfferings.toLowerCase().includes('swallow') || vendor.primaryOfferings.toLowerCase().includes('soup')));
          if (!matchesSwallow) return false;
        } else if (selectedCategory === 'grill') {
          const matchesGrill =
            vendor.tags.some((t) => t.toLowerCase().includes('suya') || t.toLowerCase().includes('grill') || t.toLowerCase().includes('chicken')) ||
            (vendor.primaryOfferings && (vendor.primaryOfferings.toLowerCase().includes('grill') || vendor.primaryOfferings.toLowerCase().includes('chicken')));
          if (!matchesGrill) return false;
        } else if (selectedCategory === 'pastries') {
          const matchesPastries =
            vendor.tags.some((t) => t.toLowerCase().includes('bakery') || t.toLowerCase().includes('shawarma') || t.toLowerCase().includes('burger')) ||
            (vendor.primaryOfferings && vendor.primaryOfferings.toLowerCase().includes('shawarma'));
          if (!matchesPastries) return false;
        } else if (selectedCategory === 'drinks') {
          const matchesDrinks =
            vendor.tags.some((t) => t.toLowerCase().includes('drink') || t.toLowerCase().includes('zobo')) ||
            (vendor.primaryOfferings && vendor.primaryOfferings.toLowerCase().includes('drink'));
          if (!matchesDrinks) return false;
        }
      }

      // 3. Quick Filters
      if (quickFilter === 'tier1') {
        if (vendor.tier !== 'Tier 1') return false;
      } else if (quickFilter === 'catfish') {
        const matchesFish =
          vendor.tags.some((t) => t.toLowerCase().includes('fish') || t.toLowerCase().includes('catfish')) ||
          (vendor.signatureDishes && vendor.signatureDishes.some((d) => d.toLowerCase().includes('fish') || d.toLowerCase().includes('catfish')));
        if (!matchesFish) return false;
      }

      return true;
    });
  }, [effectiveSearch, selectedCategory, quickFilter]);

  const hasActiveFilters = Boolean(effectiveSearch) || selectedCategory !== 'all' || Boolean(quickFilter);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setQuickFilter('');
    setLocalSearch('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach((it) => map.set(it.id, it.quantity));
    return map;
  }, [cartItems]);

  return (
    <div className="space-y-6 pb-20 sm:pb-16 w-full">
      
      {/* 1. Interactive 3D Event Catering Hero Section with Parallax Ingredients & Liquid WhatsApp CTA */}
      <Interactive3DCateringHero whatsAppUrl={CATERING_WHATSAPP_URL} />

      {/* 2. Interactive Neighborhood Zone Pill Picker */}
      <section 
        id="lokoja-neighborhood-selector-section"
        className="w-full max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6"
      >
        <NeighborhoodPillPicker
          selectedLocationId={selectedDeliveryLocation}
          onSelectLocation={(locId) => {
            if (onSelectDeliveryLocation) {
              onSelectDeliveryLocation(locId);
            }
          }}
        />
      </section>

      {/* 3. Floating Sticky Glass Filter Dock */}
      <LiveFilterDock
        browseMode={browseMode}
        onSelectBrowseMode={setBrowseMode}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        quickFilter={quickFilter}
        onSelectQuickFilter={setQuickFilter}
        dishCount={filteredDishes.length}
        vendorCount={filteredVendors.length}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Active Filters Indicator & In-Page Search Bar */}
      <section className="w-full max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/60 shadow-xs">
          
          {/* In-page live search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={effectiveSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              placeholder="Search jollof, amala, catfish, suya, Shawarma, vendors..."
              className="w-full bg-white text-xs pl-10 pr-8 py-2 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/60"
            />
            {effectiveSearch && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  if (onSearchChange) onSearchChange('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-semibold text-on-surface-variant px-1">
            <span>
              Showing <span className="font-bold text-on-surface">{browseMode === 'dishes' ? filteredDishes.length : filteredVendors.length}</span> {browseMode === 'dishes' ? 'hot dishes' : 'verified bukka kitchens'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-primary hover:underline font-bold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>
      </section>

      {/* 5. Main Content Feed (Fluid Layout Transitions via AnimatePresence) */}
      <section 
        id="marketplace-main-feed"
        className="w-full max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6 min-h-[400px]"
      >
        <AnimatePresence mode="wait">
          {browseMode === 'dishes' ? (
            /* ============================================================= */
            /* DISHES FEED (Interactive Dish Cards with Fly-To-Cart)         */
            /* ============================================================= */
            <motion.div
              key={`dishes-${selectedCategory}-${quickFilter}-${effectiveSearch}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
            >
              {filteredDishes.map((dish) => (
                <InteractiveDishCard
                  key={dish.id}
                  dish={dish}
                  onAddToCart={onAddToCart}
                  onOpenVendor={(vId) => onNavigate('vendor-storefront', vId)}
                  isStarred={favoriteFoodIds.includes(dish.id)}
                  onToggleFavorite={onToggleFavorite}
                  currentCartQty={cartQtyMap.get(dish.id) || 0}
                  onUpdateQty={onUpdateCartQty}
                />
              ))}
            </motion.div>
          ) : (
            /* ============================================================= */
            /* VENDORS FEED (Approved Bukkas and Kitchens)                   */
            /* ============================================================= */
            <motion.div
              key={`vendors-${selectedCategory}-${quickFilter}-${effectiveSearch}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredVendors.map((vendor) => (
                <motion.article
                  key={vendor.id}
                  id={`vendor-card-${vendor.id}`}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                  onClick={() => onNavigate('vendor-storefront', vendor.id)}
                  className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-all group shadow-xs hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer"
                >
                  {/* Vendor Photo with Clean Floating Badges */}
                  <div className="relative h-48 overflow-hidden bg-stone-100">
                    <img
                      src={vendor.imageUrl}
                      alt={vendor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Clean Status Badge */}
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-stone-800 border border-stone-200/80 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>{vendor.status}</span>
                    </span>

                    {/* Delivery Time Badge */}
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-stone-800 border border-stone-200/80 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-primary" />
                      <span>{vendor.expectedDeliveryTime}</span>
                    </span>
                  </div>

                  {/* Vendor Details */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3">
                    <div>
                      {/* Zone Chip & Short Code */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-primary tracking-wide">
                          {vendor.zoneText}
                        </span>
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 shrink-0 border border-stone-200/60">
                          {vendor.shortCode}
                        </span>
                      </div>

                      <h3 className="font-headline text-lg font-bold text-stone-900 group-hover:text-primary transition-colors leading-snug line-clamp-1">
                        {vendor.name}
                      </h3>

                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1 line-clamp-1 leading-normal">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{vendor.address}</span>
                      </p>

                      {vendor.primaryOfferings && (
                        <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                          {vendor.primaryOfferings}
                        </p>
                      )}

                      {vendor.signatureDishes && vendor.signatureDishes.length > 0 && (
                        <div className="mt-2 text-xs leading-normal">
                          <span className="font-bold text-primary mr-1">Signatures:</span>
                          <span className="text-stone-600 font-medium">
                            {vendor.signatureDishes.join(' • ')}
                          </span>
                        </div>
                      )}

                      {/* Feature Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {vendor.hasFamilyMeals && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Users className="w-3 h-3 text-amber-600" />
                            <span>Family Meals</span>
                          </span>
                        )}
                        {vendor.hasPremiumMenu && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 text-purple-600" />
                            <span>Premium Menu</span>
                          </span>
                        )}
                        {vendor.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium border border-stone-200/50">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Bottom CTA */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-500 font-medium">
                        Tap to open full menu
                      </span>
                      <button
                        type="button"
                        id={`view-menu-${vendor.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('vendor-storefront', vendor.id);
                        }}
                        className="inline-flex items-center gap-1 bg-primary hover:bg-primary-container text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>View Menu</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {((browseMode === 'dishes' && filteredDishes.length === 0) ||
          (browseMode === 'vendors' && filteredVendors.length === 0)) && (
          <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-white/60 space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-base text-on-surface">
              No results match your selected filter
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Try choosing a different food category, turning off quick filters, or clearing your search keywords.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </section>

      {/* 6. Customer Reviews & Community Trust */}
      <section className="w-full max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6 pt-4">
        <CustomerReviews />
      </section>

    </div>
  );
};
