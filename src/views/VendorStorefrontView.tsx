import React, { useState, useMemo } from 'react';
import { FoodItem, CartItem, ActiveView } from '../types';
import { CustomerReviews } from '../components/CustomerReviews';
import { CateringInquiryModal } from '../components/CateringInquiryModal';
import { RESTAURANTS_DATA, FOOD_ITEMS_DATA } from '../data/mockData';
import { APPROVED_LOKOJA_VENDORS } from '../data/approvedVendors';
import { 
  Star, 
  MapPin, 
  Clock, 
  Bike, 
  CreditCard, 
  Flame, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Info, 
  Lock, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Zap,
  UtensilsCrossed,
  Users,
  Phone,
  ArrowLeft
} from 'lucide-react';

interface VendorStorefrontViewProps {
  onAddToCart: (item: FoodItem) => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onOpenCart: () => void;
  onNavigate: (view: ActiveView, vendorId?: string, zoneFilter?: string) => void;
  favoriteFoodIds?: string[];
  onToggleFavorite?: (id: string) => void;
  selectedVendorId?: string;
}

export const VendorStorefrontView: React.FC<VendorStorefrontViewProps> = ({
  onAddToCart,
  cartItems,
  onUpdateQuantity,
  onOpenCart,
  onNavigate,
  favoriteFoodIds = [],
  onToggleFavorite,
  selectedVendorId = 'craving-spot'
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [isCateringOpen, setIsCateringOpen] = useState<boolean>(false);

  // 1. Resolve vendor details dynamically
  const matchedRestaurant = RESTAURANTS_DATA.find(r => r.id === selectedVendorId) ||
    RESTAURANTS_DATA.find(r => r.id.toLowerCase().includes(selectedVendorId.toLowerCase())) ||
    RESTAURANTS_DATA.find(r => r.name.toLowerCase().includes(selectedVendorId.toLowerCase()));

  const matchedApproved = APPROVED_LOKOJA_VENDORS.find(v => v.vendorId === selectedVendorId || v.id === selectedVendorId) ||
    APPROVED_LOKOJA_VENDORS.find(v => v.name.toLowerCase().includes(selectedVendorId.toLowerCase()));

  const vendorName = matchedRestaurant?.name || matchedApproved?.name || (selectedVendorId === 'craving-spot' ? 'CRAVING SPOT' : "Mama Ngozi's Kitchen");
  const vendorShortCode = matchedRestaurant?.shortCode || vendorName.slice(0, 2).toUpperCase();
  const vendorAddress = matchedRestaurant?.address || matchedApproved?.address || "Somep Plaza, Lokongoma Phase II, IBB Way, opp Kefas Hall, Lokoja";
  const vendorPhone = matchedRestaurant?.phone || matchedApproved?.phone || "+2347019105388";
  const vendorTier = matchedRestaurant?.tier || (matchedApproved?.tier?.includes('3') ? 'Tier 3' : matchedApproved?.tier?.includes('2') ? 'Tier 2' : 'Tier 1');
  const vendorZoneText = matchedRestaurant?.zoneText || matchedRestaurant?.subLocality || (vendorTier === 'Tier 3' ? 'Tier 3 Peripheral' : 'Tier 1 Core (Lokongoma Phase II)');
  const vendorDescription = matchedRestaurant?.primaryOfferings || matchedApproved?.logo?.tagline || (matchedApproved ? `${matchedApproved.category} Kitchen` : undefined) || "Quick-service local dishes, fast food, and customized confections.";
  const verified = matchedRestaurant?.verified ?? true;

  // Pricing & ETA parameters based on Tier
  const baseDispatchFee = vendorTier === 'Tier 3' ? 2000 : vendorTier === 'Tier 2' ? 1200 : 800;
  const deliveryEtaText = vendorTier === 'Tier 3' ? '25–40 mins' : vendorTier === 'Tier 2' ? '15–25 mins' : '10–15 mins';

  // Choose appropriate hero image based on vendor specialty
  const heroBannerUrl = useMemo(() => {
    const lowerName = vendorName.toLowerCase();
    if (lowerName.includes('craving') || lowerName.includes('burger') || lowerName.includes('fries')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRV0OQefmviGOiBtG6RNxPxQOe2pBjCCow6QPIXRDJe0fM1at6GYFO0LrfPOltotDJrA1Z74-t69n5Uu6i5ovnojS8pLGtq0sfy7yquUPOrjBoqxAYnwCkHbG9bhmKVI2GJu05dSxdz199euNVT91IpucMu0pvHeAb18e1aF0HmrnhUKZXuqnpsIBoEVp05mO7pwqTuFkmgM6SHTDQErMOyJCdyJfF9d-z8N1C3CIdcGTgfWj2OnXv';
    }
    if (lowerName.includes('chicken') || lowerName.includes('republic')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ2fc6kYva59eDSnQl7dUmoCEdECgGqiR_OLd4h3xntH1cUPs2nWc_iWagpVvfs17zkLzyWR0fbMB2Ys776F5eyfa2u59e8ioBUCgIX1w8U5mydLYiCqZBlE8CtJCk7wtXiAQlkILwwSpXhBMktVuOqmfRr5piG1HFZev16gYdXBh0leFzS2Rlw2W_By1J81PEJcCfm2lxPuBbTJB56PG1mQXhTPstTD7n7bHSWKjyDeoZKMZOLH0m';
    }
    if (lowerName.includes('spag') || lowerName.includes('pasta')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuApoU1ok_LGtpNP0FItck1UHKCAxbOCcFbxsC3LwizacAtAgUva3r1O_bvN2n0lfniAPoGwWxHnR-8iRPsfXqIiM1KgTQZAClZwFfrp9cRr1IjZorqB1TfvZvp1WAC4vfkVZM4ul_Nb-bhTvBd3zpkZA3eJp8u3sMB06sOZQD4heiqcfNZDrvnMpbiUaCt7iQHJ07cfPsmrBbAPzeBAh-vZq-x3-81JUY9_HLv0M9-ca9c7R-IL6pBR';
    }
    if (lowerName.includes('bakery') || lowerName.includes('pastry') || lowerName.includes('treasures')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjiqAxtL6O1uWomBCb-mHAbuQhBMM7I8MDsti3Z56YMqUsHOhRuXAZ8eLodUHY2k1hpHp5yytN9wYd_PlN7grzoAMza_YjSGte2Us5QJIYcTU2MrIEUcsuqzq0qcZr7ipm5mWKWG6Qfzi1KaVsJY8QZXAE8UT6_YhYHcTVXcWSYHyfwMpNSqDZCWwb_-IMI30DSE0vGOHDimS-H0G0zz14IvoXkyWNUBMeo-OtHcDMs2E2EtSjdhWs';
    }
    if (lowerName.includes('suya') || lowerName.includes('shawarma') || lowerName.includes('grill')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ2fc6kYva59eDSnQl7dUmoCEdECgGqiR_OLd4h3xntH1cUPs2nWc_iWagpVvfs17zkLzyWR0fbMB2Ys776F5eyfa2u59e8ioBUCgIX1w8U5mydLYiCqZBlE8CtJCk7wtXiAQlkILwwSpXhBMktVuOqmfRr5piG1HFZev16gYdXBh0leFzS2Rlw2W_By1J81PEJcCfm2lxPuBbTJB56PG1mQXhTPstTD7n7bHSWKjyDeoZKMZOLH0m';
    }
    // Default native pot
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlIDLDMQNB5aexwNMNdLH_0VukMcrC6HxEbSTwnGHbH3MWM7lKG6ExqHoqUxsvgTTiN8KDR9Oorem4XZISW9G7J8B3xXmVyXv6qsoLiK7NYvNRujOP66tqTMR3BnnMuHy9LDtZm9U32VCJwwBTWuVIhhtkqoUmoB3Aab3OyFspZp1o0LeqsRavv9p4OsF-AIPzoPhPjxEyT2f094-4AFNiENZ6Mvi2cGwAM4H_eRvLMJEEJJSajmjO';
  }, [vendorName]);

  // 2. Fetch dishes for this vendor from FOOD_ITEMS_DATA
  const vendorDishes = useMemo(() => {
    const rawMatches = FOOD_ITEMS_DATA.filter(item => 
      item.vendorId === selectedVendorId ||
      item.vendorId.toLowerCase() === selectedVendorId.toLowerCase() ||
      item.vendorName.toLowerCase() === vendorName.toLowerCase() ||
      item.vendorName.toLowerCase().includes(vendorName.toLowerCase()) ||
      vendorName.toLowerCase().includes(item.vendorName.toLowerCase())
    );

    if (rawMatches.length > 0) {
      return rawMatches;
    }

    // Fallback if specific ID matching missed: create default dynamic items based on signature dishes
    const sigDishes = matchedRestaurant?.signatureDishes || [
      'Chef Special Platter',
      'Spiced Chicken & Fried Rice Meal',
      'Fresh Beverage Pack'
    ];

    return sigDishes.map((dishName, idx) => ({
      id: `${selectedVendorId}-item-${idx}`,
      name: dishName,
      vendorName: vendorName,
      vendorId: selectedVendorId,
      zone: vendorZoneText,
      tier: (vendorTier as any) || 'Tier 1',
      category: (idx % 2 === 0 ? 'rice' : 'grill') as any,
      price: 2500 + (idx * 600),
      prepTime: '15m',
      rating: 4.8,
      description: `Freshly prepared specialty dish from ${vendorName}, crafted to order and dispatched hot.`,
      imageUrl: heroBannerUrl,
      badge: idx === 0 ? 'Signature Dish' : 'Bestseller',
      inStock: true
    }));
  }, [selectedVendorId, vendorName, vendorZoneText, vendorTier, matchedRestaurant, heroBannerUrl]);

  // 3. Extract unique categories from dishes
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    vendorDishes.forEach(d => {
      if (d.category) cats.add(d.category);
    });
    return Array.from(cats);
  }, [vendorDishes]);

  const handleAdd = (item: FoodItem) => {
    onAddToCart(item);
    setAddedItemNotice(item.name);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  const filteredDishes = activeCategory === 'all' 
    ? vendorDishes 
    : vendorDishes.filter(d => d.category === activeCategory);

  const foodSubtotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const calculatedDispatchFee = cartItems.length > 0 ? baseDispatchFee : 0;
  const packagingFee = cartItems.length > 0 ? 300 : 0;
  const totalAmount = foodSubtotal + calculatedDispatchFee + packagingFee;

  const categoryLabels: Record<string, string> = {
    all: `All Items (${vendorDishes.length})`,
    rice: 'Rice & Combos',
    swallow: 'Swallow & Native Soups',
    grill: 'Grills & Shawarma',
    pastries: 'Cakes & Bakery',
    drinks: 'Beverages & Shakes'
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in" id="vendor-storefront-view">
      
      {/* Breadcrumb Bar */}
      <div className="bg-surface-container-low border-b border-outline-variant/20 py-2.5 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-on-surface-variant flex-wrap">
          <button 
            onClick={() => onNavigate('marketplace')} 
            className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <button 
            onClick={() => onNavigate('marketplace')} 
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Restaurants &amp; Bukas
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <span className="text-primary font-bold">{vendorName}</span>
        </div>
      </div>

      {/* Toast Notice */}
      {addedItemNotice && (
        <div className="fixed top-20 right-6 z-50 bg-secondary text-on-secondary px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-fade-in">
          <Check className="w-4 h-4" />
          <span>Added &quot;{addedItemNotice}&quot; to Chop Cart!</span>
        </div>
      )}

      {/* Hero Vendor Banner with Hotlinked Background */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div 
          className="relative rounded-2xl overflow-hidden shadow-xs border border-outline-variant/20 bg-cover bg-center min-h-[340px] md:min-h-[400px] flex flex-col justify-end p-4 md:p-6"
          style={{
            backgroundImage: `url('${heroBannerUrl}')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/50 to-transparent"></div>

          {/* Floating Garri Cream Frosted Overlay Card */}
          <div className="relative z-10 bg-surface-container-low/95 backdrop-blur-md rounded-xl p-4 md:p-6 border border-surface-container-lowest/80 shadow-md">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-primary text-on-primary px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Confluence Kitchen
                  </span>
                  <span className="bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    4.9 ★ (120+ Lokoja reviews)
                  </span>
                  <span className="bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded">
                    {vendorZoneText}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                    {vendorShortCode}
                  </div>
                  <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
                    {vendorName}
                  </h1>
                </div>

                <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                  {vendorDescription}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    {vendorAddress}
                  </span>
                  {vendorPhone && vendorPhone !== 'Unavailable' && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-secondary shrink-0" />
                      {vendorPhone}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Info Pill Badge Box */}
              <div className="flex flex-col items-start gap-1.5 bg-surface-container-high/60 p-3 rounded-lg border border-outline-variant/20 shrink-0 text-xs min-w-[240px]">
                <div className="flex items-center gap-1.5 text-tertiary font-bold">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span>Open Now (Ready Pots by 10:00 AM)</span>
                </div>
                <div className="text-on-surface-variant flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-secondary" />
                  <span>Base Delivery: <strong className="text-on-surface">₦{baseDispatchFee.toLocaleString()}</strong> ({deliveryEtaText})</span>
                </div>
                <div className="text-on-surface-variant flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <span>Direct Bank Transfer to First Bank / OPay</span>
                </div>

                {/* Bulk Order / Catering Inquiry CTA */}
                <button
                  onClick={() => setIsCateringOpen(true)}
                  className="w-full mt-1.5 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-98"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Bulk Order / Catering Inquiry</span>
                </button>
              </div>

            </div>

            {/* Hot Notice Banner */}
            <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center gap-2 text-xs text-primary font-medium">
              <Flame className="w-4 h-4 text-primary shrink-0" />
              <span><strong>Hot Ready-Pots Policy:</strong> Dishes are prepared hot for fast dispatch without cooking delays. WhatsApp stock refreshed every 2 hours!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Tabs */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto custom-scroll py-2 text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-secondary text-on-secondary shadow-xs'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
            }`}
          >
            All Menu Offerings ({vendorDishes.length})
          </button>

          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                activeCategory === cat
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid: Menu Listings (8 Cols) + Sticky Side Cart (4 Cols) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Menu Listings */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
                  Available Today at {vendorName}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Hot &amp; fresh dishes ready for immediate courier dispatch.
                </p>
              </div>
              <span className="text-xs text-tertiary bg-tertiary/10 px-2.5 py-1 rounded-full font-bold">
                {filteredDishes.length} Dishes Ready
              </span>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDishes.map(dish => {
                const isStarred = favoriteFoodIds.includes(dish.id);
                return (
                  <article
                    key={dish.id}
                    id={`dish-card-${dish.id}`}
                    className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-44 w-full bg-surface-container">
                      <img 
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />

                      {/* Star / Favorite Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleFavorite) onToggleFavorite(dish.id);
                        }}
                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer z-10 ${
                          isStarred
                            ? 'bg-amber-400 text-stone-950 ring-2 ring-white'
                            : 'bg-stone-900/60 text-white hover:text-amber-400 hover:bg-stone-900/80'
                        }`}
                        title={isStarred ? 'Remove from starred' : 'Star this dish'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-stone-950 text-stone-950' : ''}`} />
                      </button>

                      {dish.badge && (
                        <span className="absolute top-2 left-2 bg-primary-container text-on-primary text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                          {dish.badge}
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                      <div>
                        <h3 className="font-headline text-base font-bold text-on-surface mb-1">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                        <span className="font-price-display text-lg text-primary font-bold">
                          ₦{dish.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleAdd(dish)}
                          className="bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Order Policy Notice */}
            <div className="rounded-xl p-4 bg-surface-container border border-outline-variant/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-primary font-bold font-headline text-sm">
                <Info className="w-4 h-4 text-primary" />
                <span>Plainspoken Lokoja Chop &amp; Dispatch Policy</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                All orders from <strong>{vendorName}</strong> are verified hot and ready upon placement. Please execute your Direct Bank Transfer to the assigned First Bank escrow account immediately after placing the order. Dispatch riders move within 10 minutes of confirmation. For assistance, reach our direct Confluence WhatsApp helpline at <strong>+2349074072454</strong>.
              </p>
            </div>

            {/* Customer Reviews & Storefront Ratings */}
            <div className="pt-2">
              <CustomerReviews 
                vendorFilter={vendorName}
                defaultVendorName={vendorName}
              />
            </div>

          </div>

          {/* Right Sticky Side Cart Drawer */}
          <aside className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-md p-5 text-on-surface">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h2 className="font-headline text-lg font-bold text-on-surface">Your Chop Cart</h2>
                </div>
                <span className="text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full font-medium">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-outline-variant" />
                  <p className="text-xs">Your cart is empty. Add a delicious meal from {vendorName}!</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/15 py-2 space-y-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="pt-2 flex items-start justify-between gap-2 text-xs">
                      <div className="space-y-0.5 flex-1">
                        <h4 className="font-bold text-on-surface line-clamp-1">{item.name}</h4>
                        <div className="font-price-display text-primary font-bold">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-full text-xs font-bold">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="hover:text-primary cursor-pointer px-1"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="hover:text-primary cursor-pointer px-1"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cost Calculation Summary */}
              {cartItems.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-outline-variant/30 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-on-surface">₦{foodSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant items-center">
                    <span className="flex items-center gap-1">
                      <span>{vendorTier} Dispatch ({deliveryEtaText})</span>
                      <Check className="w-3 h-3 text-tertiary" />
                    </span>
                    <span className="font-semibold text-on-surface">₦{calculatedDispatchFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Packaging &amp; Thermal Packs</span>
                    <span className="font-semibold text-on-surface">₦{packagingFee.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-baseline">
                    <span className="font-headline text-sm font-bold text-on-surface">Total Chop Amount</span>
                    <span className="font-price-display text-xl font-bold text-primary">₦{totalAmount.toLocaleString()}</span>
                  </div>

                  {/* Checkout CTA */}
                  <button 
                    onClick={onOpenCart}
                    className="w-full mt-4 bg-primary-container hover:bg-primary text-on-primary font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors shadow-xs active:scale-98 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Confirm Order &amp; Pay ₦{totalAmount.toLocaleString()}</span>
                  </button>

                  <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-on-surface-variant">
                    <Lock className="w-3 h-3 text-tertiary" />
                    <span>First Bank Instant Confirmation &bull; Direct Transfer</span>
                  </div>
                </div>
              )}

            </div>

            {/* Dispatch ETA Mini Card */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3 text-xs">
              <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-on-surface">Estimated Delivery Time: {deliveryEtaText}</div>
                <div className="text-on-surface-variant">Rider dispatches immediately in thermal packs.</div>
              </div>
            </div>

            {/* Bulk Order / Events Inquiry Card */}
            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                <Users className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Planning a Lokoja Event with {vendorName}?</span>
              </div>
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                Need party packs, catering trays, or executive lunch boxes for meetings, ceremonies, or gatherings?
              </p>
              <button
                onClick={() => setIsCateringOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Request Bulk Catering Quote</span>
              </button>
            </div>

          </aside>

        </div>
      </section>

      {/* Catering Inquiry Modal */}
      <CateringInquiryModal 
        isOpen={isCateringOpen}
        onClose={() => setIsCateringOpen(false)}
        defaultVendor={vendorName}
      />

    </div>
  );
};
