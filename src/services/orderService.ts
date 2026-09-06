import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: string;
  vendorName?: string;
  vendorId?: string;
}

export interface VendorOrderShare {
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  items: OrderItem[];
  subtotal: number;
  locationKey?: string;
  locationName?: string;
  dispatchFeeShare?: number;
  packagingFeeShare?: number;
  totalPayableShare?: number;
  isSharedLocation?: boolean;
  coLocatedVendorNames?: string[];
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface LiveOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  customerName: string;
  customerPhone: string;
  destination: string;
  items: OrderItem[];
  foodSubtotal: number;
  dispatchFee: number;
  packagingFee: number;
  totalAmount: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  isMultiVendor?: boolean;
  vendorShares?: VendorOrderShare[];
  multiVendorSurcharge?: number;
  paymentStatus: 'pending_transfer' | 'customer_confirmed' | 'vendor_verified' | 'rejected';
  kitchenStatus: 'idle' | 'cooking' | 'packaging' | 'dispatched' | 'delivered';
  prepEtaMins: number;
  createdAt: string;
  customerConfirmedAt?: string;
  vendorVerifiedAt?: string;
  specialNote?: string;
  riderName?: string;
  riderPhone?: string;
  riderPickedUpAt?: string;
  deliveredAt?: string;
}

export interface SmsLogEntry {
  id: string;
  orderId: string;
  recipientPhone: string;
  message: string;
  status: 'delivered' | 'sent' | 'queued';
  gateway: 'Termii Nigeria' | 'Twilio Confluence';
  sentAt: string;
}

const LOCAL_STORAGE_ORDERS_KEY = 'lokochop_cloud_orders';
const LOCAL_STORAGE_SMS_KEY = 'lokochop_sms_logs';
export const LOKOCHOP_SUPPORT_WHATSAPP = '+2349074072454';
export const LOKOCHOP_SUPPORT_PHONE_CLEAN = '2349074072454';

// Helper: Format phone for wa.me URL
export function formatPhoneForWhatsApp(phone: string): string {
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '234' + clean.slice(1);
  }
  return clean || LOKOCHOP_SUPPORT_PHONE_CLEAN;
}

// Generate Pre-Filled WhatsApp URL for Vendor
export function buildVendorWhatsAppUrl(order: LiveOrder): string {
  const targetPhone = formatPhoneForWhatsApp(order.vendorPhone);
  const itemsText = order.items.map(it => `• ${it.quantity}x ${it.name} (₦${(it.price * it.quantity).toLocaleString()})`).join('\n');
  
  const text = 
`🔔 *LOKOCHOP NEW ORDER & PAYMENT ALERT*
----------------------------------------
*Order ID:* #${order.id}
*Customer:* ${order.customerName}
*Customer Phone:* ${order.customerPhone}
*Delivery Address:* ${order.destination}

💰 *Amount Sent:* ₦${order.totalAmount.toLocaleString()}
🏦 *Target Account:* ${order.bankDetails.bankName} - ${order.bankDetails.accountNumber}
*Account Name:* ${order.bankDetails.accountName}

🍲 *Ordered Dishes:*
${itemsText}

----------------------------------------
⚡ *ACTION REQUIRED:*
1. Please open your ${order.bankDetails.bankName} mobile app to verify credit of ₦${order.totalAmount.toLocaleString()}.
2. Confirm payment on your LokoChop Dashboard and set delivery ETA for the customer!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

// Generate Pre-Filled WhatsApp URL for Specific Vendor in a Multi-Vendor Order
export function buildVendorSpecificWhatsAppUrl(order: LiveOrder, share: VendorOrderShare): string {
  const targetPhone = formatPhoneForWhatsApp(share.vendorPhone);
  const itemsText = share.items.map(it => `• ${it.quantity}x ${it.name} (₦${(it.price * it.quantity).toLocaleString()})`).join('\n');
  
  const packaging = share.packagingFeeShare ?? 250;
  const dispatch = share.dispatchFeeShare ?? 0;
  const totalShare = share.totalPayableShare ?? (share.subtotal + packaging + dispatch);
  const locationInfo = share.locationName ? `\n📍 *Kitchen Pickup Zone:* ${share.locationName}${share.isSharedLocation ? ' (Shared Stop)' : ''}` : '';

  const text = 
`🔔 *LOKOCHOP MULTI-VENDOR DISPATCH & PAYMENT ALERT*
----------------------------------------
*Order ID:* #${order.id}
*Kitchen:* ${share.vendorName}${locationInfo}
*Customer:* ${order.customerName} (${order.customerPhone})
*Delivery Destination:* ${order.destination}

💰 *PAYMENT BREAKDOWN CREDITED TO YOUR KITCHEN:*
• Food Subtotal: ₦${share.subtotal.toLocaleString()}
• Thermal Packaging: ₦${packaging.toLocaleString()}
• Location Dispatch Share: ₦${dispatch.toLocaleString()}
👉 *TOTAL TRANSFERRED TO YOU:* ₦${totalShare.toLocaleString()}

🏦 *Target Account:* ${share.bankDetails.bankName} - ${share.bankDetails.accountNumber}
*Account Name:* ${share.bankDetails.accountName}

🍲 *Dishes Prepared by Your Kitchen:*
${itemsText}

----------------------------------------
⚡ *ACTION REQUIRED:*
1. Please open your ${share.bankDetails.bankName} mobile app to verify credit of ₦${totalShare.toLocaleString()}.
2. Our Confluence dispatch rider will pick up your packed meal along with dishes from other designated kitchens.
3. Confirm preparation on your LokoChop Hub!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

// Generate Pre-Filled WhatsApp URL for Central Support & Dispatch (+2349074072454)
export function buildSupportWhatsAppUrl(order: LiveOrder): string {
  // Case 1: Multi-Vendor Order with explicit vendorShares
  if (order.isMultiVendor && order.vendorShares && order.vendorShares.length > 0) {
    const kitchenSections = order.vendorShares.map((share, idx) => {
      const locText = share.locationName 
        ? ` (${share.locationName}${share.isSharedLocation ? ' • Shared Pickup Stop' : ''})` 
        : '';
      const vendorTotal = share.totalPayableShare || (share.subtotal + (share.packagingFeeShare ?? 250) + (share.dispatchFeeShare ?? 0));
      const dishesText = share.items.length > 0
        ? share.items.map(it => `  ▫️ ${it.quantity}x ${it.name} (₦${(it.price * it.quantity).toLocaleString()})`).join('\n')
        : '  ▫️ (Dishes prepared by this kitchen)';

      return `📍 *KITCHEN ${idx + 1}: ${share.vendorName}*${locText}
• Phone / Hotline: ${share.vendorPhone}
• Bank Account: ${share.bankDetails.bankName} - ${share.bankDetails.accountNumber} (${share.bankDetails.accountName})
• Amount Transferred to Kitchen: ₦${vendorTotal.toLocaleString()} (Food: ₦${share.subtotal.toLocaleString()} | Pack: ₦${(share.packagingFeeShare ?? 250).toLocaleString()} | Transit: ₦${(share.dispatchFeeShare ?? 0).toLocaleString()})
• Dishes to Collect from Kitchen:
${dishesText}`;
    }).join('\n\n');

    const text = 
`🛵 *LOKOCHOP PAYMENT DISPATCH NOTICE (CENTRAL DISPATCH)*
----------------------------------------
*Order ID:* #${order.id}
*Order Type:* ⚡ Multi-Vendor Order (${order.vendorShares.length} Kitchens)
*Customer:* ${order.customerName} (${order.customerPhone})
*Delivery Destination:* ${order.destination}

💰 *CONSOLIDATED FINANCIAL SUMMARY:*
• Food Subtotal: ₦${order.foodSubtotal.toLocaleString()}
• Total Dispatch Fee: ₦${order.dispatchFee.toLocaleString()}
• Thermal Packaging: ₦${order.packagingFee.toLocaleString()}
👉 *Total Transferred:* ₦${order.totalAmount.toLocaleString()}

----------------------------------------
📦 *ITEMIZED ORDERS PER VENDOR (${order.vendorShares.length} KITCHENS):*

${kitchenSections}

----------------------------------------
⚡ *CENTRAL DISPATCH ACTIONS:*
1. Dispatch rider assigned to collect packages sequentially from each listed kitchen.
2. Confirm each kitchen has received its direct bank credit alert before meal handover.
3. Deliver complete package to customer destination: ${order.destination}`;

    return `https://wa.me/${LOKOCHOP_SUPPORT_PHONE_CLEAN}?text=${encodeURIComponent(text)}`;
  }

  // Case 2: Multi-vendor fallback by grouping items by vendorName if present
  const itemsWithVendor = order.items.filter(it => it.vendorName);
  if (order.isMultiVendor && itemsWithVendor.length > 0) {
    const grouped = new Map<string, typeof order.items>();
    order.items.forEach(it => {
      const vName = it.vendorName || order.vendorName || 'Lokoja Kitchen';
      if (!grouped.has(vName)) grouped.set(vName, []);
      grouped.get(vName)!.push(it);
    });

    const vendorBlocks = Array.from(grouped.entries()).map(([vName, vItems], idx) => {
      const sub = vItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
      const dishes = vItems.map(it => `  ▫️ ${it.quantity}x ${it.name} (₦${(it.price * it.quantity).toLocaleString()})`).join('\n');
      return `📍 *KITCHEN ${idx + 1}: ${vName}*
• Food Subtotal: ₦${sub.toLocaleString()}
• Dishes to Collect:
${dishes}`;
    }).join('\n\n');

    const text = 
`🛵 *LOKOCHOP PAYMENT DISPATCH NOTICE (CENTRAL DISPATCH)*
----------------------------------------
*Order ID:* #${order.id}
*Order Type:* ⚡ Multi-Vendor Order (${grouped.size} Kitchens)
*Customer:* ${order.customerName} (${order.customerPhone})
*Delivery Destination:* ${order.destination}
*Total Transferred:* ₦${order.totalAmount.toLocaleString()}

----------------------------------------
📦 *ITEMIZED ORDERS PER VENDOR:*

${vendorBlocks}

----------------------------------------
Status: Customer has confirmed bank transfer to vendors. Rider assigned to collect from each kitchen.`;

    return `https://wa.me/${LOKOCHOP_SUPPORT_PHONE_CLEAN}?text=${encodeURIComponent(text)}`;
  }

  // Case 3: Single-Vendor Order
  const itemsText = order.items.map(it => `  ▫️ ${it.quantity}x ${it.name} (₦${(it.price * it.quantity).toLocaleString()})`).join('\n');

  const text = 
`🛵 *LOKOCHOP PAYMENT DISPATCH NOTICE (CENTRAL DISPATCH)*
----------------------------------------
*Order ID:* #${order.id}
*Kitchen:* ${order.vendorName} (${order.vendorPhone})
*Customer:* ${order.customerName} (${order.customerPhone})
*Delivery Destination:* ${order.destination}

💰 *FINANCIAL SUMMARY:*
• Food Subtotal: ₦${order.foodSubtotal.toLocaleString()}
• Dispatch Fee: ₦${order.dispatchFee.toLocaleString()}
• Thermal Packaging: ₦${order.packagingFee.toLocaleString()}
👉 *Total Transferred:* ₦${order.totalAmount.toLocaleString()}

🏦 *Target Account:* ${order.bankDetails.bankName} - ${order.bankDetails.accountNumber} (${order.bankDetails.accountName})

📦 *Dishes to Collect from Kitchen:*
${itemsText}

----------------------------------------
⚡ *CENTRAL DISPATCH ACTIONS:*
1. Dispatch rider alerted for pickup at ${order.vendorName}.
2. Confirm kitchen has received credit alert and commenced cooking.
3. Delivery to customer at: ${order.destination}`;

  return `https://wa.me/${LOKOCHOP_SUPPORT_PHONE_CLEAN}?text=${encodeURIComponent(text)}`;
}

// Local storage fallback helpers
function getLocalOrders(): LiveOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: LiveOrder[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

export const orderService = {
  // Create or update order in Firestore and local fallback
  async saveOrder(order: LiveOrder): Promise<void> {
    // 1. Local storage update
    const local = getLocalOrders();
    const idx = local.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      local[idx] = order;
    } else {
      local.unshift(order);
    }
    saveLocalOrders(local);

    // 2. Firestore Cloud Database update
    try {
      const orderRef = doc(db, 'orders', order.id);
      await setDoc(orderRef, order, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Note: Running with local persistence backup:', err);
    }
  },

  // Customer marks payment transferred
  async customerConfirmPayment(orderId: string): Promise<LiveOrder | null> {
    const local = getLocalOrders();
    const order = local.find(o => o.id === orderId);
    if (!order) return null;

    order.paymentStatus = 'customer_confirmed';
    order.customerConfirmedAt = new Date().toISOString();

    await this.saveOrder(order);

    // Also trigger server-side notification helper
    try {
      fetch('/api/orders/notify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          vendorName: order.vendorName,
          vendorPhone: order.vendorPhone,
          vendorBankName: order.bankDetails.bankName,
          vendorAccountNumber: order.bankDetails.accountNumber,
          vendorAccountName: order.bankDetails.accountName,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          destination: order.destination,
          itemsList: order.items.map(it => `${it.quantity}x ${it.name}`).join(', '),
          totalAmount: order.totalAmount,
        })
      }).catch(() => {});
    } catch {}

    return order;
  },

  // Vendor confirms credit in bank and sets estimated delivery time
  async vendorConfirmPayment(orderId: string, prepEtaMins: number): Promise<LiveOrder | null> {
    const local = getLocalOrders();
    const order = local.find(o => o.id === orderId);
    if (!order) return null;

    order.paymentStatus = 'vendor_verified';
    order.kitchenStatus = 'cooking';
    order.prepEtaMins = Number(prepEtaMins) || 25;
    order.vendorVerifiedAt = new Date().toISOString();

    await this.saveOrder(order);

    // Also notify server endpoint
    try {
      fetch('/api/orders/vendor-verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          prepEtaMins: order.prepEtaMins,
          vendorId: order.vendorId,
          vendorName: order.vendorName,
        })
      }).catch(() => {});
    } catch {}

    return order;
  },

  // Advance kitchen pipeline stage (e.g. cooking -> packaging -> dispatched)
  async advanceKitchenStage(orderId: string, nextStage: LiveOrder['kitchenStatus']): Promise<void> {
    const local = getLocalOrders();
    const order = local.find(o => o.id === orderId);
    if (!order) return;

    order.kitchenStatus = nextStage;
    await this.saveOrder(order);
  },

  // Rider accepts order for Confluence bike delivery
  async assignRider(orderId: string, riderName: string, riderPhone: string): Promise<LiveOrder | null> {
    const local = getLocalOrders();
    const order = local.find(o => o.id === orderId);
    if (!order) return null;

    order.riderName = riderName;
    order.riderPhone = riderPhone;
    order.kitchenStatus = 'packaging';
    await this.saveOrder(order);

    // Send SMS alert to customer
    await this.dispatchSmsAlert(
      order.id, 
      order.customerPhone, 
      `[LokoChop Express]: Rider ${riderName} (${riderPhone}) has accepted your delivery #${order.id}. En route to ${order.destination}.`
    );

    return order;
  },

  // Rider picks up hot food from kitchen and heads out
  async markRiderPickedUp(orderId: string): Promise<LiveOrder | null> {
    const local = getLocalOrders();
    const order = local.find(o => o.id === orderId);
    if (!order) return null;

    order.kitchenStatus = 'dispatched';
    order.riderPickedUpAt = new Date().toISOString();
    await this.saveOrder(order);

    await this.dispatchSmsAlert(
      order.id,
      order.customerPhone,
      `[LokoChop Express]: Your meal from ${order.vendorName} has been picked up by rider ${order.riderName || 'Ibrahim'} and is out for delivery!`
    );

    return order;
  },

  // Rider delivers meal hot to customer's gate
  async markRiderDelivered(orderId: string): Promise<LiveOrder | null> {
    const local = getLocalOrders();
    const order = local.find(o => o.id === orderId);
    if (!order) return null;

    order.kitchenStatus = 'delivered';
    order.deliveredAt = new Date().toISOString();
    await this.saveOrder(order);

    await this.dispatchSmsAlert(
      order.id,
      order.customerPhone,
      `[LokoChop]: Order #${order.id} delivered! Enjoy your meal from ${order.vendorName}. Confluence Chop Hotline: 09074072454.`
    );

    return order;
  },

  // Send SMS Notification (Termii / Twilio bridge simulation)
  async dispatchSmsAlert(orderId: string, recipientPhone: string, message: string): Promise<SmsLogEntry> {
    const entry: SmsLogEntry = {
      id: `SMS-${Date.now().toString(36).toUpperCase()}`,
      orderId,
      recipientPhone,
      message,
      status: 'delivered',
      gateway: 'Termii Nigeria',
      sentAt: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SMS_KEY);
      const list: SmsLogEntry[] = raw ? JSON.parse(raw) : [];
      list.unshift(entry);
      localStorage.setItem(LOCAL_STORAGE_SMS_KEY, JSON.stringify(list.slice(0, 50)));
    } catch {}

    // Call server endpoint as well
    try {
      fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {});
    } catch {}

    return entry;
  },

  getSmsLogs(): SmsLogEntry[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Subscribe to all orders (for Rider Portal, Admin, or Order History)
  subscribeToAllOrders(onUpdate: (orders: LiveOrder[]) => void): () => void {
    onUpdate(getLocalOrders());

    try {
      const ordersCol = collection(db, 'orders');
      const q = query(ordersCol, limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const cloudList: LiveOrder[] = [];
        snapshot.forEach(docSnap => {
          cloudList.push(docSnap.data() as LiveOrder);
        });
        if (cloudList.length > 0) {
          saveLocalOrders(cloudList);
          onUpdate(cloudList);
        }
      }, (err) => {
        console.warn('[Firestore] All orders sync error:', err);
      });
      return unsubscribe;
    } catch {
      return () => {};
    }
  },

  // Subscribe to real-time updates for a single order (for Customer OrderTracking)
  subscribeToOrder(orderId: string, onUpdate: (order: LiveOrder) => void): () => void {
    // Immediate local seed
    const local = getLocalOrders();
    const found = local.find(o => o.id === orderId);
    if (found) {
      onUpdate(found);
    }

    try {
      const orderRef = doc(db, 'orders', orderId);
      const unsubscribe = onSnapshot(orderRef, (snapshot) => {
        if (snapshot.exists()) {
          const cloudOrder = snapshot.data() as LiveOrder;
          onUpdate(cloudOrder);
          // Sync local
          const currentLocal = getLocalOrders();
          const idx = currentLocal.findIndex(o => o.id === cloudOrder.id);
          if (idx >= 0) currentLocal[idx] = cloudOrder;
          else currentLocal.unshift(cloudOrder);
          saveLocalOrders(currentLocal);
        }
      }, (error) => {
        console.warn('[Firestore] Realtime subscription fallback:', error);
      });
      return unsubscribe;
    } catch {
      return () => {};
    }
  },

  // Subscribe to real-time updates for a vendor's incoming orders
  subscribeToVendorOrders(vendorIdOrName: string, onUpdate: (orders: LiveOrder[]) => void): () => void {
    const filterLocal = () => {
      const all = getLocalOrders();
      return all.filter(o => 
        o.vendorId.toLowerCase() === vendorIdOrName.toLowerCase() ||
        o.vendorName.toLowerCase().includes(vendorIdOrName.toLowerCase()) ||
        vendorIdOrName === 'all'
      );
    };

    onUpdate(filterLocal());

    try {
      const ordersCol = collection(db, 'orders');
      const q = query(ordersCol, limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const cloudList: LiveOrder[] = [];
        snapshot.forEach(docSnap => {
          cloudList.push(docSnap.data() as LiveOrder);
        });
        if (cloudList.length > 0) {
          saveLocalOrders(cloudList);
          const filtered = cloudList.filter(o => 
            o.vendorId.toLowerCase() === vendorIdOrName.toLowerCase() ||
            o.vendorName.toLowerCase().includes(vendorIdOrName.toLowerCase()) ||
            vendorIdOrName === 'all'
          );
          onUpdate(filtered);
        }
      }, (err) => {
        console.warn('[Firestore] Vendor orders sync error:', err);
      });
      return unsubscribe;
    } catch {
      return () => {};
    }
  }
};
