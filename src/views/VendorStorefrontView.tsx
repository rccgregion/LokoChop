import React, { useState } from 'react';
import { FoodItem, CartItem, ActiveView } from '../types';
import { CustomerReviews } from '../components/CustomerReviews';
import { CateringInquiryModal } from '../components/CateringInquiryModal';
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
  Users
} from 'lucide-react';

interface VendorStorefrontViewProps {
  onAddToCart: (item: FoodItem) => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onOpenCart: () => void;
  onNavigate: (view: ActiveView) => void;
  favoriteFoodIds?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const VendorStorefrontView: React.FC<VendorStorefrontViewProps> = ({
  onAddToCart,
  cartItems,
  onUpdateQuantity,
  onOpenCart,
  onNavigate,
  favoriteFoodIds = [],
  onToggleFavorite
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [isCateringOpen, setIsCateringOpen] = useState<boolean>(false);

  const dishes: FoodItem[] = [
    {
      id: 'store-jollof',
      name: 'Smoky Party Jollof + Fried Dodo & Tender Goat Meat',
      vendorName: "Mama Ngozi's Kitchen",
      vendorId: 'mama-ngozi',
      zone: 'Paparanda',
      tier: 'Tier 1',
      category: 'rice',
      price: 3500,
      prepTime: '12–18m',
      rating: 4.9,
      description: 'Slow-cooked basmati grain with authentic firewood aroma and ripe golden plantains.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2OMAu30Sq1RrjssnX1ow9eJwm_jbdWCupFkpFtOK6TkEpuoLYBUjqZ80s7euomsMZZnzr4coFJ7ot-Hl_f9rP6bhV4RSqaisj-OKL0UqZTooDGBxlzNUENz0Bpteh3raZh04HCw4sQeCy7eNdck_kqsUKy1Akn0uTgYV0oKmI5APx-csD4EcGsqlSEd1-SljaUHlOZ264-JShpYImclccAGQ4o4w3dpGHbUXR_TlkJ8D9n1w3-6Iy',
      badge: 'Bestseller',
      inStock: true
    },
    {
      id: 'store-pounded-yam',
      name: 'Pounded Yam + Fisherman Catfish Soup',
      vendorName: "Mama Ngozi's Kitchen",
      vendorId: 'mama-ngozi',
      zone: 'Paparanda',
      tier: 'Tier 1',
      category: 'swallow',
      price: 2700,
      prepTime: '15–20m',
      rating: 4.8,
      description: 'Stretchy hot yam mortar-pounded on order, paired with river catfish broth, utazi herbs, and scent leaf.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRpb6dVZJ0ey7eKUfi7kJVQGU3K8jMJo8HvoQbjeSG7-ZhhVkshhMqDxh3-nKIm0luCO0Ds-ucSotlmidIrDyAIs_gVyS5g3SDwwzyCzg45nmNVj1Drgc2Xr_08IcrdAYIzfDVs0VFqstnjahThpJBTVf8apQGnYQgJ1Z2TfMfylKSQ_RALh1Ausvhqx7ptF8EsNDah0ZFKYhSP31Vul2qjhV4KWO-fRf4UCae-bAHqpd99UEwCOXx',
      badge: "Chef's Special",
      inStock: true
    },
    {
      id: 'store-catfish-grill',
      name: 'Confluence Point & Kill Charcoal Catfish',
      vendorName: "Mama Ngozi's Kitchen",
      vendorId: 'mama-ngozi',
      zone: 'Paparanda',
      tier: 'Tier 1',
      category: 'grill',
      price: 4500,
      prepTime: '20–25m',
      rating: 5.0,
      description: 'Whole river catfish grilled with spicy pepper sauce and roasted plantain (Boli).',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtcrhLlQbEsYpfuO10S8mxLmBE7n5pxBu4RWS5_KMXSt24dRjyjyY23Z6PLhY0AIXMvI8vHGrSyH0YR0BmA7OwrbHAxYznxZiBizlu0z8cetUKFQyMcVwQkZhaVXhJFmj-R4awxmNOrabFHwMlISNqviQhLS6go3-5qiGfkMCcwBCaitggU7JYkAvjNadCHk4vVwcdEMIaMg76e45t0fRlKFd7AHZp2KYu4xcVHO2GyZ-B85wtQ7-2',
      inStock: true
    },
    {
      id: 'store-egusi',
      name: 'Egusi Soup with Assorted Bushmeat & Beef',
      vendorName: "Mama Ngozi's Kitchen",
      vendorId: 'mama-ngozi',
      zone: 'Paparanda',
      tier: 'Tier 1',
      category: 'swallow',
      price: 2800,
      prepTime: '15–20m',
      rating: 4.8,
      description: 'Rich melon seed soup with bitterleaf, stockfish, and two pieces of beef.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC44XGpZf22fBQY7fVcCS05e62ipauwzbSFgg8sOEHaKPD6ghGwXHQ3AidP4fiUoLCkahfN9Sn1S5aPfOPlFJQJbNg9QJ_ubAcLVuR7aX7cG05Bs5ynTNYC-yR-gBrk1cnWbph35e-QunuqUxzk6UwiaDLYYcCjkCTwPTaRR2-h9dEx4NDM2g3MQAP4H-rs1QkmBw_LJoTC2h5ZdQCbXM-tYZBOg-CaP1GqHCi9snmP79sfZ94QuVS-',
      inStock: true
    },
    {
      id: 'store-fried-yam',
      name: 'Fried Yam & Spicy Confluence Stew with Fried Fish',
      vendorName: "Mama Ngozi's Kitchen",
      vendorId: 'mama-ngozi',
      zone: 'Paparanda',
      tier: 'Tier 1',
      category: 'rice',
      price: 2200,
      prepTime: '12–15m',
      rating: 4.7,
      description: 'Crispy fried sweet white yam with fiery tomato-pepper stew and river fish.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjiqAxtL6O1uWomBCb-mHAbuQhBMM7I8MDsti3Z56YMqUsHOhRuXAZ8eLodUHY2k1hpHp5yytN9wYd_PlN7grzoAMza_YjSGte2Us5QJIYcTU2MrIEUcsuqzq0qcZr7ipm5mWKWG6Qfzi1KaVsJY8QZXAE8UT6_YhYHcTVXcWSYHyfwMpNSqDZCWwb_-IMI30DSE0vGOHDimS-H0G0zz14IvoXkyWNUBMeo-OtHcDMs2E2EtSjdhWs',
      inStock: true
    },
    {
      id: 'store-zobo',
      name: 'Chilled Hibiscus Zobo Infusion with Ginger & Cloves (75cl)',
      vendorName: "Mama Ngozi's Kitchen",
      vendorId: 'mama-ngozi',
      zone: 'Paparanda',
      tier: 'Tier 1',
      category: 'drinks',
      price: 800,
      prepTime: 'Instant',
      rating: 4.9,
      description: 'Cold-steeped organic Nigerian hibiscus petals with spicy crushed ginger and cloves.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9_P7sdBj6HeN1T3bFcc9MxSxxpStuF35XIJ9mbNoRPFs6VxdjOk2jzqi-T_siyJXRG_QoKSQDum5vLfwXeE-pCvTfTbiftsTAdIQxVEk3gPl27oavCDCZmZjdAp__O-7uQfl0TKXstd8diyaho83weocD7z2E4oH0WqEtfhOXx2AHM3jjrFtZTb8I1OwbQiWzMKolygOrcONfvE9SmbLgXGlsd6o--RSW13ViBKInXM_cjTbhbfgu',
      inStock: true
    }
  ];

  const handleAdd = (item: FoodItem) => {
    onAddToCart(item);
    setAddedItemNotice(item.name);
    setTimeout(() => setAddedItemNotice(null), 1800);
  };

  const filteredDishes = activeCategory === 'all' 
    ? dishes 
    : dishes.filter(d => d.category === activeCategory);

  const foodSubtotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const dispatchFee = cartItems.length > 0 ? 800 : 0;
  const packagingFee = cartItems.length > 0 ? 300 : 0;
  const totalAmount = foodSubtotal + dispatchFee + packagingFee;

  return (
    <div className="space-y-6">
      
      {/* Breadcrumb Bar */}
      <div className="bg-surface-container-low border-b border-outline-variant/20 py-2.5 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
          <button onClick={() => onNavigate('marketplace')} className="hover:text-primary transition-colors cursor-pointer">
            Marketplace
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <button onClick={() => onNavigate('marketplace')} className="hover:text-primary transition-colors cursor-pointer">
            Vendors
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <span className="text-primary font-bold">Mama Ngozi&apos;s Kitchen</span>
        </div>
      </div>

      {/* Toast Notice */}
      {addedItemNotice && (
        <div className="fixed top-20 right-6 z-50 bg-tertiary text-on-tertiary px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4" />
          <span>Added &quot;{addedItemNotice}&quot; to Chop Cart!</span>
        </div>
      )}

      {/* Hero Vendor Banner with Hotlinked Background */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div 
          className="relative rounded-2xl overflow-hidden shadow-xs border border-outline-variant/20 bg-cover bg-center min-h-[340px] md:min-h-[420px] flex flex-col justify-end p-4 md:p-6"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuApoU1ok_LGtpNP0FItck1UHKCAxbOCcFbxsC3LwizacAtAgUva3r1O_bvN2n0lfniAPoGwWxHnR-8iRPsfXqIiM1KgTQZAClZwFfrp9cRr1IjZorqB1TfvZvp1WAC4vfkVZM4ul_Nb-bhTvBd3zpkZA3eJp8u3sMB06sOZQD4heiqcfNZDrvnMpbiUaCt7iQHJ07cfPsmrBbAPzeBAh-vZq-x3-81JUY9_HLv0M9-ca9c7R-IL6pBR')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/40 to-transparent"></div>

          {/* Floating Garri Cream Frosted Overlay Card */}
          <div className="relative z-10 bg-surface-container-low/95 backdrop-blur-md rounded-xl p-4 md:p-6 border border-surface-container-lowest/80 shadow-md">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-tertiary/15 text-tertiary px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Confluence Buka
                  </span>
                  <span className="bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                    4.9 ★ (184 reviews)
                  </span>
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Paparanda Junction (Tier 1 Core)
                  </span>
                </div>

                <h1 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
                  Mama Ngozi&apos;s Kitchen
                </h1>
                <p className="text-on-surface-variant text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Renowned local culinary hub at Paparanda. Famous for firewood smoked party jollof, authentic Benue river fresh fish broth, and hand-pounded yam.
                </p>
              </div>

              {/* Quick Info Pill Badge Box */}
              <div className="flex flex-col items-start gap-1.5 bg-surface-container-high/60 p-3 rounded-lg border border-outline-variant/20 shrink-0 text-xs">
                <div className="flex items-center gap-1.5 text-tertiary font-bold">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span>Open Now (8:00 AM – 9:30 PM)</span>
                </div>
                <div className="text-on-surface-variant flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-secondary" />
                  <span>Base Delivery: <strong className="text-on-surface">₦800</strong> (10–15 mins to Lokongoma)</span>
                </div>
                <div className="text-on-surface-variant flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <span>Direct Bank Transfer to First Bank upon order</span>
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
              <span><strong>Hot Notice:</strong> Fresh batches of firewood Jollof and hot Confluence Catfish prepared every 30 minutes.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Tabs */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto custom-scroll py-2 text-xs">
          {[
            { id: 'all', label: 'All Items (18)' },
            { id: 'rice', label: 'Rice & Combos (5)' },
            { id: 'swallow', label: 'Swallow & Native Soups (6)' },
            { id: 'grill', label: 'Fresh Confluence Fish (3)' },
            { id: 'drinks', label: 'Sides & Drinks (4)' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-secondary text-on-secondary shadow-xs font-bold'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
              }`}
            >
              {cat.label}
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
                <h2 className="font-headline text-2xl font-bold text-on-surface">Available Today at Paparanda Buka</h2>
                <p className="text-xs text-on-surface-variant">Hot &amp; ready straight from Mama Ngozi&apos;s firewood hearth.</p>
              </div>
              <span className="text-xs text-tertiary bg-tertiary/10 px-2.5 py-1 rounded-full font-bold">
                {filteredDishes.length} Fresh Options
              </span>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDishes.map(dish => {
                const isStarred = favoriteFoodIds.includes(dish.id);
                return (
                  <article
                    key={dish.id}
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
                All orders from Mama Ngozi&apos;s Kitchen are prepared on-demand. Due to local banking network speeds, please make your <strong>Direct Bank Transfer to First Bank</strong> immediately your order confirmation drops. Dispatch riders move within 10 minutes of payment acknowledgement. If network delay occurs, reach our direct Confluence WhatsApp hotline at <strong>+2349074072454</strong> for instant resolution.
              </p>
            </div>

            {/* Customer Reviews & Storefront Ratings */}
            <div className="pt-2">
              <CustomerReviews 
                vendorFilter="Mama Ngozi's Kitchen"
                defaultVendorName="Mama Ngozi's Kitchen"
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
                  Mama Ngozi&apos;s ({cartItems.length} items)
                </span>
              </div>

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-outline-variant" />
                  <p className="text-xs">Your cart is empty. Add a hot meal!</p>
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
                      <span>Tier 1 Dispatch (Lokongoma)</span>
                      <Check className="w-3 h-3 text-tertiary" />
                    </span>
                    <span className="font-semibold text-on-surface">₦{dispatchFee.toLocaleString()}</span>
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
                <div className="font-bold text-on-surface">Estimated Delivery Time: 25 mins</div>
                <div className="text-on-surface-variant">Rider picks up immediately Mama Ngozi packs food hot.</div>
              </div>
            </div>

            {/* Bulk Order / Events Inquiry Card */}
            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                <Users className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Planning a Lokoja Event?</span>
              </div>
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                Need 20–500+ party jollof packs, whole catfish coolers, or VIP executive boxes for weddings, birthdays, or meetings?
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
        defaultVendor="Mama Ngozi's Kitchen"
      />

    </div>
  );
};
