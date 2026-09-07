// src/services/vendorStockService.ts
/**
 * LokoChop Vendor Stock & Availability Service
 *
 * Operational Rule:
 * 1. By 10:00 AM, most Lokoja kitchens and bukas have their main food pots cooked and warm in display warmers.
 *    Orders do not need to be cooked from scratch; kitchens portion & seal tamper-evident packaging in 3-7 mins.
 * 2. Vendors are notified on WhatsApp every morning by 10:00 AM, 12:00 Noon, 2:00 PM,
 *    and every 2 hours subsequently (4:00 PM, 6:00 PM, 8:00 PM) to update live stock and mark available vs out-of-stock items.
 */

import { LOKOCHOP_SUPPORT_WHATSAPP } from './orderService';

export interface StockScheduleSlot {
  slot: string; // e.g. '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'
  hour: number; // 24-hour format
  minute: number;
  label: string;
  description: string;
}

export const STOCK_NOTIFICATION_SLOTS: StockScheduleSlot[] = [
  {
    slot: '10:00 AM',
    hour: 10,
    minute: 0,
    label: 'Morning Opening Stock',
    description: 'Pots ready in food warmers; confirm morning batch availability.'
  },
  {
    slot: '12:00 PM',
    hour: 12,
    minute: 0,
    label: 'Civil Servant & Confluence Lunch',
    description: 'Peak lunch rush check; mark sold-out soups and rice replenishments.'
  },
  {
    slot: '2:00 PM',
    hour: 14,
    minute: 0,
    label: 'Afternoon Stock Update',
    description: 'Afternoon replenishment; update fast-moving swallows and grills.'
  },
  {
    slot: '4:00 PM',
    hour: 16,
    minute: 0,
    label: 'Late Afternoon Wrap',
    description: 'Offices closing; verify available dinner portions and snacks.'
  },
  {
    slot: '6:00 PM',
    hour: 18,
    minute: 0,
    label: 'Evening & Grill Peak',
    description: 'Supper, shawarma, loaded fries, and fresh evening pepper soup.'
  },
  {
    slot: '8:00 PM',
    hour: 20,
    minute: 0,
    label: 'Night-Time Closing Stock',
    description: 'Final available portions before kitchen close-down.'
  }
];

export interface VendorDishItem {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

// Local storage key for dynamic stock overrides
const STOCK_OVERRIDE_KEY = 'lokochop_dish_stock_overrides';
const VENDOR_LAST_CONFIRMED_KEY = 'lokochop_vendor_stock_confirmed_times';

export const getDishStockOverrides = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(STOCK_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setDishStockStatus = (dishId: string, inStock: boolean): void => {
  try {
    const current = getDishStockOverrides();
    current[dishId] = inStock;
    localStorage.setItem(STOCK_OVERRIDE_KEY, JSON.stringify(current));
    // Dispatch custom event for reactive UI updates
    window.dispatchEvent(new CustomEvent('lokochop_stock_updated', { detail: { dishId, inStock } }));
  } catch (err) {
    console.warn('Failed to save stock status override', err);
  }
};

export const getVendorLastConfirmedTimes = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(VENDOR_LAST_CONFIRMED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const recordVendorStockConfirmation = (vendorId: string, slot: string): void => {
  try {
    const current = getVendorLastConfirmedTimes();
    current[vendorId] = `${slot} (Confirmed ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    localStorage.setItem(VENDOR_LAST_CONFIRMED_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('lokochop_vendor_confirmed_updated', { detail: { vendorId, slot } }));
  } catch (err) {
    console.warn('Failed to record stock confirmation', err);
  }
};

/**
 * Determine current active slot and next upcoming slot with minutes remaining.
 */
export const getCurrentAndNextStockSlot = (): {
  currentSlot: StockScheduleSlot;
  nextSlot: StockScheduleSlot;
  minutesToNextSlot: number;
  isKitchenReadyWindow: boolean; // True from 10am to closing
} => {
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  // Find slot that just passed or is active
  let currentSlot = STOCK_NOTIFICATION_SLOTS[0];
  let nextSlot = STOCK_NOTIFICATION_SLOTS[1];

  for (let i = 0; i < STOCK_NOTIFICATION_SLOTS.length; i++) {
    const slotMinutes = STOCK_NOTIFICATION_SLOTS[i].hour * 60 + STOCK_NOTIFICATION_SLOTS[i].minute;
    if (currentTotalMinutes >= slotMinutes) {
      currentSlot = STOCK_NOTIFICATION_SLOTS[i];
      nextSlot = STOCK_NOTIFICATION_SLOTS[(i + 1) % STOCK_NOTIFICATION_SLOTS.length];
    }
  }

  // Calculate minutes to next slot
  const nextSlotTotalMinutes = nextSlot.hour * 60 + nextSlot.minute;
  let minutesDiff = nextSlotTotalMinutes - currentTotalMinutes;
  if (minutesDiff <= 0) {
    // Wrapped to tomorrow 10am
    minutesDiff = (24 * 60 - currentTotalMinutes) + (STOCK_NOTIFICATION_SLOTS[0].hour * 60 + STOCK_NOTIFICATION_SLOTS[0].minute);
  }

  const isKitchenReadyWindow = now.getHours() >= 10 && now.getHours() < 22;

  return {
    currentSlot,
    nextSlot,
    minutesToNextSlot: minutesDiff,
    isKitchenReadyWindow
  };
};

/**
 * Builds the WhatsApp notification URL sent to the VENDOR'S direct phone number.
 * This reminds them to update their live stock for the active 2-hour window.
 */
export const buildVendorStockPromptWhatsAppUrl = (
  vendorPhone: string,
  vendorName: string,
  dishes: { name: string; inStock?: boolean }[],
  slotLabel?: string
): string => {
  const cleanPhone = (vendorPhone || '').replace(/\D/g, '');
  const activeSlot = slotLabel || getCurrentAndNextStockSlot().currentSlot.slot;

  const dishList = dishes
    .slice(0, 8)
    .map(d => `• ${d.name}: [${d.inStock !== false ? '✅ Available' : '❌ Sold Out'}]`)
    .join('\n');

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lokochop.ng';

  const message = `🍲 *LOKOCHOP KITCHEN STOCK CHECK (${activeSlot})*
----------------------------------------
*Kitchen:* ${vendorName}
*Target Time:* ${activeSlot}

Good day Chef! It's ${activeSlot}. 
As per Lokoja standard, your morning cooking pots are ready in food warmers for fast 5-minute packaging.

Please review your menu items below for this 2-hour window:
${dishList}

📲 *Update in 1 Tap on your Vendor Hub:*
${originUrl}?view=vendor-hub&tab=menu

Or reply directly here with:
"All available" or specify which soup/dish is sold out for Central Dispatch!

- LokoChop Confluence Dispatch Operations`;

  return `https://wa.me/${cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Builds the WhatsApp message from the VENDOR to Central Support confirming their stock.
 */
export const buildVendorStockConfirmationToSupportUrl = (
  vendorName: string,
  availableCount: number,
  soldOutItems: string[],
  slotLabel?: string
): string => {
  const activeSlot = slotLabel || getCurrentAndNextStockSlot().currentSlot.slot;

  const message = `✅ *LOKOCHOP VENDOR STOCK UPDATE (${activeSlot})*
----------------------------------------
*Kitchen:* ${vendorName}
*Confirmed Slot:* ${activeSlot}
*Status:* ${availableCount} dishes confirmed READY & WARM.

${soldOutItems.length > 0 ? `*Sold Out / Finished Pots:*
${soldOutItems.map(s => `• ${s}`).join('\n')}` : 'All listed menu dishes are in stock & ready in food warmers.'}

Packaging turnaround: 3–7 minutes per order. Ready for courier collection!`;

  return `https://wa.me/${LOKOCHOP_SUPPORT_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
};
