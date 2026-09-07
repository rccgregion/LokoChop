export type ActiveView = 
  | 'marketplace'
  | 'vendor-storefront'
  | 'neighborhoods'
  | 'zone-directory'
  | 'order-tracking'
  | 'order-history'
  | 'vendor-hub'
  | 'admin-portal'
  | 'vendor-onboarding'
  | 'rider-portal'
  | 'faqs-legal';

export type DeliveryTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export interface FoodItem {
  id: string;
  name: string;
  vendorName: string;
  vendorId?: string;
  zone: string;
  tier: DeliveryTier;
  category: 'rice' | 'swallow' | 'grill' | 'pastries' | 'drinks' | 'pasta' | 'all';
  price: number;
  prepTime: string;
  rating: number;
  description: string;
  imageUrl: string;
  badge?: string;
  inStock?: boolean;
  tags?: string[];
  signature?: boolean;
  cluster?: string;
  offeringType?: 'Signature Dish' | 'Primary Offering' | 'Sides & Extras' | 'Snacks & Bakery' | 'Beverages';
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: string;
  vendorName?: string;
  vendorId?: string;
  foodId?: string;
}

export interface CustomerOrder {
  id: string;
  vendorName: string;
  createdAt: string;
  status: 'awaiting_payment' | 'in_kitchen' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: { name: string; quantity: number; price: number }[];
  deliveryFee: number;
  tier: string;
  destination: string;
  totalAmount: number;
}

export interface Restaurant {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  phone: string;
  tier: DeliveryTier;
  zoneText: string;
  status: string;
  tags: string[];
  commissionRate: number;
  dailyGrossGMV: number;
  remittanceOwed: number;
  verified: boolean;
  category?: string;
  primaryOfferings?: string;
  signatureDishes?: string[];
  cluster?: string;
  subLocality?: string;
  imageUrl?: string;
}

export interface NeighborhoodZone {
  id: string;
  name: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  tierLabel: string;
  dispatchFee: number;
  eta: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  tag: string;
  tagType: 'quick' | 'choice' | 'hospital' | 'market' | 'crossroad' | 'office' | 'highway';
  featuredKitchens: {
    name: string;
    location: string;
    icon: string;
  }[];
}

export interface OrderRecord {
  id: string;
  customerName: string;
  hub: string;
  items: string;
  amount: number;
  paymentGateway: string;
  status: 'Payment Mismatched' | 'Confirmed' | 'Awaiting Transfer' | 'Delivered / Disputed' | 'Delivered';
  timeAgo: string;
  tier: DeliveryTier;
}

export interface DisputeRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  vendorName: string;
  vendorPhone: string;
  claimAmount: number;
  reason: string;
  details: string;
  loggedTimeAgo: string;
  status: 'Open' | 'Resolved';
}

export interface VendorMenuItem {
  id: string;
  name: string;
  price: number;
  category: 'food' | 'drink' | 'confectionery';
  inStock: boolean;
  description?: string;
}

export interface VendorAddOn {
  id: string;
  name: string;
  category: 'drink' | 'side' | 'extra';
  price: number;
  available: boolean;
  description?: string;
  icon?: string;
}

export interface VendorUser {
  id: string;
  vendorId: string;
  vendorName: string;
  ownerName: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  landmark: string;
  tier: string;
  category?: string;
  avatarColor?: string;
  logoInitials?: string;
  lastLogin: string;
  isKitchenLive?: boolean;
  prepTimeMins?: number;
  commissionRate?: number;
  menuItems?: VendorMenuItem[];
  addOns?: VendorAddOn[];
}

export interface ApprovedVendorAccount {
  id: string;
  vendorId: string;
  name: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  category: string;
  tier: DeliveryTier;
  credentials: {
    identifier: string;
    passcode: string;
    pin: string;
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  logo: {
    initials: string;
    bg: string;
    textColor: string;
    tagline?: string;
  };
  menuOfferings: VendorMenuItem[];
  shortOfferingsList: string[];
  commissionRate: number;
  dailyGrossGMV: number;
}

export interface VendorRemittanceRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  accruedPeriod: string;
  reference: string;
  paymentMethod: 'Direct Bank Transfer' | 'Paystack Card/USSD' | 'Providus Virtual NIP';
  status: 'Pending Verification' | 'Verified & Settled' | 'Flagged';
  date: string;
  proofMemo?: string;
}

export interface CateringInquiry {
  id: string;
  vendorId: string;
  vendorName: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  eventType: string;
  guestCount: number;
  eventDate: string;
  eventTime: string;
  deliveryVenue: string;
  menuPreferences: string;
  estimatedBudget?: number;
  specialRequests?: string;
  createdAt: string;
  status: 'New Inquiry' | 'Quote Sent' | 'Confirmed & Booked' | 'Declined';
}

export interface CustomerReview {
  id: string;
  vendorId: string;
  vendorName: string;
  foodItemId?: string;
  foodItemName?: string;
  customerName: string;
  customerLocation: string;
  rating: number;
  reviewText: string;
  date: string;
  verifiedOrder: boolean;
  likesCount?: number;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Logistics Dispatcher' | 'Auditor';
  clearanceLevel: number;
  lastLogin: string;
}
