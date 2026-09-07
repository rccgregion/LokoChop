import React, { useState } from 'react';
import { ActiveView } from '../types';
import { NEIGHBORHOOD_ZONES_DATA } from '../data/mockData';
import { 
  Bike, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  Store, 
  CloudRain, 
  Filter
} from 'lucide-react';

interface NeighborhoodsViewProps {
  onNavigate: (view: ActiveView, vendorId?: string, zoneKey?: string) => void;
}

export const NeighborhoodsView: React.FC<NeighborhoodsViewProps> = ({ onNavigate }) => {
  const [selectedTier, setSelectedTier] = useState<'all' | 'tier1' | 'tier2' | 'tier3'>('all');

  const filteredZones = NEIGHBORHOOD_ZONES_DATA.filter(zone => {
    if (selectedTier === 'all') return true;
    return zone.tier === selectedTier;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Breadcrumb & Headline Hero Section */}
      <section className="bg-surface-container-low border-b border-outline-variant/15 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-on-surface-variant text-xs mb-4">
            <button onClick={() => onNavigate('marketplace')} className="hover:text-primary transition-colors cursor-pointer">
              Marketplace
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-outline" />
            <span className="text-primary font-semibold">Lokoja Neighborhoods &amp; Delivery Zones</span>
          </nav>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-tertiary-container/15 text-tertiary text-xs">
              <Bike className="w-3.5 h-3.5" />
              <span>Confluence Express Dispatch Network</span>
            </div>
            <h1 className="font-headline text-3xl md:text-4xl text-on-surface font-bold tracking-tight">
              Browse Food by Lokoja Neighborhoods &amp; Delivery Zones
            </h1>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
              Clear dispatch tariffs across Lokoja&apos;s three distance tiers. Know your delivery fee and rider arrival window up front before you order.
            </p>
          </div>

          {/* Tariff Fast-Look Stat Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-outline-variant/20 text-xs">
            <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10 shadow-xs">
              <span className="text-on-surface-variant block font-medium">Tier 1 Urban Core</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline text-lg font-bold text-primary">₦800</span>
                <span className="text-on-surface-variant">&bull; 10-15m</span>
              </div>
              <span className="text-tertiary font-semibold mt-1 block">6 Active Hubs</span>
            </div>

            <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10 shadow-xs">
              <span className="text-on-surface-variant block font-medium">Tier 2 Mid-Range Suburbs</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline text-lg font-bold text-primary">₦1,200</span>
                <span className="text-on-surface-variant">&bull; 15-25m</span>
              </div>
              <span className="text-tertiary font-semibold mt-1 block">5 Active Hubs</span>
            </div>

            <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10 shadow-xs">
              <span className="text-on-surface-variant block font-medium">Tier 3 Peripheral Corridor</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline text-lg font-bold text-primary">₦2,000</span>
                <span className="text-on-surface-variant">&bull; 25-40m</span>
              </div>
              <span className="text-tertiary font-semibold mt-1 block">5 Outpost Hubs</span>
            </div>

            <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/10 shadow-xs flex flex-col justify-between">
              <span className="text-on-surface-variant block font-medium">Active Riders on Duty</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-headline text-lg font-bold text-on-surface">24 Okada Riders</span>
              </div>
              <span className="text-on-surface-variant text-[11px]">Dry Weather Tariff Active</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Zone Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span>Select Delivery Tier &amp; Localities</span>
          </h2>
          <span className="text-xs text-on-surface-variant hidden sm:inline">Updated 4 mins ago based on rider density</span>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scroll text-xs">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-4 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTier === 'all'
                ? 'bg-secondary text-surface shadow-xs font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/20'
            }`}
          >
            All Neighborhoods (14 Vendors)
          </button>
          <button
            onClick={() => setSelectedTier('tier1')}
            className={`px-4 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTier === 'tier1'
                ? 'bg-secondary text-surface shadow-xs font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/20'
            }`}
          >
            Tier 1: Core Urban Hubs (₦800 fee &bull; 10-15m)
          </button>
          <button
            onClick={() => setSelectedTier('tier2')}
            className={`px-4 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTier === 'tier2'
                ? 'bg-secondary text-surface shadow-xs font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/20'
            }`}
          >
            Tier 2: Mid-range Suburbs (₦1,200 fee &bull; 15-25m)
          </button>
          <button
            onClick={() => setSelectedTier('tier3')}
            className={`px-4 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTier === 'tier3'
                ? 'bg-secondary text-surface shadow-xs font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/20'
            }`}
          >
            Tier 3: Peripheral Corridor (₦2,000 fee &bull; 25-40m)
          </button>
        </div>

        {/* Sub-pills list showing local wards */}
        <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/20 flex items-center flex-wrap gap-2 text-xs">
          <span className="font-semibold text-on-surface-variant flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Key Landmarks Covered:
          </span>
          {['Paparanda/Apata', 'Ganaja Junction', 'Lokongoma Phase 1 & 2', 'GRA / Hospital Rd', 'Adankolo Market', 'Sarkin Noma', 'Nataco Expressway', 'Felele Corridor'].map((l, i) => (
            <span key={i} className="bg-surface-container-lowest text-on-surface px-2.5 py-1 rounded-md border border-outline-variant/10 text-[11px]">
              {l}
            </span>
          ))}
        </div>
      </section>

      {/* Neighborhood Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZones.map(zone => (
            <article 
              key={zone.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Visual Header with Hotlinked Image */}
                <div className="relative h-44 w-full bg-surface-variant overflow-hidden">
                  <img 
                    src={zone.imageUrl} 
                    alt={zone.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-secondary text-surface px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {zone.tierLabel}
                    </span>
                    <span className="bg-tertiary text-on-tertiary px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {zone.tag}
                    </span>
                  </div>

                  {/* Bottom Title */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-headline text-lg font-bold leading-tight">{zone.name}</h3>
                    <p className="text-xs text-secondary-fixed opacity-90">{zone.subtitle}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Pricing & ETA Box */}
                  <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between border border-outline-variant/15 text-xs">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase block">Rider Dispatch Fee</span>
                      <span className="font-price-display text-base text-primary font-bold">₦{zone.dispatchFee} base fee</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-on-surface-variant uppercase block">Arrival Window</span>
                      <span className="font-semibold text-on-surface flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-tertiary" /> {zone.eta}
                      </span>
                    </div>
                  </div>

                  {/* Featured Kitchens */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      Featured Neighborhood Kitchens:
                    </p>
                    <ul className="space-y-1.5 text-xs text-on-surface">
                      {zone.featuredKitchens.map((k, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-medium">{k.name}</span>
                          <span className="text-[11px] text-on-surface-variant ml-auto">{k.location}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-5 pt-0 mt-2">
                <button 
                  id={`view-zone-btn-${zone.id}`}
                  onClick={() => {
                    onNavigate('zone-directory', undefined, zone.tier);
                  }}
                  className="w-full h-11 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <span>View Vendors in {zone.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Delivery Tariff Policy Banner (3 Pillars) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-6 md:p-8 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/25">
              <div>
                <div className="inline-flex items-center gap-2 text-primary text-xs font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Transparent Confluence Dispatch Commitments</span>
                </div>
                <h2 className="font-headline text-2xl font-bold text-on-surface">
                  Delivery Tariff &amp; Dispatch Transparency Policy
                </h2>
              </div>

              {/* Direct Rider Contact Hotline */}
              <a 
                href="tel:+2349074072454"
                className="inline-flex items-center gap-3 bg-secondary text-surface px-5 py-3 rounded-xl hover:bg-secondary/90 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-full bg-surface/20 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] text-secondary-fixed uppercase tracking-wider">Rider Hotline / Disputes</span>
                  <span className="text-xs font-bold text-surface">+234 907 407 2454</span>
                </div>
              </a>
            </div>

            {/* Policy Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pillar 1 */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container/15 text-tertiary shrink-0 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-base font-bold text-on-surface">Localized Dispatch Riders</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    All couriers are verified Lokoja Okada specialists with native understanding of Paparanda shortcuts, Meme bridge traffic rhythms, and campus bypasses.
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-base font-bold text-on-surface">Vendor-Direct Handover</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Hot soups and fried proteins are packed straight from the kitchen pot into heat-sealed thermal carriers. No intermediate warehousing or depot stalls.
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/15 text-secondary shrink-0 flex items-center justify-center">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-base font-bold text-on-surface">Fair Weather Index</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    During heavy Niger river downpours, a flat +₦300 wet-run incentive is directly awarded to riders navigating flooded feeder routes around Adankolo.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
