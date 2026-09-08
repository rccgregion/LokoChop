import { APPROVED_LOKOJA_VENDORS } from '../data/approvedVendors';
import { RESTAURANTS_DATA } from '../data/mockData';
import { CartItem } from '../types';

export interface LokojaLocationZone {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  baseTariff: number;
  description: string;
  landmarks: string[];
  tier?: 'Tier 1' | 'Tier 2' | 'Tier 3';
  tierLabel?: string;
}

// Complete Master Registry of 25 Lokoja Delivery Neighborhoods
export const LOKOJA_LOCATIONS: LokojaLocationZone[] = [
  {
    id: 'adankolo',
    name: 'Adankolo',
    coordinates: { x: 1.2, y: -1.5 },
    baseTariff: 800,
    description: 'Riverside food hub, Adankolo Market, Moremi House, NTI Junction',
    landmarks: ['Moremi House', 'Adankolo Market Junction', 'River Basin Authority', 'NTI Axis'],
    tier: 'Tier 1',
    tierLabel: 'Adankolo',
  },
  {
    id: 'apata',
    name: 'Apata',
    coordinates: { x: -0.5, y: 0.5 },
    baseTariff: 800,
    description: 'Central commercial district, Apata Roundabout, Central Mosque corridor',
    landmarks: ['Apata Roundabout', 'Old Market Road', 'Crowther Memorial Area'],
    tier: 'Tier 1',
    tierLabel: 'Apata',
  },
  {
    id: 'banda',
    name: 'Banda',
    coordinates: { x: -3.5, y: 11.0 },
    baseTariff: 2200,
    description: 'Northern highway gateway, Abuja-Lokoja expressway outpost',
    landmarks: ['Banda Community Gate', 'A2 Highway Corridor'],
    tier: 'Tier 3',
    tierLabel: 'Banda',
  },
  {
    id: 'barracks-area',
    name: 'Barracks Area (Army & Police)',
    coordinates: { x: 2.2, y: 1.5 },
    baseTariff: 1000,
    description: 'Cantonment barracks corridor, Army Day, Police Headquarters axis',
    landmarks: ['Cantonment Gate', 'Police Barracks', 'Army Day Secondary School Axis'],
    tier: 'Tier 2',
    tierLabel: 'Barracks Area',
  },
  {
    id: 'felele',
    name: 'Felele',
    coordinates: { x: -2.2, y: 6.8 },
    baseTariff: 1800,
    description: 'Federal Polytechnic campus axis, Felele Express, student hostels corridor',
    landmarks: ['Federal Poly Main Gate', 'Felele Express Junction', 'Student Hostels Axis'],
    tier: 'Tier 3',
    tierLabel: 'Felele',
  },
  {
    id: 'ganaja-junction-axis',
    name: 'Ganaja Junction Axis',
    coordinates: { x: 4.2, y: -4.0 },
    baseTariff: 800,
    description: 'Eastern transit interchange corridor, Rianzo Plaza, Destiny Plaza, AP Station',
    landmarks: ['Ganaja Flyover', 'Rianzo Plaza', 'Destiny Garden Plaza', 'Ganaja Junction Roundabout'],
    tier: 'Tier 1',
    tierLabel: 'Ganaja Junction Axis',
  },
  {
    id: 'ganaja-village',
    name: 'Ganaja Village',
    coordinates: { x: 7.5, y: -6.5 },
    baseTariff: 1800,
    description: 'Extended residential settlements, Gadumo, 500 Housing Units estate, Ajaokuta road',
    landmarks: ['500 Housing Units Gate', 'Gadumo Junction', 'Ganaja Village Square'],
    tier: 'Tier 3',
    tierLabel: 'Ganaja Village',
  },
  {
    id: 'gra',
    name: 'GRA (Government Reservation Area)',
    coordinates: { x: -0.3, y: -1.2 },
    baseTariff: 800,
    description: 'Government Reserved Area, Federal Medical Centre (FMC), Aliu Attah Road',
    landmarks: ['FMC Lokoja Gate', 'Misturah Plaza', 'Township Stadium Axis', 'Aliu Attah Road'],
    tier: 'Tier 1',
    tierLabel: 'GRA',
  },
  {
    id: 'kabawa',
    name: 'Kabawa',
    coordinates: { x: 0.8, y: 1.5 },
    baseTariff: 900,
    description: 'Historic riverside quarters, Maigari Palace, Confluence water front',
    landmarks: ['Maigari Palace', 'Old Marine Police Post', 'Kabawa Riverside'],
    tier: 'Tier 2',
    tierLabel: 'Kabawa',
  },
  {
    id: 'kporoka',
    name: 'Kporoka',
    coordinates: { x: 0.5, y: -0.3 },
    baseTariff: 800,
    description: 'Downtown commercial and banking axis near central market',
    landmarks: ['Kporoka Junction', 'Central Commercial Road', 'Post Office Axis'],
    tier: 'Tier 1',
    tierLabel: 'Kporoka',
  },
  {
    id: 'lokongoma-phase-1',
    name: 'Lokongoma Phase I',
    coordinates: { x: 2.5, y: -2.8 },
    baseTariff: 800,
    description: 'Prime residential enclave, IBB Way, Phase 1 Police Post, Kefas Hall axis',
    landmarks: ['Phase 1 Police Post', 'IBB Way Avenue', 'Kefas Hall Axis'],
    tier: 'Tier 1',
    tierLabel: 'Lokongoma Phase I',
  },
  {
    id: 'lokongoma-phase-2',
    name: 'Lokongoma Phase II',
    coordinates: { x: 3.5, y: -3.5 },
    baseTariff: 800,
    description: 'Somep Plaza, Candef Energies, Phase 2 commercial corridor along IBB Way',
    landmarks: ['Somep Plaza', 'Phase 2 Avenue', 'Candef Energies'],
    tier: 'Tier 1',
    tierLabel: 'Lokongoma Phase II',
  },
  {
    id: 'marine-quarters',
    name: 'Marine Quarters',
    coordinates: { x: 0.4, y: 1.2 },
    baseTariff: 900,
    description: 'Historic river port and marine heritage quarter',
    landmarks: ['Inland Waterways Jetty', 'Marine Road', 'Old Marine Police Post'],
    tier: 'Tier 2',
    tierLabel: 'Marine Quarters',
  },
  {
    id: 'meme-bridge-area',
    name: 'Meme Bridge Area',
    coordinates: { x: 2.0, y: 0.5 },
    baseTariff: 900,
    description: 'River crossing corridor connecting central town and Zone 8',
    landmarks: ['Meme River Crossing', 'Meme Bridge Road', 'Water Works Axis'],
    tier: 'Tier 2',
    tierLabel: 'Meme Bridge Area',
  },
  {
    id: 'mount-patti-road',
    name: 'Mount Patti Road / Club Area',
    coordinates: { x: -0.8, y: 1.0 },
    baseTariff: 900,
    description: 'Elevated scenic hillside community and historic Lokoja club grounds',
    landmarks: ['Mount Patti Ascent Road', 'Lokoja Club 1901', 'Tourist Lookout Point'],
    tier: 'Tier 2',
    tierLabel: 'Mount Patti Road',
  },
  {
    id: 'nataco',
    name: 'Nataco / Nataco Junction',
    coordinates: { x: -1.5, y: 4.5 },
    baseTariff: 1600,
    description: 'Interstate motor parks, Nataco express transit hub, Abuja-Lokoja Highway',
    landmarks: ['Nataco Park Gate', 'A2 Expressway Overpass', 'GT Foods Nataco'],
    tier: 'Tier 3',
    tierLabel: 'Nataco',
  },
  {
    id: 'new-mami-market',
    name: 'New Mami Market Area',
    coordinates: { x: 2.5, y: 1.8 },
    baseTariff: 1000,
    description: 'Lively trade hub adjacent to cantonment grounds',
    landmarks: ['New Mami Market Entrance', 'Cantonment North Gate'],
    tier: 'Tier 2',
    tierLabel: 'New Mami Market Area',
  },
  {
    id: 'old-poly-quarters',
    name: 'Old Poly Quarters',
    coordinates: { x: -2.5, y: 7.2 },
    baseTariff: 1800,
    description: 'Polytechnic staff and student residential enclave along Felele corridor',
    landmarks: ['Old Poly Quarters Road', 'Poly Staff Enclave'],
    tier: 'Tier 3',
    tierLabel: 'Old Poly Quarters',
  },
  {
    id: 'otokiti',
    name: 'Otokiti Housing Estate',
    coordinates: { x: -2.5, y: -3.0 },
    baseTariff: 1200,
    description: 'Organized residential estate along southwestern ring bypass',
    landmarks: ['Otokiti Estate Main Gate', 'Western Ring Bypass Axis'],
    tier: 'Tier 2',
    tierLabel: 'Otokiti',
  },
  {
    id: 'paparanda',
    name: 'Paparanda',
    coordinates: { x: 0, y: 0 },
    baseTariff: 800,
    description: 'Central commercial district, Paparanda Square, Central Market, High Street',
    landmarks: ['Paparanda Square', 'Central Post Office', 'High Street'],
    tier: 'Tier 1',
    tierLabel: 'Paparanda',
  },
  {
    id: 'sabon-gari',
    name: 'Sabon Gari Lokoja',
    coordinates: { x: 0.7, y: 0.4 },
    baseTariff: 800,
    description: 'Historic commercial and residential community along Ankpa Road corridor',
    landmarks: ['Sabon Gari Market', 'Ankpa Road Junction', 'Crowther Hill Foot'],
    tier: 'Tier 1',
    tierLabel: 'Sabon Gari Lokoja',
  },
  {
    id: 'sarkin-noma',
    name: 'Sarkin Noma',
    coordinates: { x: 4.2, y: 2.0 },
    baseTariff: 1100,
    description: 'Thriving township community across Meme River bridge',
    landmarks: ['Sarkin Noma Main Gate', 'Meme River North Bank', 'Fish Market'],
    tier: 'Tier 2',
    tierLabel: 'Sarkin Noma',
  },
  {
    id: 'workers-village',
    name: 'Workers Village',
    coordinates: { x: -3.8, y: -3.5 },
    baseTariff: 1400,
    description: 'Civil service residential quarters towards Crusher axis',
    landmarks: ['Workers Village Junction', 'Crusher Outpost Road'],
    tier: 'Tier 2',
    tierLabel: 'Workers Village',
  },
  {
    id: 'zango',
    name: 'Zango',
    coordinates: { x: -4.5, y: -2.0 },
    baseTariff: 1600,
    description: 'Outlying community beyond Phase 2 towards western hills and outer ring',
    landmarks: ['Zango Central Mosque', 'Outer Ring Bypass'],
    tier: 'Tier 3',
    tierLabel: 'Zango',
  },
  {
    id: 'zone-8',
    name: 'Zone 8 / Secretariat Area',
    coordinates: { x: 3.8, y: 1.2 },
    baseTariff: 1100,
    description: 'Kogi State Government Complex, House of Assembly, High Courts, Judiciary',
    landmarks: ['State Secretariat Complex', 'Zone 8 Junction', 'Kogi House of Assembly', 'Customary Court of Appeal'],
    tier: 'Tier 2',
    tierLabel: 'Zone 8 / Secretariat Area',
  },
];

// Vendor Location Mapping
// Aliases mapping old IDs to current neighborhood IDs for backwards compatibility
export const LEGACY_ID_MAP: Record<string, string> = {
  'lokongoma': 'lokongoma-phase-1',
  'ganaja-junction': 'ganaja-junction-axis',
  'ankpa-road': 'sabon-gari',
  'hajiya-k-plaza': 'barracks-area',
  'crusher': 'workers-village',
  'felele-poly': 'felele',
};

// Associates every vendor with their actual physical kitchen location in Lokoja
const VENDOR_LOCATION_MAP: Record<string, string> = {
  // Paparanda
  'chicken-republic': 'paparanda',
  'vendor-cr': 'paparanda',
  'mama-ngozi': 'paparanda',
  'vendor-mn': 'paparanda',

  // Lokongoma Phase 1 & 2
  'craving-spot': 'lokongoma-phase-2',
  'vendor-cs': 'lokongoma-phase-2',
  'treasures-lokongoma': 'lokongoma-phase-1',
  'vendor-tl': 'lokongoma-phase-1',

  // Ganaja Junction Axis
  'foodcastle': 'ganaja-junction-axis',
  'vendor-fc': 'ganaja-junction-axis',
  'treasures-bakery': 'ganaja-junction-axis',
  'vendor-tb': 'ganaja-junction-axis',

  // Sabon Gari Lokoja / Ankpa Road
  'treasures-ankpa': 'sabon-gari',
  'vendor-te': 'sabon-gari',

  // GRA (Government Reservation Area)
  'misi-t-gra': 'gra',
  'vendor-mt-gra': 'gra',

  // Adankolo
  'misi-t-adankolo': 'adankolo',
  'vendor-mt-adk': 'adankolo',
  'locafud-kitchen': 'adankolo',
  'vendor-lk': 'adankolo',
  'olive-food-court': 'adankolo',
  'vendor-of': 'adankolo',

  // Zone 8 / Secretariat Area
  'biteease': 'zone-8',
  'vendor-be': 'zone-8',

  // Barracks Area (Army & Police)
  'amak-restaurant': 'barracks-area',
  'vendor-ar': 'barracks-area',

  // Felele
  'spag-king': 'felele',
  'vendor-sk': 'felele',

  // Ganaja Village
  'shawarma-grills': 'ganaja-village',
  'vendor-sg': 'ganaja-village',

  // Nataco / Nataco Junction
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
  if (name.includes('craving spot')) return LOKOJA_LOCATIONS.find(l => l.id === 'lokongoma-phase-2')!;
  if (name.includes('treasures') && name.includes('lokongoma')) return LOKOJA_LOCATIONS.find(l => l.id === 'lokongoma-phase-1')!;
  if (name.includes('foodcastle') || (name.includes('treasures') && name.includes('bakery'))) return LOKOJA_LOCATIONS.find(l => l.id === 'ganaja-junction-axis')!;
  if (name.includes('treasures') && name.includes('ankpa')) return LOKOJA_LOCATIONS.find(l => l.id === 'sabon-gari')!;
  if (name.includes('gra') || name.includes('hospital')) return LOKOJA_LOCATIONS.find(l => l.id === 'gra')!;
  if (name.includes('adankolo') || name.includes('locafud') || name.includes('olive')) return LOKOJA_LOCATIONS.find(l => l.id === 'adankolo')!;
  if (name.includes('biteease') || name.includes('zone 8') || name.includes('secretariat')) return LOKOJA_LOCATIONS.find(l => l.id === 'zone-8')!;
  if (name.includes('amak') || name.includes('barracks') || name.includes('cantonment')) return LOKOJA_LOCATIONS.find(l => l.id === 'barracks-area')!;
  if (name.includes('spag') || name.includes('felele') || name.includes('poly')) return LOKOJA_LOCATIONS.find(l => l.id === 'felele')!;
  if (name.includes('shawarma') || name.includes('ganaja village')) return LOKOJA_LOCATIONS.find(l => l.id === 'ganaja-village')!;
  if (name.includes('gt food') || name.includes('nataco')) return LOKOJA_LOCATIONS.find(l => l.id === 'nataco')!;

  // 3. Lookup by address keywords
  for (const loc of LOKOJA_LOCATIONS) {
    if (address.includes(loc.name.toLowerCase()) || address.includes(loc.id)) {
      return loc;
    }
  }

  // Default fallback: Lokongoma Phase I
  return LOKOJA_LOCATIONS.find(l => l.id === 'lokongoma-phase-1') || LOKOJA_LOCATIONS[0];
}

/**
 * Calculate accurate delivery dispatch fee between a vendor kitchen pickup location and the customer destination
 */
export function calculateLocationDispatchFee(
  vendorLocation: LokojaLocationZone,
  customerLocation: LokojaLocationZone
): { fee: number; reason: string; eta: string } {
  // Euclidean distance in km calculated from verified Lokoja coordinates
  const vCoord = vendorLocation.coordinates || { x: 0, y: 0 };
  const cCoord = customerLocation.coordinates || { x: 0, y: 0 };
  const dx = vCoord.x - cCoord.x;
  const dy = vCoord.y - cCoord.y;
  const dist = Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;

  // Case 1: Same exact neighborhood (e.g. Adankolo to Adankolo, Lokongoma Phase I to Lokongoma Phase I)
  if (vendorLocation.id === customerLocation.id) {
    return {
      fee: 800,
      reason: `Intra-${vendorLocation.name} immediate transit`,
      eta: '10–15 mins'
    };
  }

  // Case 2: Adjacent / short distance (dist <= 1.8 km)
  if (dist <= 1.8) {
    return {
      fee: 800,
      reason: `${vendorLocation.name} → ${customerLocation.name} • Local neighborhood dispatch (~${dist} km)`,
      eta: '10–15 mins'
    };
  }

  // Case 3: Standard urban transit (1.8 km < dist <= 4.5 km)
  if (dist <= 4.5) {
    return {
      fee: 1000,
      reason: `${vendorLocation.name} → ${customerLocation.name} • Urban corridor dispatch (~${dist} km)`,
      eta: '15–20 mins'
    };
  }

  // Case 4: Mid-range cross-town dispatch (4.5 km < dist <= 7.5 km)
  if (dist <= 7.5) {
    return {
      fee: 1400,
      reason: `${vendorLocation.name} → ${customerLocation.name} • Cross-town dispatch (~${dist} km)`,
      eta: '20–30 mins'
    };
  }

  // Case 5: Extended perimeter corridor dispatch (7.5 km < dist <= 11.0 km)
  if (dist <= 11.0) {
    return {
      fee: 1800,
      reason: `${vendorLocation.name} → ${customerLocation.name} • Extended perimeter corridor (~${dist} km)`,
      eta: '25–40 mins'
    };
  }

  // Case 6: Long-haul highway dispatch (dist > 11.0 km)
  return {
    fee: 2400,
    reason: `${vendorLocation.name} → ${customerLocation.name} • Long-haul highway dispatch (~${dist} km)`,
    eta: '35–50 mins'
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
  customerLocationId: string = 'lokongoma-phase-1',
  customerAddressText: string = 'Lokongoma Phase 1, Near Police Post'
): MultiVendorCalculationResult {
  const resolvedId = LEGACY_ID_MAP[customerLocationId] || customerLocationId;
  const customerLoc = LOKOJA_LOCATIONS.find(l => l.id === resolvedId || l.name.toLowerCase() === customerLocationId.toLowerCase()) || LOKOJA_LOCATIONS[0];

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
