import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem, Restaurant, ActiveView } from '../types';
import { RESTAURANTS_DATA, FOOD_ITEMS_DATA } from '../data/mockData';
import { CustomerReviews } from '../components/CustomerReviews';
import { DishesFilterBar, CategoryOption, TagOption, SortOption, BrowseTab } from '../components/DishesFilterBar';
import { 
  Check, 
  Plus, 
  Timer, 
  Star, 
  Bike, 
  MessageCircle, 
  Store, 
  Utensils, 
  UtensilsCrossed,
  MapPin, 
  Flame, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Heart,
  Clock,
  Copy,
  Sparkles,
  Soup,
  Beef,
  Sandwich,
  Coffee,
  RotateCcw
} from 'lucide-react';

interface MarketplaceViewProps {
  onAddToCart: (item: FoodItem) => void;
  onNavigate: (view: ActiveView, vendorId?: string, zoneKey?: string) => void;
  searchQuery: string;
  favoriteFoodIds?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onAddToCart,
  onNavigate,
  searchQuery,
  favoriteFoodIds = [],
  onToggleFavorite
}) => {
  const [browseTab, setBrowseTab] = useState<'food' | 'restaurants' | 'neighborhoods'>('food');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<string>('none');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const CATERING_WHATSAPP_PHONE = '2349074072454';
  const CATERING_WHATSAPP_MESSAGE = `Hi LokoChop! I'm hosting an event in Lokoja and need a caterer. Here are my details:
Event type:
Date:
Number of guests:
Location/venue:
Budget range:
Please connect me with a suitable vendor. Thanks!`;
  const CATERING_WHATSAPP_URL = `https://wa.me/${CATERING_WHATSAPP_PHONE}?text=${encodeURIComponent(CATERING_WHATSAPP_MESSAGE)}`;

  const handleAdd = (item: FoodItem) => {
    onAddToCart(item);
    setAddedItemNotice(item.name);
    setTimeout(() => setAddedItemNotice(null), 1800);
  };

  // Dynamic category definition with accurate dish counts
  const categoriesList = useMemo<CategoryOption[]>(() => {
    const counts: Record<string, number> = {
      all: FOOD_ITEMS_DATA.length,
      rice: 0,
      swallow: 0,
      grill: 0,
      pastries: 0,
      drinks: 0,
    };
    FOOD_ITEMS_DATA.forEach(item => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });

    return [
      { id: 'all', label: 'All Dishes', count: counts.all, icon: UtensilsCrossed },
      { id: 'rice', label: 'Rice & Combos', count: counts.rice, icon: Flame },
      { id: 'swallow', label: 'Swallow & Soups', count: counts.swallow, icon: Soup },
      { id: 'grill', label: 'Grilled & Suya', count: counts.grill, icon: Beef },
      { id: 'pastries', label: 'Pastries & Shawarma', count: counts.pastries, icon: Sandwich },
      { id: 'drinks', label: 'Chilled Drinks & Zobo', count: counts.drinks, icon: Coffee },
    ];
  }, []);

  // Dynamic tags with priority for user-requested popular tags
  const tagsList = useMemo<TagOption[]>(() => {
    const tagCountMap: Record<string, number> = {};
    FOOD_ITEMS_DATA.forEach(item => {
      item.tags?.forEach(tag => {
        tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
      });
    });

    const orderedTags = [
      '#FriedChicken',
      '#Jollof',
      '#Shawarma',
      '#Burgers',
      '#Cakes',
      '#Amala',
      '#Swallow',
      '#LocalDelicacies',
      '#Bakery',
      '#FreshBread',
      '#MeatPie',
      '#FastFood',
      '#Cafe',
      '#Breakfast',
      '#TravelersPack'
    ];

    return orderedTags.map(tagName => ({
      name: tagName,
      count: tagCountMap[tagName] || 0,
    }));
  }, []);

  // Filter food items with deep tag & cluster search
  const filteredFood = FOOD_ITEMS_DATA.filter(food => {
    // Search query matching (matches title, vendor, description, tags with/without #, cluster, offeringType)
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const qClean = q.replace(/^#/, '');
      const matchSearch = food.name.toLowerCase().includes(q) ||
        food.vendorName.toLowerCase().includes(q) ||
        food.description.toLowerCase().includes(q) ||
        (food.tags && food.tags.some(t => {
          const tClean = t.toLowerCase().replace(/^#/, '');
          return tClean.includes(qClean) || t.toLowerCase().includes(q);
        })) ||
        (food.badge && food.badge.toLowerCase().includes(q)) ||
        (food.cluster && food.cluster.toLowerCase().includes(q)) ||
        (food.offeringType && food.offeringType.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    // Selected Tag filter
    if (selectedTag !== 'all') {
      const matchTag = food.tags && food.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());
      if (!matchTag) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && food.category !== selectedCategory) {
      return false;
    }

    // Quick filter
    if (quickFilter === 'favorites' && !favoriteFoodIds.includes(food.id)) return false;
    if (quickFilter === 'under2500' && food.price > 2500) return false;
    if (quickFilter === 'tier1' && food.tier !== 'Tier 1') return false;
    if (quickFilter === 'catfish' && !food.name.toLowerCase().includes('catfish')) return false;

    return true;
  });

  // Sort filtered food according to selected sort option
  const sortedAndFilteredFood = useMemo(() => {
    const list = [...filteredFood];
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'fastest') {
      const getPrepMinutes = (prepStr: string) => {
        const match = prepStr.match(/\d+/);
        return match ? parseInt(match[0], 10) : 99;
      };
      list.sort((a, b) => getPrepMinutes(a.prepTime) - getPrepMinutes(b.prepTime));
    }
    return list;
  }, [filteredFood, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedTag('all');
    setQuickFilter('none');
    setSortBy('featured');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedTag !== 'all' || quickFilter !== 'none' || sortBy !== 'featured';

  // Filter restaurants with tag & offerings search
  const filteredRestaurants = RESTAURANTS_DATA.filter(rest => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const qClean = q.replace(/^#/, '');
      const matchSearch = rest.name.toLowerCase().includes(q) ||
        rest.address.toLowerCase().includes(q) ||
        (rest.category && rest.category.toLowerCase().includes(q)) ||
        (rest.primaryOfferings && rest.primaryOfferings.toLowerCase().includes(q)) ||
        (rest.signatureDishes && rest.signatureDishes.some(d => d.toLowerCase().includes(q))) ||
        (rest.cluster && rest.cluster.toLowerCase().includes(q)) ||
        rest.tags.some(t => {
          const tClean = t.toLowerCase().replace(/^#/, '');
          return tClean.includes(qClean) || t.toLowerCase().includes(q);
        });
      if (!matchSearch) return false;
    }

    if (selectedTag !== 'all') {
      const matchTag = rest.tags && rest.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());
      if (!matchTag) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Event Catering & Feeding a Crowd in Lokoja Hero Section */}
      <section 
        id="event-catering-hero"
        aria-label="Event catering and bulk food logistics in Lokoja" 
        className="max-w-7xl mx-auto px-4 md:px-6 pt-1"
      >
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-surface-container-lowest via-surface-container/50 to-primary/5 p-5 sm:p-6 shadow-2xs">
          
          <div className="relative z-10 space-y-3.5 w-full">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>Event Catering &bull; Lokoja Metro</span>
            </div>

            {/* Main Header, Subheading, and Body Text (Full width, no empty right space, 2 lines) */}
            <div className="space-y-1.5 w-full">
              <h1 className="font-headline text-xl sm:text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight leading-snug">
                🎉 Hosting an Event or Feeding a Crowd in Lokoja? 🍲
              </h1>
              <p className="text-primary font-bold text-sm sm:text-base leading-snug">
                Weddings, corporate workshops, big hangouts — don&apos;t let food logistics stress you out.
              </p>
              <p className="text-on-surface-variant text-xs sm:text-sm lg:text-[14px] leading-relaxed w-full">
                LokoChop connects you instantly with Lokoja&apos;s top fast-food chains and premium caterers for bulk food boxes, custom cakes, and small chops, tailored to your budget. We handle the cooking and delivery so you can focus on your guests.
              </p>
            </div>

            {/* Value Badges & Chat on WhatsApp Button side-by-side in one inline row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20">
              <div className="inline-flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface shadow-2xs">
                <span className="text-sm">⏱️</span>
                <span className="font-semibold">Punctual delivery, metro-wide</span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface shadow-2xs">
                <span className="text-sm">🍗</span>
                <span className="font-semibold">Verified, premium vendors</span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface shadow-2xs">
                <span className="text-sm">💰</span>
                <span className="font-semibold">Bulk discount rates</span>
              </div>

              {/* Chat on WhatsApp button directly beside the badges */}
              <a
                id="catering-whatsapp-btn"
                href={CATERING_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-2xs hover:shadow-xs transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
                title="Chat on WhatsApp (+234 907 407 2454)"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Added to cart toast notification */}
      {addedItemNotice && (
        <div className="fixed top-20 right-6 z-50 bg-tertiary text-on-tertiary px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4" />
          <span>Added &quot;{addedItemNotice}&quot; to Chop Cart!</span>
        </div>
      )}

      {/* Hero Banner: Asymmetric Bento Showcase */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          
          {/* Text & Value Proposition */}
          <div className="lg:col-span-7 bg-surface-container p-4 sm:p-7 md:p-10 rounded-2xl border border-outline-variant/30 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="relative z-10 space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/30 border border-tertiary-container text-tertiary text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
                Verified Confluence Bukas &amp; Grills
              </div>
              <h1 className="font-headline text-2xl sm:text-4xl lg:text-5xl text-on-surface font-bold tracking-tight leading-tight">
                Confluence food, delivered hot &amp; ready across Lokoja.
              </h1>
              <p className="text-on-surface-variant text-xs sm:text-base leading-relaxed">
                Freshly pounded yam, sizzling Confluence river catfish, charcoal suya, and Mama&apos;s authentic firewood jollof. Straight from the pot to your doorstep in Lokongoma, Adankolo, GRA, and beyond.
              </p>
            </div>

            {/* Quick Action Counters */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-outline-variant/30 relative z-10 mt-5 sm:mt-6">
              <div>
                <span className="font-price-display text-xl sm:text-2xl font-bold text-primary">14</span>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant leading-tight">Verified Lokoja Bukas</p>
              </div>
              <div>
                <span className="font-price-display text-xl sm:text-2xl font-bold text-tertiary">15 Min</span>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant leading-tight">Avg. Core Dispatch</p>
              </div>
              <div>
                <span className="font-price-display text-xl sm:text-2xl font-bold text-secondary">0%</span>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant leading-tight">Hidden Food Surcharges</p>
              </div>
            </div>

            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-surface-container-high/60 pointer-events-none -z-0"></div>
          </div>

          {/* Hero Image Bento Block with Hotlinked Images */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            
            {/* Bento 1: Smoky Party Jollof */}
            <div 
              onClick={() => onNavigate('vendor-storefront')}
              className="relative rounded-2xl overflow-hidden border border-outline-variant/30 group cursor-pointer"
            >
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlIDLDMQNB5aexwNMNdLH_0VukMcrC6HxEbSTwnGHbH3MWM7lKG6ExqHoqUxsvgTTiN8KDR9Oorem4XZISW9G7J8B3xXmVyXv6qsoLiK7NYvNRujOP66tqTMR3BnnMuHy9LDtZm9U32VCJwwBTWuVIhhtkqoUmoB3Aab3OyFspZp1o0LeqsRavv9p4OsF-AIPzoPhPjxEyT2f094-4AFNiENZ6Mvi2cGwAM4H_eRvLMJEEJJSajmjO"
                alt="Smoky Party Jollof"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 min-h-[160px] sm:min-h-[200px]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-3 sm:p-4">
                <div>
                  <span className="text-white font-headline text-sm sm:text-base font-bold block leading-tight">Smoky Party Jollof</span>
                  <span className="text-secondary-fixed text-[11px] sm:text-xs">Mama Ngozi&apos;s Kitchen</span>
                </div>
              </div>
            </div>

            {/* Bento Col 2 */}
            <div className="flex flex-col gap-3 sm:gap-4">
              
              {/* Point & Kill Catfish */}
              <div 
                onClick={() => onNavigate('vendor-storefront')}
                className="relative rounded-2xl overflow-hidden border border-outline-variant/30 h-1/2 group cursor-pointer"
              >
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb8MQ_ouBjbm6Rtk_LYWJdjoeY4Idg0CANrzfFRCcLYNDCC9ps3qJUltHSGF5w0fLSgzkVXaMFNVHv6v5BmFswHm8JOi6z36wtImYUl6nQjMypSpRdTAW4NVMHQg0BBFobENYeWDqyv7LdEy2khCycq2OWnm_dqG-xcXJWYnaC1UR3oqSOWzSEelGeKM7gvuzsXV7Kl0Ch5zPhH8f7Xw4-vWLO1ErU0CHCIjq2MTcOfxnLdsiv5vnj"
                  alt="Point & Kill Catfish"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 min-h-[75px]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-2.5 sm:p-3">
                  <span className="text-white text-[11px] sm:text-xs font-bold font-headline">Point &amp; Kill Catfish</span>
                </div>
              </div>

              {/* Pounded Yam & Egusi */}
              <div 
                onClick={() => onNavigate('vendor-storefront')}
                className="relative rounded-2xl overflow-hidden border border-outline-variant/30 h-1/2 group cursor-pointer"
              >
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKVnBYaUb7qc0uOqXGD_CYxvk3y7GEKtPdcIQH8k4IOCkHBYdzhHvzde6-nIOhqtNSb04vNWGdl2b3yNr-3UwA9yqmYL7uVK2VbQYeXlp1kHy1FStdTglSpEO17_D7GkKUwRxwiYZFPcG0aDxz2dZVVdVJlyr8oBV95bz6MQ7g7k9uKcbGmjssIrU8FRS4ElwIO1jZDYo1dzFwF04YrEQOfddbmYMTbanN6qGjaprStnckbh3G0HHN"
                  alt="Pounded Yam & Egusi"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 min-h-[75px]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-2.5 sm:p-3">
                  <span className="text-white text-[11px] sm:text-xs font-bold font-headline">Pounded Yam &amp; Egusi</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Unified Professional Marketplace Filter Command */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6" id="marketplace">
        <DishesFilterBar
          browseTab={browseTab}
          onSelectBrowseTab={setBrowseTab}
          restaurantCount={RESTAURANTS_DATA.length}
          quickFilter={quickFilter}
          onSelectQuickFilter={setQuickFilter}
          favoritesCount={favoriteFoodIds.length}
          categories={categoriesList}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          tags={tagsList}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          totalResults={sortedAndFilteredFood.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </section>

      {/* ANIMATED TAB CONTENTS */}
      <AnimatePresence mode="wait">
        {/* TAB CONTENT 1: BROWSE BY FOOD */}
        {browseTab === 'food' && (
          <motion.section
            key="tab-browse-food"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="max-w-7xl mx-auto px-4 md:px-6 space-y-6"
          >
            
            {/* Starred Favorites Quick Reorder Shelf (if any) */}
            {favoriteFoodIds.length > 0 && quickFilter !== 'favorites' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-surface-container-low/70 border border-amber-500/20 rounded-2xl p-4 space-y-2.5 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="font-headline text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Your Starred Lokoja Dishes ({favoriteFoodIds.length})</span>
                  </span>
                  <button
                    onClick={() => setQuickFilter('favorites')}
                    className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    View All Favorites &rarr;
                  </button>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scroll">
                  {FOOD_ITEMS_DATA.filter(f => favoriteFoodIds.includes(f.id)).map(fav => (
                    <motion.div 
                      key={`fav-shelf-${fav.id}`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2.5 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30 shrink-0 shadow-xs hover:border-primary/40 transition-colors"
                    >
                      <img 
                        src={fav.imageUrl} 
                        alt={fav.name} 
                        className="w-10 h-10 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left pr-2">
                        <div className="font-bold text-xs text-on-surface line-clamp-1 max-w-[130px]">{fav.name}</div>
                        <div className="text-[10px] text-primary font-bold font-price-display">₦{fav.price.toLocaleString()}</div>
                      </div>
                      <button
                        onClick={() => handleAdd(fav)}
                        className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer"
                        title="Add to cart"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Food Menu Grid */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedAndFilteredFood.map(food => {
                const isStarred = favoriteFoodIds.includes(food.id);
                return (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.22 }}
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    key={food.id}
                    className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden flex flex-col justify-between hover:border-primary-container/60 transition-all group shadow-xs hover:shadow-md"
                  >
                    <div className="relative h-48 overflow-hidden bg-surface-container">
                    <img 
                      src={food.imageUrl} 
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Star / Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleFavorite) onToggleFavorite(food.id);
                      }}
                      className={`absolute top-3 left-3 p-1.5 rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer z-10 ${
                        isStarred
                          ? 'bg-amber-400 text-stone-950 ring-2 ring-white'
                          : 'bg-stone-900/60 text-white hover:text-amber-400 hover:bg-stone-900/80'
                      }`}
                      title={isStarred ? 'Remove from favorites' : 'Star this dish'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-stone-950 text-stone-950' : ''}`} />
                    </button>

                    <span className="absolute top-3 left-12 bg-tertiary/90 backdrop-blur-xs text-on-tertiary px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                      <Timer className="w-3 h-3" /> {food.prepTime}
                    </span>
                    <span className="absolute top-3 right-3 bg-surface/90 backdrop-blur-xs text-on-surface px-2 py-0.5 rounded text-[11px] font-bold shadow-xs flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {food.rating} ★
                    </span>
                    {food.badge && (
                      <span className="absolute bottom-3 left-3 bg-primary-container text-on-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {food.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                    <div>
                      <button
                        onClick={() => onNavigate('vendor-storefront')}
                        className="text-xs text-secondary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{food.vendorName}</span>
                        <span className="text-[10px] text-on-surface-variant">&bull; {food.zone}</span>
                      </button>
                      <h3 className="font-headline text-base font-bold text-on-surface mt-1 group-hover:text-primary transition-colors line-clamp-1">
                        {food.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                        {food.description}
                      </p>

                      {food.tags && food.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {food.tags.map((tag, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag);
                              }}
                              className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                selectedTag === tag
                                  ? 'bg-primary text-white font-bold'
                                  : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary/10'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-on-surface-variant uppercase block">Portion</span>
                        <span className="font-price-display text-lg font-bold text-primary">
                          ₦{food.price.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdd(food)}
                        className="bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add to cart</span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>

          {sortedAndFilteredFood.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant bg-surface-container-low rounded-2xl p-8 border border-outline-variant/30 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface">No dishes match your active filter</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Try switching categories, choosing a different tag, or resetting your filter criteria to see all available Confluence dishes.
              </p>
              <button 
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

        </motion.section>
      )}

      {/* TAB CONTENT 2: BROWSE RESTAURANTS (14 Verified) */}
      {browseTab === 'restaurants' && (
        <motion.section 
          key="tab-browse-restaurants"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 md:px-6 space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">Verified Lokoja Restaurants &amp; Bukas (14)</h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">From Paparanda Square &amp; Lokongoma to Ganaja Junction, Adankolo, and Nataco corridors.</p>
            </div>
            <span className="bg-tertiary-container/30 text-tertiary text-xs px-3 py-1 rounded-full border border-tertiary-container font-semibold">
              14 Registered &amp; Delivering Across 3 Tiers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(rest => (
              <motion.div 
                key={rest.id}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-headline font-bold text-lg">
                      {rest.shortCode}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> {rest.status}
                      </span>
                      <span className="text-[11px] text-on-surface-variant mt-1 font-medium">{rest.phone}</span>
                    </div>
                  </div>

                  <h3 className="font-headline text-lg font-bold text-on-surface mt-3">{rest.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-outline" />
                    {rest.address}
                  </p>

                  {/* Cluster badge & category */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    {rest.cluster && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/10 text-secondary">
                        {rest.cluster}
                      </span>
                    )}
                    {rest.category && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container text-on-surface-variant">
                        {rest.category}
                      </span>
                    )}
                  </div>

                  {/* Primary Offerings */}
                  {rest.primaryOfferings && (
                    <div className="mt-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Primary Offerings:</span>
                      <p className="text-on-surface text-xs leading-snug line-clamp-1 font-medium">{rest.primaryOfferings}</p>
                    </div>
                  )}

                  {/* Signature Dishes */}
                  {rest.signatureDishes && rest.signatureDishes.length > 0 && (
                    <div className="mt-1.5 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Signatures:</span>
                      <p className="text-primary text-[11px] leading-snug line-clamp-1 font-semibold">
                        {rest.signatureDishes.join(' • ')}
                      </p>
                    </div>
                  )}

                  {/* Interactive App Tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {rest.tags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(tag);
                          setBrowseTab('food');
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          selectedTag === tag 
                            ? 'bg-primary text-white font-bold' 
                            : 'bg-surface-container text-on-surface hover:bg-primary/10 hover:text-primary'
                        }`}
                        title={`Filter dishes tagged ${tag}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block uppercase">Delivery Zone</span>
                    <span className="text-xs font-bold text-tertiary">{rest.zoneText}</span>
                  </div>
                  <button 
                    id={`order-btn-${rest.id}`}
                    onClick={() => {
                      onNavigate('vendor-storefront', rest.id);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-secondary text-secondary hover:bg-secondary hover:text-on-secondary text-xs font-semibold transition-colors cursor-pointer active:scale-95"
                  >
                    Order Food
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* TAB CONTENT 3: BROWSE BY NEIGHBORHOOD */}
      {browseTab === 'neighborhoods' && (
        <motion.section 
          key="tab-browse-neighborhoods"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 md:px-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">Explore Lokoja Delivery Neighborhoods</h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">Direct delivery pricing calculated based on Lokoja township dispatch distances.</p>
            </div>
            <button 
              onClick={() => onNavigate('neighborhoods')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Zone Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Zone 1 */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/30 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-tertiary text-on-tertiary text-xs font-bold">Tier 1 Core Zone</span>
                  <span className="font-price-display text-base font-bold text-primary">₦800 Dispatch</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface">Lokongoma, Paparanda &amp; GRA</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Fastest turnaround zone. Includes Adankolo Market axis, Old Market, and State High Court surroundings.
                </p>
                <div className="text-[11px] text-tertiary font-semibold flex items-center gap-1 pt-1">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Average dispatch time: 10–15 mins</span>
                </div>
              </div>
              <button 
                id="order-zone-tier1-btn"
                onClick={() => onNavigate('zone-directory', undefined, 'tier1')}
                className="mt-5 w-full py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-bold text-on-surface hover:border-primary hover:text-primary transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>View Vendors in Lokongoma & GRA</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zone 2 */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/30 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-secondary text-on-secondary text-xs font-bold">Tier 2 Mid-Range</span>
                  <span className="font-price-display text-base font-bold text-primary">₦1,200 Dispatch</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface">Zone 8 Secretariat &amp; Sarkin Noma</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Includes State Secretariat complexes, Kabawa riverside quarters, and Ganaja Flyover corridors.
                </p>
                <div className="text-[11px] text-secondary font-semibold flex items-center gap-1 pt-1">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Average dispatch time: 15–25 mins</span>
                </div>
              </div>
              <button 
                id="order-zone-tier2-btn"
                onClick={() => onNavigate('zone-directory', undefined, 'tier2')}
                className="mt-5 w-full py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-bold text-on-surface hover:border-primary hover:text-primary transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>View Vendors in Zone 8 & Sarkin Noma</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zone 3 */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/30 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-primary text-on-primary text-xs font-bold">Tier 3 Peripheral</span>
                  <span className="font-price-display text-base font-bold text-primary">₦2,000 Dispatch</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface">Felele, Nataco &amp; Ganaja Village</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Covers Federal University Lokoja (FUL) campus corridors, Abuja-Lokoja Expressway junction, and Ajaokuta road margins.
                </p>
                <div className="text-[11px] text-primary font-semibold flex items-center gap-1 pt-1">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Average dispatch time: 25–40 mins</span>
                </div>
              </div>
              <button 
                id="order-zone-tier3-btn"
                onClick={() => onNavigate('zone-directory', undefined, 'tier3')}
                className="mt-5 w-full py-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>View Vendors in Felele, Nataco & Ganaja Village</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.section>
      )}
      </AnimatePresence>

      {/* Customer Reviews & Community Feedback Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <CustomerReviews />
      </section>

      {/* Live Order Dispatch Tracker Preview Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-8">
        <div className="bg-surface-container p-5 md:p-6 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline text-lg font-bold text-on-surface">Active Rider on the Road</span>
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Rider Ibrahim with Order #LK-4088 (Mama Ngozi&apos;s to Lokongoma Phase 1) &bull; Estimated arrival in 8 mins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigate('order-tracking')}
              className="px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-bold hover:bg-primary transition-colors cursor-pointer"
            >
              Track Active Order #LK-4092
            </button>
            <a 
              href="https://wa.me/2349074072454"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-outline-variant/40 bg-surface text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-tertiary" />
              <span>WhatsApp Rider</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
