import React, { useState } from 'react';
import { 
  MapPin, 
  Timer, 
  Bike, 
  Store, 
  ArrowLeft, 
  Star, 
  Plus, 
  Check, 
  ShieldCheck, 
  Phone, 
  Flame, 
  UtensilsCrossed, 
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { FoodItem, Restaurant, DeliveryTier } from '../types';
import { RESTAURANTS_DATA, FOOD_ITEMS_DATA } from '../data/mockData';

interface ZoneVendorsDirectoryProps {
  zoneKey?: string; // 'tier3' | 'tier1' | 'tier2' | 'felele-nataco-ganaja' | etc.
  onSelectVendor: (vendorId: string) => void;
  onAddToCart: (item: FoodItem) => void;
  onBack: () => void;
  favoriteFoodIds?: string[];
  onToggleFavorite?: (id: string) => void;
}

interface SubLocalityGroup {
  id: string;
  name: string;
  subtitle: string;
  vendors: Restaurant[];
}

export const ZoneVendorsDirectory: React.FC<ZoneVendorsDirectoryProps> = ({
  zoneKey = 'tier3',
  onSelectVendor,
  onAddToCart,
  onBack,
  favoriteFoodIds = [],
  onToggleFavorite
}) => {
  const [activeSubLocalityFilter, setActiveSubLocalityFilter] = useState<string>('all');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const handleAdd = (dish: FoodItem) => {
    onAddToCart(dish);
    setAddedItemNotice(dish.name);
    setTimeout(() => setAddedItemNotice(null), 3000);
  };

  // Determine current Zone configuration
  const isTier3 = zoneKey.includes('tier3') || zoneKey.includes('felele') || zoneKey.includes('nataco') || zoneKey.includes('ganaja');
  const isTier2 = zoneKey.includes('tier2') || zoneKey.includes('zone8') || zoneKey.includes('sarkin');

  const zoneMeta = isTier3 ? {
    title: 'Vendors in Felele, Nataco & Ganaja Village',
    tierLabel: 'Tier 3 Peripheral Zone Axis',
    dispatchFee: 2000,
    eta: '25–40 mins avg',
    activeRidersCount: 8,
    description: 'Extended delivery corridor covering Federal University Lokoja (FUL) campus corridors, Abuja-Lokoja Expressway junction, and Ganaja waterside road margins.',
    hotNotice: 'Hot insulated thermal dispatch guaranteed. Riders are pre-positioned at Felele junction, Nataco roundabout, and Ganaja waterside.'
  } : isTier2 ? {
    title: 'Vendors in Zone 8 Secretariat & Sarkin Noma',
    tierLabel: 'Tier 2 Mid-Range Zone Axis',
    dispatchFee: 1200,
    eta: '15–25 mins avg',
    activeRidersCount: 14,
    description: 'Government civil service complex, ministries, state house corridors, and riverside settlements.',
    hotNotice: 'Rapid desk and office gate delivery available across all ministries and secretariats.'
  } : {
    title: 'Vendors in Lokongoma, Paparanda & GRA',
    tierLabel: 'Tier 1 Core Urban Cluster',
    dispatchFee: 800,
    eta: '10–15 mins avg',
    activeRidersCount: 26,
    description: 'High courier density zone covering Paparanda Square, Central Market, Lokongoma Phase 1 & 2, and GRA.',
    hotNotice: 'Express 10–15 mins dispatch with highest rider density and 10:00 AM ready-pot guarantee.'
  };

  // Build the ordered sub-locality groups
  const subLocalityGroups: SubLocalityGroup[] = isTier3 ? [
    {
      id: 'felele',
      name: 'Vendors in Felele',
      subtitle: 'Federal University Lokoja (FUL) Campus Corridor, Old Poly Quarters & Bypass Axis',
      vendors: RESTAURANTS_DATA.filter(r => 
        r.id === 'shawarma-grills' || 
        r.id === 'spag-king' || 
        r.id === 'felele-buka' ||
        r.subLocality === 'Felele' ||
        r.address.toLowerCase().includes('felele') ||
        r.address.toLowerCase().includes('poly')
      )
    },
    {
      id: 'nataco',
      name: 'Vendors in Nataco',
      subtitle: 'A2 Abuja-Lokoja Highway Corridor & Interstate Transit Terminals',
      vendors: RESTAURANTS_DATA.filter(r => 
        r.id === 'gt-foods' || 
        r.id === 'nataco-travelers-buka' ||
        r.subLocality === 'Nataco' ||
        r.address.toLowerCase().includes('nataco')
      )
    },
    {
      id: 'ganaja-village',
      name: 'Vendors in Ganaja Village',
      subtitle: 'Ganaja Waterside Jetty, Ajaokuta Road Margins & Ganaja Highway Corridor',
      vendors: RESTAURANTS_DATA.filter(r => 
        r.id === 'ganaja-village-buka' || 
        r.id === 'foodcastle' || 
        r.id === 'treasures-bakery' ||
        r.subLocality === 'Ganaja Village' ||
        r.address.toLowerCase().includes('ganaja')
      )
    }
  ] : isTier2 ? [
    {
      id: 'zone-8',
      name: 'Vendors in Zone 8 Secretariat',
      subtitle: 'Kogi State Secretariat Complex & Ministry Headquarters',
      vendors: RESTAURANTS_DATA.filter(r => r.id === 'biteease' || r.tier === 'Tier 2')
    },
    {
      id: 'sarkin-noma',
      name: 'Vendors in Sarkin Noma & Meme River Axis',
      subtitle: 'Riverside Buka Hubs & Traditional Fish Kitchens',
      vendors: RESTAURANTS_DATA.filter(r => r.id === 'locafud-kitchen' || r.id === 'olive-food-court')
    },
    {
      id: 'hajiya-k',
      name: 'Vendors in Hajiya K Plaza & Cantonment Axis',
      subtitle: 'Township Plaza & Quick Lunch Spot',
      vendors: RESTAURANTS_DATA.filter(r => r.id === 'amak-restaurant')
    }
  ] : [
    {
      id: 'lokongoma',
      name: 'Vendors in Lokongoma Phase 1 & 2',
      subtitle: 'High-Density Residential Hub & Youth Hotspots',
      vendors: RESTAURANTS_DATA.filter(r => r.id === 'craving-spot' || r.id === 'treasures-lokongoma')
    },
    {
      id: 'paparanda',
      name: 'Vendors in Paparanda & Apata',
      subtitle: 'Central Commercial District, Market Strip & Firewood Bukas',
      vendors: RESTAURANTS_DATA.filter(r => r.id === 'chicken-republic' || r.id === 'mama-ngozi')
    },
    {
      id: 'gra-adankolo',
      name: 'Vendors in GRA & Adankolo',
      subtitle: 'Township, Hospital Road & Fresh Catfish Markets',
      vendors: RESTAURANTS_DATA.filter(r => r.id === 'misi-t-gra' || r.id === 'misi-t-adankolo')
    }
  ];

  // Helper to get top signature dishes for a vendor
  const getVendorDishes = (vendorId: string): FoodItem[] => {
    return FOOD_ITEMS_DATA.filter(f => f.vendorId === vendorId).slice(0, 3);
  };

  const totalVendorsCount = subLocalityGroups.reduce((acc, g) => acc + g.vendors.length, 0);

  // Filter groups according to active filter
  const displayedGroups = activeSubLocalityFilter === 'all' 
    ? subLocalityGroups 
    : subLocalityGroups.filter(g => g.id === activeSubLocalityFilter);

  return (
    <div className="space-y-6 pb-20 animate-fade-in" id="zone-vendors-directory-view">
      {/* Toast Notification */}
      {addedItemNotice && (
        <div className="fixed bottom-20 right-6 z-50 bg-secondary text-on-secondary px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4" />
          <span>Added &quot;{addedItemNotice}&quot; to Chop Cart!</span>
        </div>
      )}

      {/* Breadcrumbs Navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-2">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap">
          <button 
            onClick={onBack}
            className="hover:text-primary transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </button>
          <span>/</span>
          <button 
            onClick={onBack}
            className="hover:text-primary transition-colors font-medium cursor-pointer"
          >
            Delivery Zones
          </button>
          <span>/</span>
          <span className="text-primary font-bold">{zoneMeta.title}</span>
        </nav>
      </div>

      {/* Zone Header Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-gradient-to-br from-surface-container-high via-surface-container-low to-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 md:p-7 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-primary text-on-primary px-3 py-1 rounded-full font-bold shadow-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {zoneMeta.tierLabel}
                </span>
                <span className="bg-secondary/15 text-secondary px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  {zoneMeta.eta}
                </span>
                <span className="bg-surface-container-highest text-on-surface px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-primary" />
                  {zoneMeta.activeRidersCount} Active Okada Riders
                </span>
              </div>

              <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
                {zoneMeta.title}
              </h1>

              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                {zoneMeta.description}
              </p>

              <div className="pt-1 flex items-center gap-2 text-xs text-primary font-medium">
                <Flame className="w-4 h-4 text-primary shrink-0" />
                <span>{zoneMeta.hotNotice}</span>
              </div>
            </div>

            {/* Quick Tariff Summary Card */}
            <div className="bg-surface-container-lowest/90 border border-outline-variant/30 rounded-xl p-4 shrink-0 shadow-xs flex flex-col justify-between space-y-3 min-w-[220px]">
              <div>
                <span className="text-[10px] text-on-surface-variant block uppercase font-bold tracking-wider">Flat Dispatch Tariff</span>
                <div className="font-price-display text-2xl md:text-3xl font-extrabold text-primary">
                  ₦{zoneMeta.dispatchFee.toLocaleString()}
                </div>
                <span className="text-[11px] text-on-surface-variant">Per order anywhere in this corridor</span>
              </div>

              <button
                onClick={onBack}
                className="w-full py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Neighborhood</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-locality Quick Jump / Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto custom-scroll py-1 text-xs">
          <button
            onClick={() => setActiveSubLocalityFilter('all')}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSubLocalityFilter === 'all'
                ? 'bg-secondary text-on-secondary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/30'
            }`}
          >
            All Axis Locations ({totalVendorsCount} Vendors)
          </button>

          {subLocalityGroups.map((group, idx) => (
            <button
              key={group.id}
              onClick={() => setActiveSubLocalityFilter(group.id)}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubLocalityFilter === group.id
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/30'
              }`}
            >
              <span>{idx + 1}. {group.name.replace('Vendors in ', '')} ({group.vendors.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sequential Vendor Sections (Felele -> Nataco -> Ganaja Village) */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10">
        {displayedGroups.map((group, groupIndex) => (
          <section 
            key={group.id}
            id={`section-${group.id}`}
            className="space-y-4"
          >
            {/* Section Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                    {groupIndex + 1}
                  </span>
                  <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
                    {group.name}
                  </h2>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 ml-8">
                  {group.subtitle}
                </p>
              </div>
              <span className="text-xs text-tertiary bg-tertiary/10 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                {group.vendors.length} Verified Kitchens
              </span>
            </div>

            {/* Vendors Cards in this sub-axis */}
            <div className="space-y-6">
              {group.vendors.map((vendor) => {
                const vendorDishes = getVendorDishes(vendor.id);
                return (
                  <div 
                    key={vendor.id}
                    id={`vendor-card-${vendor.id}`}
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Top Vendor Header Bar */}
                    <div className="p-5 md:p-6 bg-surface-container-low/40 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                          {vendor.shortCode || vendor.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                              {vendor.name}
                            </h3>
                            {vendor.verified && (
                              <span className="bg-tertiary/15 text-tertiary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3" />
                                Verified Buka
                              </span>
                            )}
                            <span className="text-xs bg-surface-container text-on-surface px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              4.9 ★
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {vendor.address}
                            </span>
                            {vendor.phone && vendor.phone !== 'Unavailable' && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-secondary" />
                                {vendor.phone}
                              </span>
                            )}
                          </div>

                          {vendor.primaryOfferings && (
                            <p className="text-xs text-on-surface-variant line-clamp-1 italic pt-0.5">
                              &ldquo;{vendor.primaryOfferings}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Prominent Action Button: Order from this Vendor */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          id={`order-vendor-btn-${vendor.id}`}
                          onClick={() => onSelectVendor(vendor.id)}
                          className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          <UtensilsCrossed className="w-4 h-4" />
                          <span>Order from {vendor.name}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Featured Dishes Section under this vendor */}
                    <div className="p-4 md:p-6 bg-surface-container-lowest">
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="font-bold text-on-surface flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-primary" />
                          Popular Dishes from this Kitchen
                        </span>
                        <button
                          onClick={() => onSelectVendor(vendor.id)}
                          className="text-secondary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>View Full Menu</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      {vendorDishes.length === 0 ? (
                        <div className="p-4 rounded-xl bg-surface-container-low text-center text-xs text-on-surface-variant">
                          <span>Standard daily fresh pots available. Click &quot;Order from {vendor.name}&quot; to view complete offerings.</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {vendorDishes.map((dish) => {
                            const isStarred = favoriteFoodIds.includes(dish.id);
                            return (
                              <div
                                key={dish.id}
                                className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-3 flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
                              >
                                <div className="flex gap-3">
                                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                                    <img 
                                      src={dish.imageUrl} 
                                      alt={dish.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    {dish.badge && (
                                      <span className="absolute bottom-1 left-1 bg-primary text-on-primary text-[9px] font-bold px-1 rounded">
                                        {dish.badge}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-start justify-between gap-1">
                                      <h4 className="font-headline text-xs font-bold text-on-surface line-clamp-2">
                                        {dish.name}
                                      </h4>
                                      <button
                                        type="button"
                                        onClick={() => onToggleFavorite && onToggleFavorite(dish.id)}
                                        className="text-outline hover:text-amber-500 cursor-pointer shrink-0"
                                      >
                                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                                      </button>
                                    </div>
                                    <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                                      {dish.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                                  <span className="font-price-display text-sm font-bold text-primary">
                                    ₦{dish.price.toLocaleString()}
                                  </span>

                                  <button
                                    onClick={() => handleAdd(dish)}
                                    className="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add to Cart</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Corridor Bottom Advice */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-on-surface">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>Ready to place your meal order? We combine dispatch routes across Felele, Nataco, and Ganaja Village with zero delays.</span>
          </div>
          <button
            onClick={onBack}
            className="text-secondary font-bold hover:underline cursor-pointer shrink-0"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};
