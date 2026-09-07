import { VendorAddOn } from '../types';

export const DEFAULT_VENDOR_ADDONS: VendorAddOn[] = [
  {
    id: 'addon-zobo',
    name: 'Chilled Hibiscus Zobo Bottle (50cl)',
    category: 'drink',
    price: 800,
    available: true,
    description: 'Freshly brewed hibiscus infused with clove, ginger, and pineapple sweetness.',
    icon: '🍷'
  },
  {
    id: 'addon-chapman',
    name: 'Confluence Cold Chapman Drink',
    category: 'drink',
    price: 1000,
    available: true,
    description: 'Refreshing Nigerian signature fruit punch served ice-cold with cucumber notes.',
    icon: '🍹'
  },
  {
    id: 'addon-water',
    name: 'Bottled Spring Water (75cl)',
    category: 'drink',
    price: 400,
    available: true,
    description: 'Chilled pure table water.',
    icon: '💧'
  },
  {
    id: 'addon-malt',
    name: 'Cold Malt / Soda Pet Bottle',
    category: 'drink',
    price: 700,
    available: true,
    description: 'Ice-cold carbonated malt drink or soft drink.',
    icon: '🥤'
  },
  {
    id: 'addon-dodo',
    name: 'Fried Ripe Plantain (Dodo Portion)',
    category: 'side',
    price: 900,
    available: true,
    description: 'Sweet, caramelized golden-fried ripe plantain slices.',
    icon: '🍌'
  },
  {
    id: 'addon-stew',
    name: 'Extra Firewood Pepper Stew & Gravy',
    category: 'extra',
    price: 600,
    available: true,
    description: 'Extra rich firewood-simmered tomato pepper sauce for your rice or swallow.',
    icon: '🍲'
  },
  {
    id: 'addon-moimoi',
    name: 'Steamed Leaf Moi-Moi',
    category: 'side',
    price: 800,
    available: true,
    description: 'Fluffy steamed pure bean pudding spiced with crayfish and peppers.',
    icon: '🥠'
  },
  {
    id: 'addon-suya-pepper',
    name: 'Spicy Yaji Suya Pepper & Onions',
    category: 'extra',
    price: 400,
    available: true,
    description: 'Authentic crushed peanut and chili yaji spice blend with fresh onion rings.',
    icon: '🌶️'
  },
  {
    id: 'addon-coleslaw',
    name: 'Creamy Crunchy Coleslaw Cup',
    category: 'side',
    price: 700,
    available: true,
    description: 'Shredded fresh cabbage, carrots, and sweet creamy dressing.',
    icon: '🥗'
  }
];

const STORAGE_KEY_PREFIX = 'lokochop_vendor_addons_';

export function getVendorAddOns(vendorId: string): VendorAddOn[] {
  if (!vendorId) return DEFAULT_VENDOR_ADDONS;
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${vendorId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse vendor add-ons from storage', err);
  }
  return DEFAULT_VENDOR_ADDONS;
}

export function saveVendorAddOns(vendorId: string, addOns: VendorAddOn[]): void {
  if (!vendorId) return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${vendorId}`, JSON.stringify(addOns));
    // Dispatch a storage event or custom event so open components (like CartDrawer) can re-render instantly
    window.dispatchEvent(new CustomEvent('lokochop-addons-updated', { detail: { vendorId, addOns } }));
  } catch (err) {
    console.error('Failed to save vendor add-ons', err);
  }
}

export interface AvailableAddOnOption {
  id: string;
  name: string;
  category: 'drink' | 'side' | 'extra';
  price: number;
  description?: string;
  icon?: string;
  vendorId: string;
  vendorName: string;
}

/**
 * Returns the list of add-ons available from the vendors whose food is currently in the cart.
 * If multiple vendors are present, prioritizes the primary vendor, but includes distinct add-ons.
 */
export function getAvailableAddOnsForCart(
  cartVendors: { vendorId: string; vendorName: string }[]
): AvailableAddOnOption[] {
  if (!cartVendors || cartVendors.length === 0) {
    // Default fallback to Confluence Kitchen / Craving Spot
    return DEFAULT_VENDOR_ADDONS.filter(a => a.available).map(a => ({
      ...a,
      vendorId: 'craving-spot',
      vendorName: 'CRAVING SPOT'
    }));
  }

  const result: AvailableAddOnOption[] = [];
  const seenNames = new Set<string>();

  for (const v of cartVendors) {
    const vendorAddOns = getVendorAddOns(v.vendorId);
    for (const addOn of vendorAddOns) {
      if (addOn.available && !seenNames.has(addOn.name.toLowerCase())) {
        seenNames.add(addOn.name.toLowerCase());
        result.push({
          id: `${v.vendorId}-${addOn.id}`,
          name: addOn.name,
          category: addOn.category,
          price: addOn.price,
          description: addOn.description,
          icon: addOn.icon,
          vendorId: v.vendorId,
          vendorName: v.vendorName
        });
      }
    }
  }

  return result;
}
