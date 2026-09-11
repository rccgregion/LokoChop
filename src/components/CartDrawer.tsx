import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CartItem, ActiveView } from '../types';
import { FOOD_ITEMS_DATA } from '../data/mockData';
import { orderService, LiveOrder, VendorOrderShare, formatPhoneForWhatsApp, LOKOCHOP_SUPPORT_WHATSAPP } from '../services/orderService';
import { 
  LOKOJA_LOCATIONS, 
  calculateMultiVendorOrderTotals, 
  MultiVendorCalculationResult,
  getLocationTierBadgeInfo
} from '../utils/dispatchCalculator';
import { PaymentTransferModal } from './PaymentTransferModal';
import { AppLogo } from './AppLogo';
import { DynamicPriceTicker } from './DynamicPriceTicker';
import { 
  X, 
  Timer, 
  Copy, 
  Check, 
  CheckCircle2, 
  MessageCircle, 
  Plus, 
  Minus, 
  Trash2,
  Building2,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Store,
  Bike,
  HelpCircle,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Utensils,
  Clock,
  ArrowRight,
  ArrowLeft,
  Flame,
  Receipt,
  Users,
  Share2,
  Crown,
  Zap,
  Landmark,
  CreditCard,
  Search,
  CheckCircle
} from 'lucide-react';
import { getAvailableAddOnsForCart } from '../services/addOnsService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onAddToCart?: (item: any) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onEmptyCart?: () => void;
  onConfirmPayment: (order?: LiveOrder) => void;
  onNavigate: (view: ActiveView) => void;
  onOpenTerms?: () => void;
  selectedDeliveryLocation?: string;
  onSelectDeliveryLocation?: (locId: string) => void;
}

type PaymentMethodType = 'instant' | 'bank' | 'pos';

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onEmptyCart,
  onConfirmPayment,
  onNavigate,
  selectedDeliveryLocation = 'lokongoma-phase-1',
  onSelectDeliveryLocation
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(9);
  const [seconds, setSeconds] = useState(42);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [removedNotice, setRemovedNotice] = useState<string | null>(null);

  // 3-Stage Navigation State with Direction Physics
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<number>(1);
  const [stepValidationWarning, setStepValidationWarning] = useState<string | null>(null);

  // Stage 3 Optimized UX: Accordion defaults to closed to eliminate summary duplication
  const [isReceiptAccordionOpen, setIsReceiptAccordionOpen] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('instant');

  // Customer contact & destination fields
  const [customerName, setCustomerName] = useState('Halimat Sani');
  const [customerPhone, setCustomerPhone] = useState('08031234567');
  
  // Specific Customer Location in Lokoja
  const [customerLocationId, setCustomerLocationId] = useState<string>(selectedDeliveryLocation);
  const [destination, setDestination] = useState('Near Police Post, Phase 1 Gate');
  const [neighborhoodSearch, setNeighborhoodSearch] = useState<string>('');

  useEffect(() => {
    if (selectedDeliveryLocation && selectedDeliveryLocation !== customerLocationId) {
      setCustomerLocationId(selectedDeliveryLocation);
    }
  }, [selectedDeliveryLocation, customerLocationId]);

  const handleLocationChange = (newLocId: string) => {
    setCustomerLocationId(newLocId);
    if (onSelectDeliveryLocation) {
      onSelectDeliveryLocation(newLocId);
    }
  };

  // Group Cart & Bill Splitting State
  const [isGroupCartActive, setIsGroupCartActive] = useState<boolean>(false);
  const [groupCode] = useState<string>('LOK-GRP-942');
  const [groupMembers, setGroupMembers] = useState<string[]>(['You (Host)', 'Chinedu', 'Amina']);
  const [newMemberInput, setNewMemberInput] = useState<string>('');
  const [itemMemberMap, setItemMemberMap] = useState<Record<string, string>>({});
  const [copiedGroupLink, setCopiedGroupLink] = useState<boolean>(false);

  // LokoChop Premium Tier & Guaranteed Hot Standard
  const [isPremiumTier, setIsPremiumTier] = useState<boolean>(false);
  const [isPrivateDelivery, setIsPrivateDelivery] = useState<boolean>(false);
  const [privateRefCode] = useState<string>(() => `PRIV-LK-${Math.floor(1000 + Math.random() * 9000)}`);

  // Active Order & Modal
  const [activeCreatedOrder, setActiveCreatedOrder] = useState<LiveOrder | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sustainability, Rider Tipping & Scheduled Delivery
  const [cutleryIncluded, setCutleryIncluded] = useState(false);
  const [riderTip, setRiderTip] = useState(0);
  const [deliveryType, setDeliveryType] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledSlot, setScheduledSlot] = useState('1:00 PM - 2:00 PM (Lunch Rush)');
  const [addonsRefreshKey, setAddonsRefreshKey] = useState(0);

  // Live Sync with Vendor Hub add-on changes
  useEffect(() => {
    const handleAddonsUpdate = () => {
      setAddonsRefreshKey(k => k + 1);
    };
    window.addEventListener('lokochop-addons-updated', handleAddonsUpdate);
    return () => window.removeEventListener('lokochop-addons-updated', handleAddonsUpdate);
  }, []);

  // 10-minute grace timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev > 0) return prev - 1;
        setMinutes(m => (m > 0 ? m - 1 : 0));
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // MASTER DISPATCH & MULTI-VENDOR CALCULATION
  const calculationResult: MultiVendorCalculationResult = useMemo(() => {
    const fullDestination = `${destination.trim() ? destination.trim() + ', ' : ''}${
      LOKOJA_LOCATIONS.find(l => l.id === customerLocationId)?.name || 'Lokongoma Phase I'
    }`;
    return calculateMultiVendorOrderTotals(items, customerLocationId, fullDestination);
  }, [items, customerLocationId, destination]);

  const {
    customerLocation,
    vendorAllocations,
    locationStops,
    distinctVendorCount,
    distinctLocationCount,
    totalFoodSubtotal,
    totalPackagingFee,
    totalDispatchFee,
    grandTotal,
    isMultiVendor,
    hasCoLocatedVendors
  } = calculationResult;

  const primaryVendorAlloc = vendorAllocations[0];
  const premiumFee = isPremiumTier ? 500 : 0;
  const finalGrandTotal = grandTotal + riderTip + premiumFee;

  // Granular Group Bill Splitting Calculation
  const memberSplits = useMemo(() => {
    if (!isGroupCartActive || groupMembers.length === 0) return [];
    const dispatchPerPerson = totalDispatchFee / groupMembers.length;
    const packagingPerPerson = totalPackagingFee / groupMembers.length;
    const premiumPerPerson = premiumFee / groupMembers.length;
    const tipPerPerson = riderTip / groupMembers.length;

    return groupMembers.map(member => {
      const memberItems = items.filter(it => (itemMemberMap[it.id] || groupMembers[0]) === member);
      const foodSub = memberItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
      const hasItems = memberItems.length > 0;
      const shareOfFees = hasItems ? (dispatchPerPerson + packagingPerPerson + premiumPerPerson + tipPerPerson) : 0;
      const totalOwed = Math.round(foodSub + shareOfFees);
      return {
        member,
        itemCount: memberItems.reduce((acc, it) => acc + it.quantity, 0),
        foodSub,
        shareOfFees: Math.round(shareOfFees),
        totalOwed
      };
    });
  }, [isGroupCartActive, groupMembers, items, itemMemberMap, totalDispatchFee, totalPackagingFee, premiumFee, riderTip]);

  // Available 1-Click Upsell Add-Ons & Refreshments from current cart kitchens
  const availableAddOns = useMemo(() => {
    const cartVendors = vendorAllocations.map(v => ({
      vendorId: v.vendorId,
      vendorName: v.vendorName
    }));
    return getAvailableAddOnsForCart(cartVendors);
  }, [vendorAllocations, addonsRefreshKey]);

  // Dynamic dispatch fee calculator for each neighborhood
  const getDispatchFeeForZone = useMemo(() => {
    return (zoneId: string) => {
      if (items.length === 0) {
        const found = LOKOJA_LOCATIONS.find(l => l.id === zoneId);
        return found?.baseTariff || 800;
      }
      const calc = calculateMultiVendorOrderTotals(items, zoneId, '');
      return calc.totalDispatchFee;
    };
  }, [items]);

  // Helper to retrieve dish image from mock data
  const getDishImage = (item: CartItem): string | null => {
    const match = FOOD_ITEMS_DATA.find(
      f => f.id === item.id || f.id === item.foodId || f.name.toLowerCase() === item.name.toLowerCase()
    );
    return match?.imageUrl || null;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCopyGroupLink = () => {
    const linkText = `Join my LokoChop group lunch order in Lokoja! Code: ${groupCode} • https://lokochop.ng/cart?group=${groupCode}`;
    navigator.clipboard?.writeText(linkText);
    setCopiedGroupLink(true);
    setTimeout(() => setCopiedGroupLink(false), 2500);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newMemberInput.trim();
    if (!clean || groupMembers.includes(clean)) return;
    setGroupMembers(prev => [...prev, clean]);
    setNewMemberInput('');
  };

  // Safe navigation between steps with direction tracking
  const navigateStep = (targetStep: 1 | 2 | 3) => {
    if (targetStep === checkoutStep) return;
    if (targetStep === 3 && !destination.trim()) {
      setStepValidationWarning("Please specify your street address or landmark so the rider locates you.");
      return;
    }
    setStepValidationWarning(null);
    setDirection(targetStep > checkoutStep ? 1 : -1);
    setCheckoutStep(targetStep);
  };

  // Build and persist order
  const createAndSaveOrder = async (): Promise<LiveOrder> => {
    const orderId = `LK-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullDestination = `${destination.trim() ? destination.trim() + ', ' : ''}${customerLocation.name}`;
    
    const vendorShares: VendorOrderShare[] = vendorAllocations.map(alloc => ({
      vendorId: alloc.vendorId,
      vendorName: alloc.vendorName,
      vendorPhone: alloc.vendorPhone,
      subtotal: alloc.foodSubtotal,
      locationKey: alloc.location.id,
      locationName: alloc.location.name,
      dispatchFeeShare: alloc.dispatchShare,
      packagingFeeShare: alloc.packagingFee,
      totalPayableShare: alloc.totalToPay,
      isSharedLocation: alloc.isSharedLocation,
      coLocatedVendorNames: alloc.coLocatedVendorNames,
      items: alloc.items.map(it => ({
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        customization: it.customization
      })),
      bankDetails: {
        bankName: alloc.bankDetails?.bankName || 'First Bank of Nigeria',
        accountNumber: alloc.bankDetails?.accountNumber || '3089421570',
        accountName: alloc.bankDetails?.accountName || alloc.vendorName
      }
    }));

    const newOrder: LiveOrder = {
      id: orderId,
      vendorId: primaryVendorAlloc?.vendorId || 'vendor-confluence',
      vendorName: isMultiVendor 
        ? `${primaryVendorAlloc?.vendorName} + ${distinctVendorCount - 1} other${distinctVendorCount - 1 > 1 ? 's' : ''}` 
        : (primaryVendorAlloc?.vendorName || 'LokoChop Kitchen'),
      vendorPhone: primaryVendorAlloc?.vendorPhone || '+2349074072454',
      customerName: isPrivateDelivery 
        ? `[Private Order #${privateRefCode}]` 
        : (customerName.trim() || 'Valued Customer'),
      customerPhone: customerPhone.trim() || '08000000000',
      destination: fullDestination,
      items: items.map(it => ({
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        customization: it.customization,
        vendorName: it.vendorName,
        vendorId: it.vendorId
      })),
      foodSubtotal: totalFoodSubtotal,
      dispatchFee: totalDispatchFee,
      packagingFee: totalPackagingFee,
      totalAmount: finalGrandTotal,
      cutleryIncluded,
      riderTip,
      deliverySchedule: {
        type: deliveryType,
        slotTime: deliveryType === 'scheduled' ? scheduledSlot : undefined,
        date: deliveryType === 'scheduled' ? 'Today' : undefined
      },
      scheduled_window: deliveryType === 'scheduled' ? scheduledSlot : undefined,
      isPremiumTier,
      isPrivateDelivery,
      privateReferenceCode: isPrivateDelivery ? privateRefCode : undefined,
      groupCartCode: isGroupCartActive ? groupCode : undefined,
      isGroupCart: isGroupCartActive,
      memberCount: isGroupCartActive ? groupMembers.length : 1,
      isMultiVendor,
      vendorShares,
      multiVendorSurcharge: isMultiVendor ? (distinctLocationCount - 1) * 450 : 0,
      bankDetails: {
        bankName: selectedPaymentMethod === 'instant' 
          ? 'OPay / Moniepoint (LokoChop Instant)' 
          : isMultiVendor 
            ? 'Zenith Bank (LokoChop Clearing)' 
            : (primaryVendorAlloc?.bankDetails?.bankName || 'First Bank of Nigeria'),
        accountNumber: selectedPaymentMethod === 'instant'
          ? '8074072454'
          : isMultiVendor 
            ? '1018492041' 
            : (primaryVendorAlloc?.bankDetails?.accountNumber || '3089421570'),
        accountName: selectedPaymentMethod === 'instant'
          ? 'LokoChop Confluence Food Hub'
          : isMultiVendor 
            ? 'LokoChop Confluence Multi-Vendor Escrow' 
            : (primaryVendorAlloc?.bankDetails?.accountName || primaryVendorAlloc?.vendorName || 'LokoChop Operations')
      },
      paymentStatus: 'customer_confirmed',
      kitchenStatus: 'cooking',
      prepEtaMins: isMultiVendor ? 35 : 25,
      createdAt: new Date().toISOString(),
      customerConfirmedAt: new Date().toISOString()
    };

    await orderService.saveOrder(newOrder);
    await orderService.customerConfirmPayment(newOrder.id);

    try {
      localStorage.setItem('lokochop_active_order_id', newOrder.id);
    } catch {}

    return newOrder;
  };

  const handleTransferDone = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    const newOrder = await createAndSaveOrder();
    setActiveCreatedOrder(newOrder);
    setIsProcessing(false);
    setIsTransferModalOpen(true);
    onConfirmPayment(newOrder);
  };

  // High-converting WhatsApp Dispatch Trigger
  const handleWhatsAppDispatchAndConfirm = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    const newOrder = await createAndSaveOrder();
    setActiveCreatedOrder(newOrder);

    const cleanPhone = formatPhoneForWhatsApp(primaryVendorAlloc?.vendorPhone || LOKOCHOP_SUPPORT_WHATSAPP);
    const itemsText = items.map(it => `• ${it.quantity}x ${it.name} (₦${(it.price * it.quantity).toLocaleString()})`).join('\n');
    const paymentLabel = 
      selectedPaymentMethod === 'instant' ? '⚡ Instant Bank Transfer (OPay / PalmPay / Moniepoint)' :
      selectedPaymentMethod === 'bank' ? '🏦 Standard Bank Transfer (Zenith / GTB / First Bank)' :
      '💵 POS / Cash on Delivery';

    const fullDest = `${destination.trim() ? destination.trim() + ', ' : ''}${customerLocation.name}`;

    const receiptMessage = 
`🔔 *LOKOCHOP ORDER CONFIRMATION & DISPATCH*
----------------------------------------
*Order ID:* #${newOrder.id}
*Customer:* ${customerName} (${customerPhone})
*Delivery Destination:* ${fullDest}
*Payment Method:* ${paymentLabel}

🍲 *Dishes Ordered:*
${itemsText}

💰 *Financial Summary:*
• Food & Extras: ₦${totalFoodSubtotal.toLocaleString()}
• Dispatch Fee (${customerLocation.name}): ₦${totalDispatchFee.toLocaleString()}
• Thermal Packaging: ₦${totalPackagingFee.toLocaleString()}
${riderTip > 0 ? `• Rider Appreciation Tip: ₦${riderTip.toLocaleString()}\n` : ''}${isPremiumTier ? '• LokoChop Premium (Hot Standard): ₦500\n' : ''}👉 *GRAND TOTAL:* ₦${finalGrandTotal.toLocaleString()}
----------------------------------------
⚡ *Dispatch Status:* Customer verified order. Ready for hot kitchen packaging and rider pickup!`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(receiptMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setIsProcessing(false);
    setIsTransferModalOpen(true);
    onConfirmPayment(newOrder);
  };

  const handleProceedToTracking = () => {
    setIsTransferModalOpen(false);
    onClose();
    onNavigate('order-tracking');
  };

  // Filtered Neighborhoods for Stage 2 Pill Grid
  const filteredNeighborhoods = useMemo(() => {
    const q = neighborhoodSearch.toLowerCase().trim();
    if (!q) return LOKOJA_LOCATIONS;
    return LOKOJA_LOCATIONS.filter(loc => 
      loc.name.toLowerCase().includes(q) ||
      loc.description.toLowerCase().includes(q) ||
      loc.landmarks.some(lm => lm.toLowerCase().includes(q))
    );
  }, [neighborhoodSearch]);

  // Motion variants for directional stage transitions
  const stageSlideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 350, damping: 30 }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.18, ease: 'easeOut' }
    }),
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="cart-drawer-root" className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div 
              key="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose} 
              className="fixed inset-0 bg-inverse-surface/65 backdrop-blur-xs"
            />

            {/* Slide-out Drawer with Spring Physics & Pull-Down Gesture */}
            <motion.div 
              key="cart-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.6 }}
              onDragEnd={(_e, { offset, velocity }) => {
                if (offset.y > 100 || velocity.y > 400) {
                  onClose();
                }
              }}
              className="fixed top-0 right-0 h-full w-full sm:w-[560px] bg-surface-container-lowest/95 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-white/60 dark:border-white/10 text-on-surface z-10 select-none overflow-hidden"
            >
              {/* Mobile Pull Handle Indicator */}
              <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto mt-2 sm:hidden cursor-grab active:cursor-grabbing shrink-0" />

              {/* Drawer Top Branding & Close Header */}
              <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/70 backdrop-blur-md gap-3 shrink-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <AppLogo size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface tracking-tight">
                          Your Chop Cart
                        </h2>
                        {items.length > 0 && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {items.reduce((acc, it) => acc + it.quantity, 0)} dish{items.length > 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                        {isMultiVendor ? (
                          <span className="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1 truncate">
                            <Layers className="w-3 h-3 shrink-0 text-amber-600" />
                            <span className="truncate">{distinctVendorCount} Kitchens • {distinctLocationCount} Location Stop{distinctLocationCount > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="truncate">
                            Kitchen: <strong className="text-on-surface font-semibold">{primaryVendorAlloc?.vendorName || 'Lokoja Kitchen'}</strong> ({primaryVendorAlloc?.location.name || 'Lokoja'})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {items.length > 0 && (
                    <button 
                      id="empty-cart-header-btn"
                      type="button"
                      onClick={() => setShowEmptyConfirm(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-error/90 hover:text-error bg-error/8 hover:bg-error/15 border border-error/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                      title="Empty entire cart"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Empty</span>
                    </button>
                  )}
                  <button 
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Close cart drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Interactive Glass Stepper Header */}
              {items.length > 0 && (
                <div className="px-3 sm:px-5 py-3 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/20 sticky top-0 z-20 shrink-0">
                  <div className="flex items-center justify-between gap-1.5 max-w-full">
                    
                    {/* STEP 1: ITEMS */}
                    <button
                      type="button"
                      onClick={() => navigateStep(1)}
                      className={`flex-1 min-w-0 py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        checkoutStep === 1
                          ? 'bg-primary text-white shadow-md shadow-primary/30 ring-2 ring-primary/40'
                          : checkoutStep > 1
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                            : 'bg-surface-container/60 text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {checkoutStep > 1 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 animate-scale-in" />
                      ) : (
                        <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                          checkoutStep === 1 ? 'bg-white text-primary' : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>1</span>
                      )}
                      <span className="truncate text-xs">1. Items</span>
                    </button>

                    <ArrowRight className="w-3 h-3 text-outline-variant shrink-0" />

                    {/* STEP 2: LOCATION */}
                    <button
                      type="button"
                      onClick={() => navigateStep(2)}
                      className={`flex-1 min-w-0 py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        checkoutStep === 2
                          ? 'bg-primary text-white shadow-md shadow-primary/30 ring-2 ring-primary/40'
                          : checkoutStep > 2
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                            : 'bg-surface-container/60 text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {checkoutStep > 2 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 animate-scale-in" />
                      ) : (
                        <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                          checkoutStep === 2 ? 'bg-white text-primary' : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>2</span>
                      )}
                      <span className="truncate text-xs">2. Location</span>
                    </button>

                    <ArrowRight className="w-3 h-3 text-outline-variant shrink-0" />

                    {/* STEP 3: PAYMENT */}
                    <button
                      type="button"
                      onClick={() => navigateStep(3)}
                      className={`flex-1 min-w-0 py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        checkoutStep === 3
                          ? 'bg-primary text-white shadow-md shadow-primary/30 ring-2 ring-primary/40'
                          : 'bg-surface-container/60 text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                        checkoutStep === 3 ? 'bg-white text-primary' : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>3</span>
                      <span className="truncate text-xs">3. Payment</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Step Content Body with Direction Slide Physics */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scroll">
                
                {/* Toast Notification for Removed / Emptied Cart */}
                {removedNotice && (
                  <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 shrink-0" />
                      <span>{removedNotice}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setRemovedNotice(null)} 
                      className="p-1 hover:bg-error/20 rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Empty Cart Confirmation Dialog */}
                {showEmptyConfirm && (
                  <div className="p-4 bg-error/10 border border-error/30 rounded-2xl space-y-3 text-xs shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-error/20 text-error flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-error">Empty your Chop Cart?</h4>
                        <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                          Are you sure you want to remove all {items.reduce((acc, it) => acc + it.quantity, 0)} items? This will reset your current food order.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowEmptyConfirm(false)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
                      >
                        Keep Items
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onEmptyCart) onEmptyCart();
                          setShowEmptyConfirm(false);
                          setRemovedNotice('Your Chop Cart has been emptied');
                          setTimeout(() => setRemovedNotice(null), 3000);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-error text-white hover:bg-error/90 transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Yes, Empty Cart</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {items.length === 0 ? (
                  <div className="text-center py-16 px-4 space-y-4">
                    <AppLogo size="xl" className="mx-auto" />
                    <div className="space-y-1.5">
                      <h3 className="font-headline font-bold text-lg text-on-surface">Your Chop Cart is Empty</h3>
                      <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                        Discover steaming authentic dishes from Lokoja&apos;s verified traditional and modern kitchens.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary/90 transition-all active:scale-95 cursor-pointer mt-2"
                    >
                      <Store className="w-4 h-4" />
                      <span>Explore Lokoja Kitchens</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Validation Warning Notice if any */}
                    {stepValidationWarning && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between shadow-2xs animate-fade-in">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{stepValidationWarning}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setStepValidationWarning(null)} 
                          className="p-1 hover:bg-amber-500/20 rounded-md transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <AnimatePresence custom={direction} mode="wait">
                      {/* ========================================================= */}
                      {/* STEP 1: ITEMS & UPSELLS                                  */}
                      {/* ========================================================= */}
                      {checkoutStep === 1 && (
                        <motion.div 
                          key="checkout-step-1"
                          custom={direction}
                          variants={stageSlideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          {/* Freshness & Kitchen Grace Countdown Bar */}
                          <div className="p-2.5 sm:p-3 rounded-2xl bg-surface-container-low border border-outline-variant/25 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                                <Flame className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <span className="text-[11px] font-semibold text-on-surface truncate">
                                Hot Pots Ready &bull; Thermal Packed
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-tertiary/10 text-tertiary font-bold text-[11px] px-2.5 py-1 rounded-xl shrink-0 border border-tertiary/20">
                              <Timer className="w-3.5 h-3.5" />
                              <span className="font-mono">
                                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                              </span>
                            </div>
                          </div>

                          {/* Multi-Vendor Transparent Dispatch Notice */}
                          {isMultiVendor && (
                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                              <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                                  <Layers className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                                </div>
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-xs text-amber-950 dark:text-amber-200">
                                      Multi-Kitchen Order
                                    </h4>
                                    <span className="bg-amber-500/25 text-amber-900 dark:text-amber-100 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                      {distinctVendorCount} Kitchens
                                    </span>
                                    <span className="bg-primary/15 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                                      {distinctLocationCount} Pickup Stop{distinctLocationCount > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-on-surface leading-relaxed">
                                    Dishes from <strong>{vendorAllocations.map(v => v.vendorName).join(', ')}</strong> will be collected in sequence and brought together hot.
                                  </p>
                                  {hasCoLocatedVendors && (
                                    <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>
                                        <strong>Shared Stop Discount:</strong> Co-located kitchens share one pickup run with no extra charge!
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Ordered Dishes - Multi-Kitchen Grouped Cards with AnimatePresence deletion physics */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">
                              <span>Dishes in Cart ({items.length})</span>
                              <span>{distinctVendorCount} Kitchen{distinctVendorCount > 1 ? 's' : ''}</span>
                            </div>

                            {vendorAllocations.map((alloc) => (
                              <div 
                                key={alloc.vendorId}
                                className="rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 overflow-hidden shadow-2xs"
                              >
                                {/* Kitchen Header Strip */}
                                <div className="px-3.5 py-2.5 bg-surface-container/60 border-b border-outline-variant/20 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                      <Store className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-bold text-xs text-on-surface truncate">{alloc.vendorName}</h4>
                                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1 truncate">
                                        <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
                                        <span className="truncate">{alloc.location.name}</span>
                                        {alloc.isSharedLocation && (
                                          <span className="text-emerald-700 font-bold ml-0.5">[Shared Stop]</span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <DynamicPriceTicker 
                                      value={alloc.foodSubtotal} 
                                      className="text-xs text-primary" 
                                    />
                                  </div>
                                </div>

                                {/* Items Rows with AnimatePresence deletion physics */}
                                <div className="divide-y divide-outline-variant/15">
                                  <AnimatePresence initial={false}>
                                    {alloc.items.map((item) => {
                                      const dishImage = getDishImage(item);
                                      return (
                                        <motion.div 
                                          key={item.id} 
                                          layout
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, height: 0, scale: 0.9, marginBottom: 0, overflow: 'hidden' }}
                                          transition={{ duration: 0.25 }}
                                          id={`cart-item-${item.id}`}
                                          className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-surface-container-low/30 transition-colors"
                                        >
                                          {/* Dish Image Thumbnail */}
                                          <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden shrink-0 border border-outline-variant/20 flex items-center justify-center">
                                            {dishImage ? (
                                              <img 
                                                src={dishImage} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                referrerPolicy="no-referrer"
                                              />
                                            ) : (
                                              <Utensils className="w-5 h-5 text-on-surface-variant/50" />
                                            )}
                                          </div>

                                          {/* Item Details */}
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-bold text-on-surface truncate text-xs">{item.name}</h5>
                                            
                                            {/* Family / Bulk portion indicator */}
                                            {((item as any).isFamilyBulk || item.name.toLowerCase().includes('family') || item.name.toLowerCase().includes('bulk')) && (
                                              <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/25">
                                                <Users className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400 shrink-0" />
                                                <span>Family Portion (Serves 4–6)</span>
                                              </div>
                                            )}

                                            {/* Group Cart Member Assignment */}
                                            {isGroupCartActive && (
                                              <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                                                <span className="text-on-surface-variant font-medium">Split to:</span>
                                                <select
                                                  value={itemMemberMap[item.id] || groupMembers[0]}
                                                  onChange={(e) => setItemMemberMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                  className="px-1.5 py-0.5 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface font-semibold text-[10px] cursor-pointer focus:outline-primary"
                                                >
                                                  {groupMembers.map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                  ))}
                                                </select>
                                              </div>
                                            )}

                                            <div className="font-price-display text-primary font-bold text-xs mt-0.5">
                                              ₦{(item.price * item.quantity).toLocaleString()}
                                              <span className="text-[10px] font-normal text-on-surface-variant ml-1 font-sans">
                                                (₦{item.price.toLocaleString()} ea)
                                              </span>
                                            </div>
                                          </div>

                                          {/* Stepper and Delete Controls */}
                                          <div className="flex items-center gap-2 shrink-0">
                                            {/* Tactile Quantity Pill */}
                                            <div className="flex items-center border border-outline-variant/40 rounded-xl bg-surface-container-lowest shadow-2xs overflow-hidden">
                                              <button 
                                                type="button"
                                                onClick={() => onUpdateQuantity(item.id, -1)}
                                                className="w-7 h-7 flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant active:scale-95"
                                                title="Decrease quantity"
                                              >
                                                <Minus className="w-3 h-3" />
                                              </button>
                                              <span className="w-6 text-center text-xs font-bold text-on-surface">{item.quantity}</span>
                                              <button 
                                                type="button"
                                                onClick={() => onUpdateQuantity(item.id, 1)}
                                                className="w-7 h-7 flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant active:scale-95"
                                                title="Increase quantity"
                                              >
                                                <Plus className="w-3 h-3" />
                                              </button>
                                            </div>

                                            {/* Compact Trash Button */}
                                            <button 
                                              id={`remove-from-cart-${item.id}`}
                                              type="button"
                                              onClick={() => {
                                                onRemoveItem(item.id);
                                                setRemovedNotice(`Removed "${item.name}" from cart`);
                                                setTimeout(() => setRemovedNotice(null), 2500);
                                              }}
                                              className="w-7 h-7 rounded-xl flex items-center justify-center text-error/80 hover:text-white hover:bg-error bg-error/10 border border-error/20 transition-all active:scale-95 cursor-pointer"
                                              title={`Remove ${item.name}`}
                                              aria-label={`Remove ${item.name} from cart`}
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                  </AnimatePresence>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Horizontal 1-Click Upsell Carousel */}
                          {availableAddOns.length > 0 && onAddToCart && (
                            <div className="p-3.5 rounded-2xl bg-amber-500/8 border border-amber-500/25 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4 text-amber-600" />
                                  <span className="font-headline text-xs font-bold text-on-surface">
                                    Complete Your Meal &bull; 1-Click Sides &amp; Drinks
                                  </span>
                                </div>
                                <span className="text-[10px] bg-amber-500/20 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                                  Kitchen Fresh
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5 overflow-x-auto custom-scroll pb-1">
                                {availableAddOns.map((addOn) => (
                                  <div
                                    key={addOn.id}
                                    className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between shrink-0 w-40 space-y-2 shadow-2xs hover:border-primary/40 transition-all"
                                  >
                                    <div>
                                      <div className="text-2xl select-none">{addOn.icon || '🥤'}</div>
                                      <h6 className="font-bold text-xs text-on-surface line-clamp-1 mt-1">
                                        {addOn.name}
                                      </h6>
                                      <span className="text-[10px] text-on-surface-variant block truncate">
                                        {addOn.vendorName}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1.5 border-t border-outline-variant/15">
                                      <span className="font-price-display font-bold text-xs text-primary">
                                        ₦{addOn.price.toLocaleString()}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onAddToCart({
                                            id: `addon-${addOn.id}`,
                                            name: addOn.name,
                                            price: addOn.price,
                                            vendorId: addOn.vendorId,
                                            vendorName: addOn.vendorName,
                                            tier: addOn.category
                                          });
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Add</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Step 1 Subtotal Summary Card */}
                          <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between shadow-2xs">
                            <div className="space-y-0.5">
                              <span className="text-xs text-on-surface-variant font-medium">Food Subtotal ({items.reduce((s, it) => s + it.quantity, 0)} items):</span>
                              <div>
                                <DynamicPriceTicker value={totalFoodSubtotal} className="text-xl text-primary font-black" />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigateStep(2)}
                              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                            >
                              <span>Next: Delivery Location</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* ========================================================= */}
                      {/* STEP 2: DELIVERY & LOCATION                               */}
                      {/* ========================================================= */}
                      {checkoutStep === 2 && (
                        <motion.div 
                          key="checkout-step-2"
                          custom={direction}
                          variants={stageSlideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          {/* Delivery Destination & Contact Details */}
                          <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <span>Recipient &amp; Delivery Destination</span>
                            </div>

                            {/* Contact Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-on-surface flex items-center gap-1">
                                  <User className="w-3 h-3 text-primary" />
                                  <span>Your Name:</span>
                                </label>
                                <input
                                  type="text"
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  placeholder="e.g. Halimat Sani"
                                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-primary transition-colors"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-on-surface flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-primary" />
                                  <span>Phone Number (Calls/WhatsApp):</span>
                                </label>
                                <input
                                  type="tel"
                                  value={customerPhone}
                                  onChange={(e) => setCustomerPhone(e.target.value)}
                                  placeholder="e.g. 08031234567"
                                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-primary transition-colors"
                                  required
                                />
                              </div>
                            </div>

                            {/* Street Address / Exact Landmark with Quick Chips */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-on-surface flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-primary" />
                                  <span>Street Address / Exact Landmark:</span>
                                </label>
                                <span className="text-[10px] text-on-surface-variant">Tap chip to pre-fill</span>
                              </div>
                              
                              {/* Quick Chips */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  { label: '🏠 Home', prefix: 'Home: ' },
                                  { label: '💼 Office', prefix: 'Office: ' },
                                  { label: '🎓 Campus', prefix: 'Campus Hostels: ' },
                                  { label: '🏨 Hotel / Lodge', prefix: 'Hotel / Guest House: ' },
                                ].map(chip => (
                                  <button
                                    key={chip.label}
                                    type="button"
                                    onClick={() => {
                                      if (!destination.startsWith(chip.prefix)) {
                                        setDestination(chip.prefix + destination.replace(/^(Home|Office|Campus Hostels|Hotel \/ Guest House):\s*/i, ''));
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-[10px] font-semibold text-on-surface transition-all active:scale-95 cursor-pointer"
                                  >
                                    {chip.label}
                                  </button>
                                ))}
                              </div>

                              <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g. Flat 4, Behind Police Post, Phase 1 Gate"
                                className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-primary transition-colors"
                                required
                              />
                            </div>
                          </div>

                          {/* Interactive Glassmorphic Pill Grid for Lokoja Neighborhoods */}
                          <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                <h4 className="font-bold text-xs text-on-surface">
                                  Select Lokoja Neighborhood ({LOKOJA_LOCATIONS.length} Zones)
                                </h4>
                              </div>
                              {(() => {
                                const badgeInfo = getLocationTierBadgeInfo(customerLocation.id);
                                return (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeInfo.badgeClass}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                                    <span>Selected: {customerLocation.name}</span>
                                  </span>
                                );
                              })()}
                            </div>

                            {/* Neighborhood Search Filter */}
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-on-surface-variant pointer-events-none" />
                              <input
                                type="text"
                                value={neighborhoodSearch}
                                onChange={(e) => setNeighborhoodSearch(e.target.value)}
                                placeholder="Search neighborhood (e.g. Felele, Adankolo, Zone 8)..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-primary transition-colors"
                              />
                              {neighborhoodSearch && (
                                <button
                                  type="button"
                                  onClick={() => setNeighborhoodSearch('')}
                                  className="absolute right-2.5 top-2 text-on-surface-variant hover:text-on-surface cursor-pointer text-xs"
                                >
                                  &times;
                                </button>
                              )}
                            </div>

                            {/* Pill Grid with Live Distance Dispatch Tariffs */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto custom-scroll pr-1">
                              {filteredNeighborhoods.map(zone => {
                                const isSelected = zone.id === customerLocationId;
                                const zoneFee = getDispatchFeeForZone(zone.id);

                                return (
                                  <button
                                    key={zone.id}
                                    type="button"
                                    onClick={() => handleLocationChange(zone.id)}
                                    className={`p-2 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                                      isSelected
                                        ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40'
                                        : 'bg-surface-container-lowest border-outline-variant/25 hover:border-outline-variant/60 hover:bg-surface-container'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <span className={`text-[11px] font-bold leading-tight line-clamp-1 ${
                                        isSelected ? 'text-primary' : 'text-on-surface'
                                      }`}>
                                        {zone.name}
                                      </span>
                                      {isSelected && (
                                        <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                      )}
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-[10px]">
                                      <span className="text-on-surface-variant font-medium truncate">
                                        {zone.tier || 'Dispatch'}
                                      </span>
                                      <span className={`font-price-display font-bold ${
                                        isSelected ? 'text-primary' : 'text-on-surface-variant'
                                      }`}>
                                        ₦{zoneFee.toLocaleString()}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* LokoChop Premium Tier & Guaranteed Hot Standard */}
                          <div className="p-3.5 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                                  <Crown className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-on-surface">LokoChop Premium (+₦500)</h4>
                                  <p className="text-[10px] text-on-surface-variant">Guaranteed Hot Standard &bull; Triple-layer seal</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsPremiumTier(!isPremiumTier)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  isPremiumTier
                                    ? 'bg-amber-500 text-black shadow-xs'
                                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                                }`}
                              >
                                {isPremiumTier ? '✓ Active' : '+ Add'}
                              </button>
                            </div>

                            {isPremiumTier && (
                              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2 animate-fade-in text-xs">
                                <div className="min-w-0">
                                  <span className="font-bold text-[11px] text-on-surface flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                    <span>Private Reference Mode</span>
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant truncate block">
                                    Rider sees code <strong className="text-primary font-mono">#{privateRefCode}</strong>
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsPrivateDelivery(!isPrivateDelivery)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                                    isPrivateDelivery
                                      ? 'bg-primary text-white shadow-2xs'
                                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                                  }`}
                                >
                                  {isPrivateDelivery ? 'Private: On' : 'Standard'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Delivery Scheduling, Eco Cutlery & Rider Tip */}
                          <div className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-3 text-xs">
                            {/* Delivery Scheduling Toggle */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-on-surface flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                                <Clock className="w-3.5 h-3.5 text-primary" /> Scheduling
                              </span>
                              <div className="flex items-center p-0.5 bg-surface-container rounded-xl text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setDeliveryType('asap')}
                                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    deliveryType === 'asap'
                                      ? 'bg-primary text-white shadow-xs'
                                      : 'text-on-surface-variant hover:text-on-surface'
                                  }`}
                                >
                                  ⚡ ASAP (25-35m)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeliveryType('scheduled')}
                                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    deliveryType === 'scheduled'
                                      ? 'bg-primary text-white shadow-xs'
                                      : 'text-on-surface-variant hover:text-on-surface'
                                  }`}
                                >
                                  📅 Scheduled Slot
                                </button>
                              </div>
                            </div>

                            {deliveryType === 'scheduled' && (
                              <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-1.5 animate-fade-in">
                                <label className="text-[10px] font-bold text-on-surface block">Choose Target Delivery Window:</label>
                                <select
                                  value={scheduledSlot}
                                  onChange={(e) => setScheduledSlot(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface font-semibold focus:outline-primary cursor-pointer"
                                >
                                  <option value="12:00 PM - 1:00 PM (Early Lunch)">12:00 PM - 1:00 PM (Early Lunch)</option>
                                  <option value="1:00 PM - 2:00 PM (Lunch Rush)">1:00 PM - 2:00 PM (Lunch Rush)</option>
                                  <option value="2:00 PM - 3:00 PM (Late Lunch)">2:00 PM - 3:00 PM (Late Lunch)</option>
                                  <option value="6:00 PM - 7:30 PM (Dinner Hour)">6:00 PM - 7:30 PM (Dinner Hour)</option>
                                </select>
                              </div>
                            )}

                            {/* Eco Cutlery Toggle */}
                            <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                              <div className="flex items-center gap-2">
                                <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <div>
                                  <span className="font-bold text-on-surface block text-[11px]">Eco-Friendly Cutlery &amp; Napkins</span>
                                  <span className="text-[10px] text-on-surface-variant">Opt out if you already have cutlery</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCutleryIncluded(!cutleryIncluded)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  cutleryIncluded 
                                    ? 'bg-emerald-600 text-white shadow-xs' 
                                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                                }`}
                              >
                                {cutleryIncluded ? 'Include (Free)' : 'No Cutlery'}
                              </button>
                            </div>

                            {/* Rider Appreciation Tip */}
                            <div className="space-y-1.5 pt-1 border-t border-outline-variant/20">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-on-surface flex items-center gap-1.5 text-[11px]">
                                  <Bike className="w-3.5 h-3.5 text-primary" />
                                  <span>Rider Appreciation Tip:</span>
                                </span>
                                <span className="text-[10px] text-emerald-700 font-semibold">100% directly to rider</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {[0, 200, 500, 1000].map(amt => (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setRiderTip(amt)}
                                    className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer border ${
                                      riderTip === amt
                                        ? 'bg-primary text-white border-primary shadow-2xs'
                                        : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                                    }`}
                                  >
                                    {amt === 0 ? 'None' : `₦${amt}`}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Group Cart & Bill Splitting Hub */}
                          <div className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <Users className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-on-surface">Group Cart &amp; Bill Splitting</h4>
                                  <p className="text-[10px] text-on-surface-variant">Order together with coworkers or family</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsGroupCartActive(!isGroupCartActive)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  isGroupCartActive 
                                    ? 'bg-primary text-white shadow-xs' 
                                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                                }`}
                              >
                                {isGroupCartActive ? 'Active' : '+ Start Group'}
                              </button>
                            </div>

                            {isGroupCartActive && (
                              <div className="pt-2 border-t border-outline-variant/20 space-y-3 animate-fade-in text-xs">
                                <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <span className="text-[10px] text-on-surface-variant block">Group Order Code</span>
                                    <span className="font-mono font-bold text-xs text-primary">{groupCode}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleCopyGroupLink}
                                    className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    {copiedGroupLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                                    <span>{copiedGroupLink ? 'Link Copied!' : 'Share Link'}</span>
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap gap-1.5">
                                    {groupMembers.map((m, idx) => (
                                      <span
                                        key={m}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-[11px] font-semibold text-on-surface border border-outline-variant/20"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        <span>{m}</span>
                                        {idx > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => setGroupMembers(prev => prev.filter(x => x !== m))}
                                            className="text-on-surface-variant hover:text-error ml-1 cursor-pointer"
                                            title={`Remove ${m}`}
                                          >
                                            &times;
                                          </button>
                                        )}
                                      </span>
                                    ))}
                                  </div>

                                  <form onSubmit={handleAddMember} className="flex gap-2 pt-1">
                                    <input
                                      type="text"
                                      value={newMemberInput}
                                      onChange={(e) => setNewMemberInput(e.target.value)}
                                      placeholder="Add coworker or friend name..."
                                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-[11px] text-on-surface focus:outline-primary"
                                    />
                                    <button
                                      type="submit"
                                      className="px-3 py-1.5 rounded-xl bg-primary text-white text-[11px] font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                                    >
                                      Add
                                    </button>
                                  </form>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Step 2 Bottom Navigation Bar */}
                          <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between shadow-2xs">
                            <button
                              type="button"
                              onClick={() => navigateStep(1)}
                              className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Back to Dishes</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigateStep(3)}
                              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                            >
                              <span>Proceed to Payment</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* ========================================================= */}
                      {/* STEP 3: PAYMENT & DISPATCH (OPTIMIZED STREAMLINED UX)    */}
                      {/* ========================================================= */}
                      {checkoutStep === 3 && (
                        <motion.div 
                          key="checkout-step-3"
                          custom={direction}
                          variants={stageSlideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          {/* ELIMINATE SUMMARY DUPLICATION: Expandable Accordion (Defaults to Closed) */}
                          <div className="rounded-2xl bg-surface-container border border-outline-variant/30 overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setIsReceiptAccordionOpen(!isReceiptAccordionOpen)}
                              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-surface-container-high/40 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-primary shrink-0" />
                                <div>
                                  <span className="font-bold text-xs text-on-surface block">
                                    📋 Order Summary ({items.reduce((s, it) => s + it.quantity, 0)} items to {customerLocation.name})
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant">
                                    {isReceiptAccordionOpen ? 'Tap to collapse order details' : 'Tap to review confirmed items & location'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-on-surface-variant">
                                <span className="text-[10px] font-bold uppercase">{isReceiptAccordionOpen ? 'Hide' : 'View'}</span>
                                {isReceiptAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </button>

                            {/* Collapsible Accordion Drawer */}
                            <AnimatePresence>
                              {isReceiptAccordionOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="border-t border-outline-variant/20 p-3.5 space-y-2.5 bg-surface-container-low/50 text-xs"
                                >
                                  <div className="space-y-1.5">
                                    {items.map(it => (
                                      <div key={it.id} className="flex justify-between items-center text-on-surface-variant text-[11px]">
                                        <span className="truncate pr-2">
                                          <strong className="text-on-surface font-semibold">{it.quantity}x</strong> {it.name}
                                          {it.vendorName && <span className="text-[9px] text-on-surface-variant ml-1">({it.vendorName})</span>}
                                        </span>
                                        <span className="font-mono text-on-surface font-semibold shrink-0">
                                          ₦{(it.price * it.quantity).toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="pt-2 border-t border-outline-variant/20 text-[10px] text-on-surface-variant space-y-0.5">
                                    <div><strong>Delivering to:</strong> {customerName} ({customerPhone})</div>
                                    <div><strong>Address:</strong> {destination}, {customerLocation.name}</div>
                                    <div><strong>Timing:</strong> {deliveryType === 'scheduled' ? scheduledSlot : '⚡ ASAP Dispatch'}</div>
                                  </div>

                                  <div className="pt-1 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => navigateStep(2)}
                                      className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Edit delivery address or dishes</span>
                                      <ArrowLeft className="w-3 h-3" />
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Streamlined Payment Selector: High-Converting Glass Toggle Cards */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block px-1">
                              Select Payment Method
                            </label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              {/* 1. Instant Transfer */}
                              <button
                                type="button"
                                onClick={() => setSelectedPaymentMethod('instant')}
                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  selectedPaymentMethod === 'instant'
                                    ? 'bg-primary/10 border-primary ring-2 ring-primary/30 shadow-xs'
                                    : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                                      <Zap className="w-4 h-4" />
                                    </div>
                                    {selectedPaymentMethod === 'instant' && (
                                      <CheckCircle className="w-4 h-4 text-primary" />
                                    )}
                                  </div>
                                  <h4 className="font-bold text-xs text-on-surface mt-2">Instant Transfer</h4>
                                  <p className="text-[10px] text-on-surface-variant mt-0.5 leading-snug">
                                    OPay &bull; PalmPay &bull; Moniepoint
                                  </p>
                                </div>
                                <span className="mt-2 text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-full inline-block w-fit">
                                  Zero Wait
                                </span>
                              </button>

                              {/* 2. Standard Bank Transfer */}
                              <button
                                type="button"
                                onClick={() => setSelectedPaymentMethod('bank')}
                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  selectedPaymentMethod === 'bank'
                                    ? 'bg-primary/10 border-primary ring-2 ring-primary/30 shadow-xs'
                                    : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                      <Landmark className="w-4 h-4" />
                                    </div>
                                    {selectedPaymentMethod === 'bank' && (
                                      <CheckCircle className="w-4 h-4 text-primary" />
                                    )}
                                  </div>
                                  <h4 className="font-bold text-xs text-on-surface mt-2">Bank Transfer</h4>
                                  <p className="text-[10px] text-on-surface-variant mt-0.5 leading-snug">
                                    Zenith &bull; GTB &bull; First Bank
                                  </p>
                                </div>
                                <span className="mt-2 text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full inline-block w-fit">
                                  Direct Payout
                                </span>
                              </button>

                              {/* 3. POS / Cash on Delivery */}
                              <button
                                type="button"
                                onClick={() => setSelectedPaymentMethod('pos')}
                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  selectedPaymentMethod === 'pos'
                                    ? 'bg-primary/10 border-primary ring-2 ring-primary/30 shadow-xs'
                                    : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center">
                                      <CreditCard className="w-4 h-4" />
                                    </div>
                                    {selectedPaymentMethod === 'pos' && (
                                      <CheckCircle className="w-4 h-4 text-primary" />
                                    )}
                                  </div>
                                  <h4 className="font-bold text-xs text-on-surface mt-2">POS on Arrival</h4>
                                  <p className="text-[10px] text-on-surface-variant mt-0.5 leading-snug">
                                    Card or Cash to Rider
                                  </p>
                                </div>
                                <span className="mt-2 text-[9px] bg-surface-container-highest text-on-surface-variant font-bold px-1.5 py-0.5 rounded-full inline-block w-fit">
                                  Verified Seal
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* 1-Tap Account Details & Auto-Copy Card */}
                          {selectedPaymentMethod === 'instant' && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/35 space-y-3 animate-fade-in text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold">
                                  <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span>INSTANT SETTLEMENT ACCOUNT DETAILS</span>
                                </div>
                                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                                  Instant Confirmation
                                </span>
                              </div>

                              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-on-surface-variant font-semibold">Bank Name:</span>
                                  <strong className="text-on-surface">OPay / Moniepoint</strong>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-on-surface-variant font-semibold">Account Name:</span>
                                  <span className="text-on-surface font-bold">LokoChop Confluence Food Hub</span>
                                </div>
                                <div className="flex items-center justify-between pt-1.5 border-t border-outline-variant/20">
                                  <span className="text-on-surface-variant font-semibold">Account Number:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-base font-bold text-primary tracking-wider">
                                      8074072454
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy('8074072454', 'instant-acct')}
                                      className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-transform"
                                    >
                                      {copiedKey === 'instant-acct' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedKey === 'instant-acct' ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[10px] text-on-surface-variant">
                                💡 Transfer from any bank app. Your order confirms automatically upon dispatch notification.
                              </p>
                            </div>
                          )}

                          {selectedPaymentMethod === 'bank' && (
                            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3 animate-fade-in text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-on-surface font-bold">
                                  <Landmark className="w-4 h-4 text-primary shrink-0" />
                                  <span>STANDARD BANK ACCOUNT DETAILS</span>
                                </div>
                                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                                  100% Direct Payout
                                </span>
                              </div>

                              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-on-surface-variant font-semibold">Bank Name:</span>
                                  <strong className="text-on-surface">
                                    {isMultiVendor ? 'Zenith Bank PLC' : (primaryVendorAlloc?.bankDetails?.bankName || 'First Bank of Nigeria')}
                                  </strong>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-on-surface-variant font-semibold">Account Name:</span>
                                  <span className="text-on-surface font-bold truncate max-w-[200px]">
                                    {isMultiVendor ? 'LokoChop Multi-Vendor Pool' : (primaryVendorAlloc?.bankDetails?.accountName || primaryVendorAlloc?.vendorName)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-1.5 border-t border-outline-variant/20">
                                  <span className="text-on-surface-variant font-semibold">Account Number:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-base font-bold text-primary tracking-wider">
                                      {isMultiVendor ? '1018492041' : (primaryVendorAlloc?.bankDetails?.accountNumber || '3089421570')}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(
                                        isMultiVendor ? '1018492041' : (primaryVendorAlloc?.bankDetails?.accountNumber || '3089421570'),
                                        'bank-acct'
                                      )}
                                      className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-transform"
                                    >
                                      {copiedKey === 'bank-acct' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedKey === 'bank-acct' ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedPaymentMethod === 'pos' && (
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 animate-fade-in text-xs">
                              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>PAY ON ARRIVAL GUARANTEE</span>
                              </div>
                              <p className="text-[11px] text-on-surface leading-relaxed">
                                Our verified dispatch rider will arrive at <strong>{destination}, {customerLocation.name}</strong> with a mobile POS terminal and cash pouch. Inspect your thermal food seal before paying.
                              </p>
                              <div className="p-2 rounded-xl bg-surface-container-lowest text-[10px] text-on-surface-variant flex items-center gap-2">
                                <Bike className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>Rider arrives equipped with POS terminal for any Nigerian debit card.</span>
                              </div>
                            </div>
                          )}

                          {/* Unified 4-Row Financial Ledger Card (No Duplicated Labels) */}
                          <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2.5 text-xs shadow-2xs">
                            <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/20">
                              <div className="flex items-center gap-1.5 font-bold text-on-surface uppercase text-[11px] tracking-wider">
                                <Receipt className="w-3.5 h-3.5 text-primary" />
                                <span>Financial Summary</span>
                              </div>
                              <span className="text-[10px] text-on-surface-variant font-medium">Lokoja Metro Rates</span>
                            </div>

                            {/* 1. Food & Extras */}
                            <div className="flex justify-between items-center text-on-surface-variant">
                              <span>Food &amp; Extras:</span>
                              <DynamicPriceTicker value={totalFoodSubtotal} className="text-on-surface font-semibold text-xs" />
                            </div>

                            {/* 2. Dispatch Fee */}
                            <div className="flex justify-between items-center text-on-surface-variant">
                              <span className="flex items-center gap-1">
                                <Bike className="w-3 h-3 text-primary" />
                                <span>Dispatch Fee ({customerLocation.name}):</span>
                              </span>
                              <DynamicPriceTicker value={totalDispatchFee} className="text-on-surface font-semibold text-xs" />
                            </div>

                            {/* 3. Rider Tip (if added) */}
                            {riderTip > 0 && (
                              <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-semibold">
                                <span>Rider Appreciation Tip (100% to Rider):</span>
                                <DynamicPriceTicker value={riderTip} className="text-emerald-700 dark:text-emerald-400 font-bold text-xs" />
                              </div>
                            )}

                            {/* Packaging & Premium (if added) */}
                            {isPremiumTier && (
                              <div className="flex justify-between items-center text-amber-700 dark:text-amber-300 font-semibold text-[11px]">
                                <span>LokoChop Premium (Hot Guarantee):</span>
                                <span>+₦500</span>
                              </div>
                            )}

                            {/* 4. Grand Total */}
                            <div className="pt-2 border-t border-dashed border-outline-variant/40 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-on-surface block text-sm">Grand Total Payable:</span>
                                <span className="text-[10px] text-on-surface-variant">
                                  {isMultiVendor ? `${distinctVendorCount} kitchens combined` : 'Food + Dispatch'}
                                </span>
                              </div>
                              <DynamicPriceTicker value={finalGrandTotal} className="text-2xl text-primary font-black" />
                            </div>
                          </div>

                          {/* Group Bill Splitting Summary (if active) */}
                          {isGroupCartActive && memberSplits.length > 0 && (
                            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-primary/30 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-on-surface">
                                  <Users className="w-3.5 h-3.5 text-primary" />
                                  <span>Group Bill Split ({groupMembers.length} Members)</span>
                                </div>
                                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                                  1 Transfer to Kitchen
                                </span>
                              </div>

                              <div className="space-y-1.5 pt-1">
                                {memberSplits.map(split => (
                                  <div key={split.member} className="p-2 rounded-xl bg-surface-container-lowest flex items-center justify-between text-xs">
                                    <div>
                                      <span className="font-bold text-on-surface block">{split.member}</span>
                                      <span className="text-[10px] text-on-surface-variant">{split.itemCount} dish(es) + fee share</span>
                                    </div>
                                    <span className="font-price-display font-bold text-primary">
                                      ₦{split.totalOwed.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Back Link to Edit */}
                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => navigateStep(2)}
                              className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Change delivery address, neighborhood or tip</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* Sticky Drawer Footer Action with High-Converting WhatsApp Dispatch Trigger */}
              {items.length > 0 && (
                <div className="p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] border-t border-outline-variant/20 bg-surface-container-lowest/95 backdrop-blur-md shadow-lg shrink-0">
                  {checkoutStep === 1 && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[11px] text-on-surface-variant font-medium block">Grand Total</span>
                        <DynamicPriceTicker value={finalGrandTotal} className="text-xl text-primary font-black" />
                      </div>
                      <button 
                        type="button"
                        onClick={() => navigateStep(2)}
                        className="flex-1 py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-headline text-sm sm:text-base font-bold shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Delivery &amp; Location</span>
                        <ArrowRight className="w-4 h-4 text-white shrink-0" />
                      </button>
                    </div>
                  )}

                  {checkoutStep === 2 && (
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => navigateStep(1)}
                        className="py-3 px-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Dishes</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => navigateStep(3)}
                        className="flex-1 py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-headline text-sm sm:text-base font-bold shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Proceed to Payment</span>
                        <DynamicPriceTicker value={finalGrandTotal} className="text-white ml-1 font-black" />
                        <ArrowRight className="w-4 h-4 text-white shrink-0" />
                      </button>
                    </div>
                  )}

                  {checkoutStep === 3 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => navigateStep(2)}
                          className="py-3 px-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Delivery</span>
                        </button>
                        
                        {/* High-Converting Glowing WhatsApp Confirmation Action */}
                        <button 
                          type="button"
                          disabled={isProcessing}
                          onClick={handleWhatsAppDispatchAndConfirm}
                          className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline text-xs sm:text-sm font-bold shadow-md hover:shadow-emerald-600/30 hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <MessageCircle className="w-4 h-4 text-white shrink-0" />
                          <span className="truncate">
                            {isProcessing ? 'Confirming Order...' : `Confirm & Send via WhatsApp (₦${finalGrandTotal.toLocaleString()})`}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-center text-[10px] text-on-surface-variant">
                        <span>Or confirm directly:</span>
                        <button
                          type="button"
                          onClick={handleTransferDone}
                          className="text-primary hover:underline font-bold cursor-pointer"
                        >
                          I have transferred without WhatsApp
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Transfer Confirmation Modal */}
      <PaymentTransferModal
        isOpen={isTransferModalOpen}
        order={activeCreatedOrder}
        onClose={() => setIsTransferModalOpen(false)}
        onProceedToTracking={handleProceedToTracking}
      />
    </>
  );
};
