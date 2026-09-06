import { APPROVED_LOKOJA_VENDORS } from '../data/approvedVendors';
import { RESTAURANTS_DATA } from '../data/mockData';
import { CartItem } from '../types';

export interface LokojaLocationZone {
  id: string;
  name: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  tierLabel: string;
  description: string;
  landmarks: string[];
  baseTariff: number;
}

// Complete Master Registry of Lokoja Neighborhood Zones
export const LOKOJA_LOCATIONS: LokojaLocationZone[] = [
  // 🟢 Tier 1: Core Urban Delivery Zones (Fast turnaround, dense courier presence)
  {
    id: 'lokongoma',
    name: 'Lokongoma Phase 1 & 2',
    tier: 'Tier 1',
    tierLabel: 'Tier 1 Core',
    description: 'Prime residential enclave, IBB Way, Somep Plaza, Kefas Hall axis',
    landmarks: ['Phase 1 Police Post', 'Phase 2 Avenue', 'Somep Plaza', 'Kefas Hall', 'Candef Energies'],
    baseTariff: 800,
  },
  {
    id: 'paparanda',
    name: 'Paparanda Square & Apata',
    tier: 'Tier 1',
    tierLabel: 'Tier 1 Core',
    description: 'Central Commercial District, Apata Roundabout, Central Market, High Street',
    landmarks: ['Paparanda Square', 'Apata Roundabout', 'Old Market Road', 'Crowther Memorial Area'],
    baseTariff: 800,
  },
  {
    id: 'gra',
    name: 'GRA & Hospital Road',
    tier: 'Tier 1',
    tierLabel: 'Tier 1 Core',
    description: 'Government Reserved Area, Federal Medical Centre (FMC), Aliu Attah Road',
    landmarks: ['FMC Lokoja Gate', 'Misturah Plaza', 'Township Stadium Axis', 'Aliu Attah Road'],
    baseTariff: 800,
  },
  {
    id: 'adankolo',
    name: 'Adankolo Road & Market',
    tier: 'Tier 1',
    tierLabel: 'Tier 1 Core',
    description: 'Riverside food hub, Adankolo Market, Moremi House, NTI Junction',
    landmarks: ['Moremi House', 'Adankolo Market Junction', 'River Basin Authority', 'NTI Axis'],
    baseTariff: 800,
  },
  {
    id: 'ganaja-junction',
    name: 'Ganaja Junction & Flyover',
    tier: 'Tier 1',
    tierLabel: 'Tier 1 Core',
    description: 'Eastern interchange corridor, Rianzo Plaza, Destiny Plaza, AP Filling Station',
    landmarks: ['Ganaja Flyover', 'Rianzo Plaza', 'Destiny Garden Plaza', 'Ganaja Junction Roundabout'],
    baseTariff: 800,
  },
  {
    id: 'ankpa-road',
    name: 'Ankpa Road Corridor',
    tier: 'Tier 1',
    tierLabel: 'Tier 1 Core',
    description: 'Commercial spine leading toward eastern highway exit and banking strip',
    landmarks: ['Treasures Ankpa Rd', 'Zenith Bank Branch', 'State Library Road'],
    baseTariff: 800,
  },

  // 🟡 Tier 2: Mid-Range Zones (Cross-Meme River, State Secretariat, Cantonment)
  {
    id: 'zone-8',
    name: 'Sarkin Noma & Zone 8 Secretariat',
    tier: 'Tier 2',
    tierLabel: 'Tier 2 Mid-Range',
    description: 'Kogi State Government Complex, House of Assembly, PDP Secretariat, Meme River',
    landmarks: ['State Secretariat Complex', 'Zone 8 Junction', 'PDP Secretariat', 'Sarkin Noma Main Gate'],
    baseTariff: 1200,
  },
  {
    id: 'hajiya-k-plaza',
    name: 'Hajiya K Plaza & Cantonment Road',
    tier: 'Tier 2',
    tierLabel: 'Tier 2 Mid-Range',
    description: 'Commercial shopping plaza cluster, Cantonment junction, Army Day axis',
    landmarks: ['Hajiya K Plaza', 'Cantonment Barracks Gate', 'Kwara Waterboard Axis'],
    baseTariff: 1200,
  },
  {
    id: 'kabawa',
    name: 'Kabawa & Marine Road',
    tier: 'Tier 2',
    tierLabel: 'Tier 2 Mid-Range',
    description: 'Historic riverside quarters, Maigari Palace, Confluence water front',
    landmarks: ['Maigari Palace', 'Old Marine Police Post', 'Kabawa Riverside'],
    baseTariff: 1200,
  },
  {
    id: 'crusher',
    name: 'Crusher & Sub-urban Axis',
    tier: 'Tier 2',
    tierLabel: 'Tier 2 Mid-Range',
    description: 'Murtala Mohammed Way extension toward Crusher community',
    landmarks: ['Crusher Junction', 'Quarry Outpost', 'Murtala Way Extension'],
    baseTariff: 1200,
  },

  // 🔴 Tier 3: Peripheral Extended Zones (Highway corridors, University & Poly outposts)
  {
    id: 'felele-poly',
    name: 'Felele & Federal Poly Corridor',
    tier: 'Tier 3',
    tierLabel: 'Tier 3 Peripheral',
    description: 'Federal Polytechnic campus axis, Felele Express, student hostels',
    landmarks: ['Federal Poly Main Gate', 'Felele Express Junction', 'Old Poly Quarters'],
    baseTariff: 2000,
  },
  {
    id: 'nataco',
    name: 'Nataco Area & A2 Highway',
    tier: 'Tier 3',
    tierLabel: 'Tier 3 Peripheral',
    description: 'Interstate motor parks, Nataco express transit hub, Abuja-Lokoja Highway',
    landmarks: ['Nataco Park Gate', 'A2 Expressway Overpass', 'GT Foods Nataco'],
    baseTariff: 2000,
  },
  {
    id: 'ganaja-village',
    name: 'Ganaja Village & 500 Housing Units',
    tier: 'Tier 3',
    tierLabel: 'Tier 3 Peripheral',
    description: 'Extended residential settlements, Gadumo, 500 Housing Units estate, Ajaokuta road',
    landmarks: ['500 Housing Units Gate', 'Gadumo Junction', 'Ganaja Village Square'],
    baseTariff: 2000,
  },
  {
    id: 'zango',
    name: 'Zango Daji & Outer Bypass',
    tier: 'Tier 3',
    tierLabel: 'Tier 3 Peripheral',
    description: 'Outlying community beyond Phase 2 towards western hills',
    landmarks: ['Zango Central Mosque', 'Outer Ring Bypass'],
    baseTariff: 2000,
  },
];

// Vendor Location Mapping
// Associates every vendor with their actual physical kitchen location in Lokoja
const VENDOR_LOCATION_MAP: Record<string, string> = {
  // Paparanda Square & Apata (Tier 1)
  'chicken-republic': 'paparanda',
  'vendor-cr': 'paparanda',
  'mama-ngozi': 'paparanda',
  'vendor-mn': 'paparanda',

  // Lokongoma Phase 1 & 2 (Tier 1)
  'craving-spot': 'lokongoma',
  'vendor-cs': 'lokongoma',
  'treasures-lokongoma': 'lokongoma',
  'vendor-tl': 'lokongoma',

  // Ganaja Junction & Flyover (Tier 1)
  'foodcastle': 'ganaja-junction',
  'vendor-fc': 'ganaja-junction',
  'treasures-bakery': 'ganaja-junction',
  'vendor-tb': 'ganaja-junction',

  // Ankpa Road (Tier 1)
  'treasures-ankpa': 'ankpa-road',
  'vendor-te': 'ankpa-road',

  // GRA & Hospital Road (Tier 1)
  'misi-t-gra': 'gra',
  'vendor-mt-gra': 'gra',

  // Adankolo Road & Market (Tier 1)
  'misi-t-adankolo': 'adankolo',
  'vendor-mt-adk': 'adankolo',
  'locafud-kitchen': 'adankolo',
  'vendor-lk': 'adankolo',
  'olive-food-court': 'adankolo',
  'vendor-of': 'adankolo',

  // Zone 8 & Sarkin Noma (Tier 2)
  'biteease': 'zone-8',
  'vendor-be': 'zone-8',

  // Hajiya K Plaza / Cantonment (Tier 2)
  'amak-restaurant': 'hajiya-k-plaza',
  'vendor-ar': 'hajiya-k-plaza',

  // Felele & Federal Poly (Tier 3)
  'spag-king': 'felele-poly',
  'vendor-sk': 'felele-poly',

  // Ganaja Village & 500 Housing (Tier 3)
  'shawarma-grills': 'ganaja-village',
  'vendor-sg': 'ganaja-village',

  // Nataco & A2 Highway (Tier 3)
  'gt-foods': 'nataco',
  'vendor-gt': 'nataco',
};

/**
 * Resolve a vendor's standardized location zone in Lokoja
 */
export function resolveVendorLocation(vendor: {
  id?: string;
  vendorId?: string;
  name?: string;
  address?: string;
}): LokojaLocationZone {
  const vid = (vendor.vendorId || vendor.id || '').toLowerCase();
  const name = (vendor.name || '').toLowerCase();
  const address = (vendor.address || '').toLowerCase();

  // 1. Direct map lookup
  if (VENDOR_LOCATION_MAP[vid]) {
    const loc = LOKOJA_LOCATIONS.find(l => l.id === VENDOR_LOCATION_MAP[vid]);
    if (loc) return loc;
  }

  // 2. Lookup by vendor name keywords
  if (name.includes('chicken republic') || name.includes('mama ngozi')) return LOKOJA_LOCATIONS.find(l => l.id === 'paparanda')!;
  if (name.includes('craving spot') || name.includes('lokongoma')) return LOKOJA_LOCATIONS.find(l => l.id === 'lokongoma')!;
  if (name.includes('foodcastle') || (name.includes('treasures') && name.includes('bakery'))) return LOKOJA_LOCATIONS.find(l => l.id === 'ganaja-junction')!;
  if (name.includes('treasures') && name.includes('ankpa')) return LOKOJA_LOCATIONS.find(l => l.id === 'ankpa-road')!;
  if (name.includes('gra') || name.includes('hospital')) return LOKOJA_LOCATIONS.find(l => l.id === 'gra')!;
  if (name.includes('adankolo') || name.includes('locafud') || name.includes('olive')) return LOKOJA_LOCATIONS.find(l => l.id === 'adankolo')!;
  if (name.includes('biteease') || name.includes('zone 8') || name.includes('sarkin noma')) return LOKOJA_LOCATIONS.find(l => l.id === 'zone-8')!;
  if (name.includes('amak') || name.includes('hajiya')) return LOKOJA_LOCATIONS.find(l => l.id === 'hajiya-k-plaza')!;
  if (name.includes('spag') || name.includes('felele') || name.includes('poly')) return LOKOJA_LOCATIONS.find(l => l.id === 'felele-poly')!;
  if (name.includes('shawarma') || name.includes('ganaja village')) return LOKOJA_LOCATIONS.find(l => l.id === 'ganaja-village')!;
  if (name.includes('gt food') || name.includes('nataco')) return LOKOJA_LOCATIONS.find(l => l.id === 'nataco')!;

  // 3. Lookup by address keywords
  for (const loc of LOKOJA_LOCATIONS) {
    if (address.includes(loc.name.toLowerCase()) || address.includes(loc.id)) {
      return loc;
    }
  }

  // Default fallback: Tier 1 Core Lokongoma
  return LOKOJA_LOCATIONS[0];
}

/**
 * Calculate accurate delivery dispatch fee between a vendor kitchen pickup location and the customer destination
 */
export function calculateLocationDispatchFee(
  vendorLocation: LokojaLocationZone,
  customerLocation: LokojaLocationZone
): { fee: number; reason: string; eta: string } {
  // Case 1: Same exact neighborhood (e.g. Lokongoma to Lokongoma)
  if (vendorLocation.id === customerLocation.id) {
    if (vendorLocation.tier === 'Tier 1') {
      return {
        fee: 800,
        reason: `Intra-${vendorLocation.name} immediate transit (fastest turnaround)`,
        eta: '10–15 mins'
      };
    }
    return {
      fee: vendorLocation.baseTariff,
      reason: `Intra-${vendorLocation.name} local dispatch`,
      eta: '12–18 mins'
    };
  }

  // Case 2: Both locations are in Tier 1 Core (e.g. Paparanda to Lokongoma, GRA to Ganaja Junction)
  if (vendorLocation.tier === 'Tier 1' && customerLocation.tier === 'Tier 1') {
    return {
      fee: 800,
      reason: `${vendorLocation.name} → ${customerLocation.name} • Tier 1 Core intra-city corridor`,
      eta: '15–20 mins'
    };
  }

  // Case 3: Either is Tier 3 Peripheral (Highway corridor / Federal Poly / Nataco / Ganaja Village)
  if (vendorLocation.tier === 'Tier 3' || customerLocation.tier === 'Tier 3') {
    if (vendorLocation.tier === 'Tier 3' && customerLocation.tier === 'Tier 3') {
      return {
        fee: 2200,
        reason: `${vendorLocation.name} → ${customerLocation.name} • Cross-highway long-haul corridor`,
        eta: '30–45 mins'
      };
    }
    return {
      fee: 2000,
      reason: `${vendorLocation.name} → ${customerLocation.name} • Extended Tier 3 peripheral transit`,
      eta: '25–40 mins'
    };
  }

  // Case 4: Tier 1 to Tier 2, or Tier 2 to Tier 2 (e.g. Zone 8 / Sarkin Noma cross-Meme river)
  return {
    fee: 1200,
    reason: `${vendorLocation.name} → ${customerLocation.name} • Tier 2 Mid-Range cross-zone bridge`,
    eta: '20–30 mins'
  };
}

export interface VendorAllocationDetail {
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  address: string;
  location: LokojaLocationZone;
  items: CartItem[];
  foodSubtotal: number;
  packagingFee: number;
  dispatchShare: number;
  totalToPay: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  isSharedLocation: boolean;
  coLocatedVendorNames: string[];
}

export interface LocationPickupStop {
  location: LokojaLocationZone;
  vendorNames: string[];
  vendorCount: number;
  isShared: boolean;
  locationDispatchFee: number;
  reason: string;
  eta: string;
}

export interface MultiVendorCalculationResult {
  customerLocation: LokojaLocationZone;
  customerAddressText: string;
  vendorAllocations: VendorAllocationDetail[];
  locationStops: LocationPickupStop[];
  distinctVendorCount: number;
  distinctLocationCount: number;
  sharedLocationCount: number;
  totalFoodSubtotal: number;
  totalPackagingFee: number;
  totalDispatchFee: number;
  grandTotal: number;
  isMultiVendor: boolean;
  hasCoLocatedVendors: boolean;
}

/**
 * MASTER MULTI-VENDOR DISPATCH & ALLOCATION ENGINE
 * Resolves each distinct vendor, maps them to physical Lokoja locations,
 * calculates dispatch fees for each UNIQUE location to customer location,
 * groups shared locations, and calculates exact amounts to pay each vendor.
 */
export function calculateMultiVendorOrderTotals(
  items: CartItem[],
  customerLocationId: string = 'lokongoma',
  customerAddressText: string = 'Lokongoma Phase 1, Near Police Post'
): MultiVendorCalculationResult {
  const customerLoc = LOKOJA_LOCATIONS.find(l => l.id === customerLocationId) || LOKOJA_LOCATIONS[0];

  // 1. Group items by distinct vendor
  const vendorMap = new Map<string, {
    vendorInfo: typeof APPROVED_LOKOJA_VENDORS[0];
    items: CartItem[];
    foodSubtotal: number;
  }>();

  items.forEach(item => {
    // Match to APPROVED_LOKOJA_VENDORS or RESTAURANTS_DATA
    const matchedApproved = APPROVED_LOKOJA_VENDORS.find(v =>
      (item.vendorId && (v.id === item.vendorId || v.vendorId === item.vendorId)) ||
      (item.vendorName && v.name.toLowerCase() === item.vendorName.toLowerCase()) ||
      v.menuOfferings?.some(m => m.id === item.id || m.name.toLowerCase() === item.name.toLowerCase())
    );

    const matchedRestaurant = RESTAURANTS_DATA.find(r =>
      (item.vendorId && r.id === item.vendorId) ||
      (item.vendorName && r.name.toLowerCase() === item.vendorName.toLowerCase())
    );

    // Fallback or synthesised vendor info ensuring distinct vendorId is respected
    const vendorId = item.vendorId || (matchedApproved ? matchedApproved.vendorId : (matchedRestaurant ? matchedRestaurant.id : 'vendor-unknown'));
    const vendorName = item.vendorName || (matchedApproved ? matchedApproved.name : (matchedRestaurant ? matchedRestaurant.name : 'Confluence Kitchen'));

    const key = vendorId;

    if (!vendorMap.has(key)) {
      const baseApproved = matchedApproved || {
        id: `vendor-${key}`,
        vendorId: key,
        name: vendorName,
        ownerName: 'Kitchen Manager',
        address: matchedRestaurant ? matchedRestaurant.address : 'Lokoja, Kogi State',
        phone: matchedRestaurant ? matchedRestaurant.phone : '+2349074072454',
        email: `${key}@lokochop.ng`,
        category: matchedRestaurant ? matchedRestaurant.category || 'Local Food' : 'Local Food',
        tier: matchedRestaurant ? matchedRestaurant.tier : 'Tier 1',
        credentials: { identifier: `${key}@lokochop.ng`, passcode: 'chop2026', pin: '2600' },
        bankDetails: {
          bankName: 'First Bank of Nigeria',
          accountNumber: '3089421570',
          accountName: `${vendorName} Operations`,
        },
        logo: { initials: vendorName.slice(0, 2).toUpperCase(), bg: 'bg-primary', textColor: 'text-white' },
        shortOfferingsList: [],
        menuOfferings: [],
        commissionRate: 8.0,
        dailyGrossGMV: 40000,
      };

      vendorMap.set(key, {
        vendorInfo: baseApproved,
        items: [],
        foodSubtotal: 0,
      });
    }

    const group = vendorMap.get(key)!;
    group.items.push(item);
    group.foodSubtotal += item.price * item.quantity;
  });

  const rawVendors = Array.from(vendorMap.values());

  // 2. Map each vendor to their official Lokoja location
  const vendorsWithLocations = rawVendors.map(v => {
    const loc = resolveVendorLocation({
      id: v.vendorInfo.id,
      vendorId: v.vendorInfo.vendorId,
      name: v.vendorInfo.name,
      address: v.vendorInfo.address
    });
    return {
      ...v,
      location: loc
    };
  });

  // 3. Group vendors by Location to handle "except if 2 vendors are in the same location"
  const locationStopMap = new Map<string, {
    location: LokojaLocationZone;
    vendors: typeof vendorsWithLocations;
    locationDispatchFee: number;
    reason: string;
    eta: string;
  }>();

  vendorsWithLocations.forEach(v => {
    const locKey = v.location.id;
    if (!locationStopMap.has(locKey)) {
      const feeResult = calculateLocationDispatchFee(v.location, customerLoc);
      locationStopMap.set(locKey, {
        location: v.location,
        vendors: [],
        locationDispatchFee: feeResult.fee,
        reason: feeResult.reason,
        eta: feeResult.eta
      });
    }
    locationStopMap.get(locKey)!.vendors.push(v);
  });

  // 4. Build Location Pickup Stops list
  const locationStops: LocationPickupStop[] = Array.from(locationStopMap.values()).map(entry => ({
    location: entry.location,
    vendorNames: entry.vendors.map(v => v.vendorInfo.name),
    vendorCount: entry.vendors.length,
    isShared: entry.vendors.length > 1,
    locationDispatchFee: entry.locationDispatchFee,
    reason: entry.reason,
    eta: entry.eta
  }));

  // 5. Total Dispatch Fee is the sum of dispatch fees for each UNIQUE location!
  const totalDispatchFee = locationStops.reduce((sum, stop) => sum + stop.locationDispatchFee, 0);

  // 6. Build Vendor Allocation Details
  // Each vendor gets their food subtotal + packaging fee (₦250) + their location's dispatch share
  const vendorAllocations: VendorAllocationDetail[] = vendorsWithLocations.map(v => {
    const stopEntry = locationStopMap.get(v.location.id)!;
    const coVendorsCount = stopEntry.vendors.length;
    // If multiple vendors share this location stop, split this location's dispatch fee equally
    const dispatchShare = Math.round(stopEntry.locationDispatchFee / coVendorsCount);
    const packagingFee = 250;
    const totalToPay = v.foodSubtotal + packagingFee + dispatchShare;

    return {
      vendorId: v.vendorInfo.vendorId || v.vendorInfo.id,
      vendorName: v.vendorInfo.name,
      vendorPhone: v.vendorInfo.phone,
      address: v.vendorInfo.address,
      location: v.location,
      items: v.items,
      foodSubtotal: v.foodSubtotal,
      packagingFee,
      dispatchShare,
      totalToPay,
      bankDetails: v.vendorInfo.bankDetails,
      isSharedLocation: coVendorsCount > 1,
      coLocatedVendorNames: stopEntry.vendors
        .filter(other => other.vendorInfo.name !== v.vendorInfo.name)
        .map(other => other.vendorInfo.name),
    };
  });

  const totalFoodSubtotal = vendorAllocations.reduce((sum, v) => sum + v.foodSubtotal, 0);
  const totalPackagingFee = vendorAllocations.reduce((sum, v) => sum + v.packagingFee, 0);
  const grandTotal = totalFoodSubtotal + totalPackagingFee + totalDispatchFee;

  const sharedLocationCount = locationStops.filter(s => s.isShared).length;

  return {
    customerLocation: customerLoc,
    customerAddressText,
    vendorAllocations,
    locationStops,
    distinctVendorCount: vendorAllocations.length,
    distinctLocationCount: locationStops.length,
    sharedLocationCount,
    totalFoodSubtotal,
    totalPackagingFee,
    totalDispatchFee,
    grandTotal,
    isMultiVendor: vendorAllocations.length > 1,
    hasCoLocatedVendors: sharedLocationCount > 0,
  };
}
