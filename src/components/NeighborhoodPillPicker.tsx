import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Bike, Search, ChevronDown, Check, Zap, Sparkles } from 'lucide-react';
import { LOKOJA_LOCATIONS, LokojaLocationZone, getLocationTierBadgeInfo } from '../utils/dispatchCalculator';

interface NeighborhoodPillPickerProps {
  selectedLocationId: string;
  onSelectLocation: (locationId: string) => void;
}

export const NeighborhoodPillPicker: React.FC<NeighborhoodPillPickerProps> = ({
  selectedLocationId,
  onSelectLocation,
}) => {
  const [zoneTierFilter, setZoneTierFilter] = useState<'all' | 'Tier 1' | 'Tier 2' | 'Tier 3'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const currentLocation = useMemo(() => {
    return LOKOJA_LOCATIONS.find((l) => l.id === selectedLocationId) || LOKOJA_LOCATIONS[0];
  }, [selectedLocationId]);

  const tierBadgeInfo = useMemo(() => {
    return getLocationTierBadgeInfo(selectedLocationId);
  }, [selectedLocationId]);

  const filteredLocations = useMemo(() => {
    return LOKOJA_LOCATIONS.filter((loc) => {
      const matchesTier = zoneTierFilter === 'all' || loc.tier === zoneTierFilter;
      const matchesSearch =
        !searchQuery ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [zoneTierFilter, searchQuery]);

  const getEtaForTier = (tier?: string) => {
    if (tier === 'Tier 1') return '10–15 min';
    if (tier === 'Tier 2') return '15–25 min';
    return '25–40 min';
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-4 sm:p-5 shadow-lg shadow-orange-500/5 space-y-3.5 transition-all">
      {/* Top Active Neighborhood Bar & Expand Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-on-surface">
            <MapPin className="w-3.5 h-3.5 text-primary animate-bounce" />
            <span>Delivery Destination in Lokoja</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="font-headline font-bold text-base sm:text-lg text-on-surface">
              {currentLocation.name}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${tierBadgeInfo.badgeClass}`}>
              <Clock className="w-3 h-3" />
              <span>{tierBadgeInfo.badgeText}</span>
            </span>
            <span className="text-xs font-semibold text-on-surface-variant/80 hidden sm:inline">
              • Direct Courier Dispatch
            </span>
          </div>
        </div>

        {/* Change Neighborhood Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <span>{isExpanded ? 'Hide Neighborhoods' : 'Change Neighborhood (25 Zones)'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expandable Interactive Pill Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden pt-2 border-t border-outline-variant/20 space-y-3"
          >
            {/* Filter Tabs & Quick Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setZoneTierFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    zoneTierFilter === 'all'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All ({LOKOJA_LOCATIONS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setZoneTierFilter('Tier 1')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    zoneTierFilter === 'Tier 1'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  ⚡ Tier 1 Core
                </button>
                <button
                  type="button"
                  onClick={() => setZoneTierFilter('Tier 2')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    zoneTierFilter === 'Tier 2'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Tier 2 Mid
                </button>
                <button
                  type="button"
                  onClick={() => setZoneTierFilter('Tier 3')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    zoneTierFilter === 'Tier 3'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Tier 3 Perimeter
                </button>
              </div>

              {/* Fast Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find Lokongoma, Ganaja, GRA..."
                  className="w-full bg-white text-xs pl-8 pr-3 py-1.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Interactive Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto custom-scroll p-1">
              {filteredLocations.map((loc) => {
                const isSelected = loc.id === selectedLocationId;
                const eta = getEtaForTier(loc.tier);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc.id);
                      setIsExpanded(false);
                    }}
                    className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 group active:scale-95 ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white/80 hover:bg-white text-on-surface border-outline-variant/30 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-xs line-clamp-1">
                        {loc.name}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-white text-primary flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-black/5 dark:border-white/10">
                      <span className={isSelected ? 'text-white/90 font-medium' : 'text-on-surface-variant'}>
                        ₦{loc.baseTariff.toLocaleString()}
                      </span>
                      <span className={`font-bold ${isSelected ? 'text-white' : 'text-primary'}`}>
                        {eta}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
