import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CartItem, ActiveView } from '../types';
import { APPROVED_LOKOJA_VENDORS } from '../data/approvedVendors';
import { FOOD_ITEMS_DATA } from '../data/mockData';
import { orderService, LiveOrder, VendorOrderShare, buildVendorSpecificWhatsAppUrl } from '../services/orderService';
import { 
  LOKOJA_LOCATIONS, 
  calculateMultiVendorOrderTotals, 
  MultiVendorCalculationResult,
  LokojaLocationZone 
} from '../utils/dispatchCalculator';
import { PaymentTransferModal } from './PaymentTransferModal';
import { 
  ShoppingBag, 
  X, 
  Timer, 
  Copy, 
  Check, 
  CheckCircle2, 
  Info, 
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
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Utensils,
  Clock,
  Calendar,
  HeartHandshake,
  ArrowRight,
  Flame,
  Receipt
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
}

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
  onOpenTerms
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(9);
  const [seconds, setSeconds] = useState(42);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [removedNotice, setRemovedNotice] = useState<string | null>(null);
  const [showStopsDetail, setShowStopsDetail] = useState(false);

  // Customer contact & destination fields
  const [customerName, setCustomerName] = useState('Halimat Sani');
  const [customerPhone, setCustomerPhone] = useState('08031234567');
  
  // Specific Customer Location in Lokoja
  const [customerLocationId, setCustomerLocationId] = useState<string>('lokongoma-phase-1');
  const [destination, setDestination] = useState('Near Police Post, Phase 1 Gate');

  // Multi-vendor payment mode toggle: Defaults to 'itemized'
  const [transferMode, setTransferMode] = useState<'itemized' | 'consolidated'>('itemized');

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
    sharedLocationCount,
    totalFoodSubtotal,
    totalPackagingFee,
    totalDispatchFee,
    grandTotal,
    isMultiVendor,
    hasCoLocatedVendors
  } = calculationResult;

  const primaryVendorAlloc = vendorAllocations[0];
  const finalGrandTotal = grandTotal + riderTip;

  // Available 1-Click Upsell Add-Ons & Refreshments from current cart kitchens
  const availableAddOns = useMemo(() => {
    const cartVendors = vendorAllocations.map(v => ({
      vendorId: v.vendorId,
      vendorName: v.vendorName
    }));
    return getAvailableAddOnsForCart(cartVendors);
  }, [vendorAllocations, addonsRefreshKey]);

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

  const handleTransferDone = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    const orderId = `LK-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullDestination = `${destination.trim() ? destination.trim() + ', ' : ''}${customerLocation.name}`;
    
    // Build vendor shares for multi-vendor reporting & WhatsApp alerts
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
      customerName: customerName.trim() || 'Valued Customer',
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
      isMultiVendor,
      vendorShares,
      multiVendorSurcharge: isMultiVendor ? (distinctLocationCount - 1) * 450 : 0,
      bankDetails: {
        bankName: isMultiVendor && transferMode === 'consolidated' 
          ? 'Zenith Bank (LokoChop Clearing)' 
          : (primaryVendorAlloc?.bankDetails?.bankName || 'First Bank of Nigeria'),
        accountNumber: isMultiVendor && transferMode === 'consolidated' 
          ? '1018492041' 
          : (primaryVendorAlloc?.bankDetails?.accountNumber || '3089421570'),
        accountName: isMultiVendor && transferMode === 'consolidated' 
          ? 'LokoChop Confluence Multi-Vendor Escrow' 
          : (primaryVendorAlloc?.bankDetails?.accountName || primaryVendorAlloc?.vendorName || 'LokoChop Operations')
      },
      paymentStatus: 'customer_confirmed',
      kitchenStatus: 'cooking',
      prepEtaMins: isMultiVendor ? 35 : 25,
      createdAt: new Date().toISOString(),
      customerConfirmedAt: new Date().toISOString()
    };

    // Persist to Cloud Firestore and local storage
    await orderService.saveOrder(newOrder);
    await orderService.customerConfirmPayment(newOrder.id);

    try {
      localStorage.setItem('lokochop_active_order_id', newOrder.id);
    } catch {}

    setActiveCreatedOrder(newOrder);
    setIsProcessing(false);
    setIsTransferModalOpen(true);
    onConfirmPayment(newOrder);
  };

  const handleProceedToTracking = () => {
    setIsTransferModalOpen(false);
    onClose();
    onNavigate('order-tracking');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose} 
              className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-xs z-50"
            />

            {/* Slide-out Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[560px] bg-surface shadow-2xl z-50 flex flex-col border-l border-outline-variant/30 text-on-surface"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-outline-variant/25 flex items-center justify-between bg-surface-container-low/70 backdrop-blur-md gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-error/90 hover:text-error bg-error/8 hover:bg-error/15 border border-error/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
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

              {/* Dynamic Items List & Direct Transfer Notice */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4.5 custom-scroll">

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
                  <div className="text-center py-20 px-4 space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center mx-auto text-on-surface-variant/70 border border-outline-variant/20 shadow-xs">
                      <ShoppingBag className="w-9 h-9 text-primary/80" />
                    </div>
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
                    {/* Unified Order Status Strip: Kitchen Freshness & Pot Hold */}
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
                              Ordering from <strong>{vendorAllocations.map(v => v.vendorName).join(', ')}</strong>. Point-to-point dispatch calculated transparently to <strong>{customerLocation.name}</strong>.
                            </p>
                            {hasCoLocatedVendors && (
                              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>
                                  <strong>Shared Stop Discount Applied:</strong> Co-located kitchens share one pickup run with no double-charging!
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ordered Dishes - Flattened Depth with Image Thumbnails */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">
                        <span>Dishes in Cart ({items.length})</span>
                        <div className="flex items-center gap-2">
                          <span>{distinctVendorCount} Kitchen{distinctVendorCount > 1 ? 's' : ''}</span>
                        </div>
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
                              <span className="font-price-display font-bold text-xs text-primary">
                                ₦{alloc.foodSubtotal.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Items Rows */}
                          <div className="divide-y divide-outline-variant/15">
                            {alloc.items.map((item) => {
                              const dishImage = getDishImage(item);
                              return (
                                <div 
                                  key={item.id} 
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
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 1-Click Add-Ons & Refreshments Carousel */}
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
                            Direct from Kitchen
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

                    {/* Delivery Destination & Contact Details */}
                    <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>Delivery Destination (Lokoja Dispatch)</span>
                      </div>

                      <div className="space-y-3">
                        {/* 2-column contact input */}
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

                        {/* Accurate 25-Neighborhood Flat Selector */}
                        <div className="space-y-1.5">
                          <label htmlFor="cart-neighborhood-select" className="text-[11px] font-bold text-on-surface flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <span>Select Delivery Neighborhood:</span>
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-medium">
                              {customerLocation.name}
                            </span>
                          </label>
                          <select
                            id="cart-neighborhood-select"
                            value={customerLocationId}
                            onChange={(e) => setCustomerLocationId(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface font-semibold focus:outline-primary cursor-pointer transition-colors hover:border-primary/50"
                          >
                            {LOKOJA_LOCATIONS.map(l => (
                              <option key={l.id} value={l.id}>
                                {l.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Street Address / Landmark */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-on-surface flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-primary" />
                            <span>Street Address / Exact Landmark:</span>
                          </label>
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
                    </div>

                    {/* Delivery Timing, Eco Cutlery & Rider Tip */}
                    <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-3.5 text-xs">
                      {/* Delivery Scheduling Toggle */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-on-surface flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                          <Clock className="w-3.5 h-3.5 text-primary" /> Delivery Scheduling
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
                            ⚡ ASAP (~25-35m)
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
                            📅 Schedule Time
                          </button>
                        </div>
                      </div>

                      {deliveryType === 'scheduled' && (
                        <div className="p-3 rounded-xl bg-surface-container-lowest border border-primary/30 space-y-1.5 animate-fade-in">
                          <label className="text-[11px] font-bold text-on-surface block">
                            Choose Delivery Window for Today:
                          </label>
                          <select
                            value={scheduledSlot}
                            onChange={(e) => setScheduledSlot(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs font-semibold text-on-surface cursor-pointer focus:outline-primary"
                          >
                            <option value="12:30 PM - 1:30 PM (Early Lunch)">12:30 PM - 1:30 PM (Early Lunch)</option>
                            <option value="1:00 PM - 2:00 PM (Peak Lunch)">1:00 PM - 2:00 PM (Peak Lunch)</option>
                            <option value="2:30 PM - 3:30 PM (Late Lunch)">2:30 PM - 3:30 PM (Late Lunch)</option>
                            <option value="6:00 PM - 7:00 PM (Early Dinner)">6:00 PM - 7:00 PM (Early Dinner)</option>
                            <option value="7:30 PM - 8:30 PM (Dinner Rush)">7:30 PM - 8:30 PM (Dinner Rush)</option>
                            <option value="9:00 PM - 10:00 PM (Late Night Suya/Pepper Soup)">9:00 PM - 10:00 PM (Late Night Suya)</option>
                          </select>
                          <span className="text-[10px] text-on-surface-variant block">
                            We dispatch your order fresh so it arrives piping hot during this window.
                          </span>
                        </div>
                      )}

                      {/* Eco-Friendly Cutlery Toggle */}
                      <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 pr-2">
                          <Utensils className="w-4 h-4 text-emerald-700 shrink-0" />
                          <div>
                            <p className="font-bold text-on-surface text-[11px]">Include Disposable Cutlery &amp; Napkins</p>
                            <p className="text-[10px] text-on-surface-variant">
                              {cutleryIncluded ? 'Cutlery pack will be included' : 'Help keep Lokoja green (eating at home/office)'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCutleryIncluded(!cutleryIncluded)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            cutleryIncluded 
                              ? 'bg-emerald-600 text-white shadow-2xs' 
                              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {cutleryIncluded ? 'Included' : 'No Cutlery'}
                        </button>
                      </div>

                      {/* Rider Appreciation Tip */}
                      <div className="pt-2 border-t border-outline-variant/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-on-surface text-[11px] flex items-center gap-1.5">
                            <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
                            <span>Rider Tip (100% goes directly to dispatch rider)</span>
                          </span>
                          {riderTip > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700">
                              +₦{riderTip.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {[0, 200, 500, 1000].map(tip => (
                            <button
                              key={tip}
                              type="button"
                              onClick={() => setRiderTip(tip)}
                              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                                riderTip === tip
                                  ? 'bg-primary text-white shadow-xs'
                                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                              }`}
                            >
                              {tip === 0 ? 'None' : `₦${tip}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Transparent Price Calculation Receipt */}
                    <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/20">
                        <div className="flex items-center gap-1.5 font-bold text-on-surface uppercase text-[11px] tracking-wider">
                          <Receipt className="w-3.5 h-3.5 text-primary" />
                          <span>Transparent Cost Breakdown</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigate('faqs-legal');
                          }}
                          className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Tariff guide</span>
                        </button>
                      </div>

                      <div className="flex justify-between text-on-surface-variant">
                        <span>Food Subtotal ({items.reduce((s, it) => s + it.quantity, 0)} dishes):</span>
                        <span className="font-semibold text-on-surface">₦{totalFoodSubtotal.toLocaleString()}</span>
                      </div>

                      {/* Granular Location Dispatch Breakdown */}
                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex justify-between items-center text-[11px] font-bold text-on-surface">
                          <span className="flex items-center gap-1.5">
                            <Bike className="w-3.5 h-3.5 text-primary" />
                            <span>
                              Rider Dispatch ({distinctLocationCount} Stop{distinctLocationCount > 1 ? 's' : ''} to {customerLocation.name}):
                            </span>
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-primary font-price-display font-bold text-xs">
                              ₦{totalDispatchFee.toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowStopsDetail(!showStopsDetail)}
                              className="p-0.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
                              title="Toggle stop details"
                            >
                              {showStopsDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        
                        {/* Expandable stops breakdown */}
                        {showStopsDetail && (
                          <div className="space-y-1.5 p-2 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 text-[10px] text-on-surface-variant animate-fade-in">
                            {locationStops.map((stop, idx) => (
                              <div key={stop.location.id} className="flex justify-between items-center py-0.5">
                                <div className="truncate pr-2">
                                  <strong className="text-on-surface">Stop {idx + 1}: {stop.location.name}</strong>
                                  <span className="text-[9px] text-on-surface-variant block">
                                    {stop.reason} {stop.isShared ? `(Shared by: ${stop.vendorNames.join(', ')})` : `(${stop.vendorNames[0]})`}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-on-surface shrink-0">
                                  ₦{stop.locationDispatchFee.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between text-on-surface-variant">
                        <span>Eco-Insulated Packaging ({distinctVendorCount} kitchen{distinctVendorCount > 1 ? 's' : ''} @ ₦250):</span>
                        <span className="font-semibold text-on-surface">₦{totalPackagingFee.toLocaleString()}</span>
                      </div>

                      {riderTip > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Rider Appreciation Tip (100% to Rider):</span>
                          <span>₦{riderTip.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-on-surface-variant text-[11px]">
                        <span>Eco-Friendly Cutlery &amp; Napkins:</span>
                        <span className={cutleryIncluded ? 'font-semibold text-on-surface' : 'text-emerald-700 font-semibold'}>
                          {cutleryIncluded ? 'Included (Free)' : 'Opted out (Eco-conscious)'}
                        </span>
                      </div>

                      {/* Clean Dashed Line Separator */}
                      <div className="pt-2 border-t border-dashed border-outline-variant/40 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-on-surface block text-sm">Total Payable:</span>
                          <span className="text-[10px] text-on-surface-variant">
                            {isMultiVendor 
                              ? `Covering ${distinctVendorCount} kitchens across ${distinctLocationCount} stops` 
                              : 'Food + Single Kitchen Rider'}
                          </span>
                        </div>
                        <span className="font-price-display text-2xl font-bold text-primary">
                          ₦{finalGrandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Direct Bank Transfer Details */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/35 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold text-xs">
                          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>DIRECT BANK PAYMENT INSTRUCTIONS</span>
                        </div>
                        {isMultiVendor && (
                          <div className="flex items-center p-0.5 bg-surface-container rounded-xl text-[10px]">
                            <button
                              type="button"
                              onClick={() => setTransferMode('itemized')}
                              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                transferMode === 'itemized' 
                                  ? 'bg-primary text-white shadow-xs' 
                                  : 'text-on-surface-variant hover:text-on-surface'
                              }`}
                            >
                              Itemized per Kitchen ({distinctVendorCount})
                            </button>
                            <button
                              type="button"
                              onClick={() => setTransferMode('consolidated')}
                              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                transferMode === 'consolidated' 
                                  ? 'bg-primary text-white shadow-xs' 
                                  : 'text-on-surface-variant hover:text-on-surface'
                              }`}
                            >
                              1 Central Pool Transfer
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-on-surface leading-relaxed">
                        <strong>100% Direct Payout Guarantee:</strong> Zero wallet lockups. Transfer directly to the verified vendor bank account(s) shown below:
                      </p>

                      {/* Itemized Transfer per Kitchen */}
                      {transferMode === 'itemized' ? (
                        <div className="space-y-3 text-xs">
                          {vendorAllocations.map((alloc, idx) => (
                            <div 
                              key={alloc.vendorId}
                              className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/40 transition-colors space-y-2.5 shadow-xs"
                            >
                              {/* Kitchen Header & Share Total */}
                              <div className="flex items-start justify-between pb-2 border-b border-outline-variant/20">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                      {idx + 1}
                                    </span>
                                    <h4 className="font-bold text-xs text-on-surface">{alloc.vendorName}</h4>
                                  </div>
                                  <div className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-primary" />
                                    <span>{alloc.location.name}</span>
                                    {alloc.isSharedLocation && (
                                      <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold px-1 rounded text-[9px]">
                                        Shared Stop
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-on-surface-variant uppercase font-bold block">Pay to Kitchen</span>
                                  <span className="font-price-display font-black text-sm text-primary">
                                    ₦{alloc.totalToPay.toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Breakdown for this Vendor */}
                              <div className="bg-surface-container-low p-2 rounded-xl text-[10px] space-y-0.5 text-on-surface-variant">
                                <div className="flex justify-between">
                                  <span>Dishes ({alloc.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}):</span>
                                  <strong className="text-on-surface">₦{alloc.foodSubtotal.toLocaleString()}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Packaging:</span>
                                  <strong className="text-on-surface">₦{alloc.packagingFee.toLocaleString()}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Dispatch Share ({alloc.location.name}):</span>
                                  <strong className="text-on-surface">₦{alloc.dispatchShare.toLocaleString()}</strong>
                                </div>
                              </div>

                              {/* Bank Details for this Vendor */}
                              <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-on-surface-variant font-bold">Bank:</span>
                                  <strong className="text-on-surface">{alloc.bankDetails.bankName}</strong>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-on-surface-variant font-bold">Account Name:</span>
                                  <span className="text-on-surface font-semibold truncate max-w-[200px]">{alloc.bankDetails.accountName}</span>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                                  <span className="text-on-surface-variant font-bold">Account Number:</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-sm font-bold text-primary tracking-wider">
                                      {alloc.bankDetails.accountNumber}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(alloc.bankDetails.accountNumber, `acct-${alloc.vendorId}`)}
                                      className="px-2 py-1 rounded-lg bg-primary hover:bg-primary/90 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                                    >
                                      {copiedKey === `acct-${alloc.vendorId}` ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedKey === `acct-${alloc.vendorId}` ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* WhatsApp pre-filled receipt for this vendor */}
                              <a
                                href={buildVendorSpecificWhatsAppUrl(
                                  {
                                    id: 'PENDING',
                                    vendorId: alloc.vendorId,
                                    vendorName: alloc.vendorName,
                                    vendorPhone: alloc.vendorPhone,
                                    customerName: customerName || 'Valued Customer',
                                    customerPhone: customerPhone || '08000000000',
                                    destination: `${destination ? destination + ', ' : ''}${customerLocation.name}`,
                                    items: alloc.items,
                                    foodSubtotal: alloc.foodSubtotal,
                                    dispatchFee: totalDispatchFee,
                                    packagingFee: totalPackagingFee,
                                    totalAmount: grandTotal,
                                    bankDetails: alloc.bankDetails,
                                    paymentStatus: 'customer_confirmed',
                                    kitchenStatus: 'cooking',
                                    prepEtaMins: 25,
                                    createdAt: new Date().toISOString()
                                  },
                                  {
                                    vendorId: alloc.vendorId,
                                    vendorName: alloc.vendorName,
                                    vendorPhone: alloc.vendorPhone,
                                    items: alloc.items,
                                    subtotal: alloc.foodSubtotal,
                                    locationName: alloc.location.name,
                                    dispatchFeeShare: alloc.dispatchShare,
                                    packagingFeeShare: alloc.packagingFee,
                                    totalPayableShare: alloc.totalToPay,
                                    isSharedLocation: alloc.isSharedLocation,
                                    bankDetails: alloc.bankDetails
                                  }
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline text-[11px] font-bold shadow-xs active:scale-98 transition-all flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Notify {alloc.vendorName} on WhatsApp</span>
                                </div>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Single Vendor or Consolidated Central Pool Transfer */
                        <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-amber-500/30 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-on-surface-variant font-bold">1. Bank Name:</span>
                            <strong className="text-on-surface">
                              {isMultiVendor ? 'Zenith Bank PLC' : (primaryVendorAlloc?.bankDetails?.bankName || 'First Bank of Nigeria')}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-on-surface-variant font-bold">2. Account Name:</span>
                            <span className="text-on-surface font-semibold">
                              {isMultiVendor ? 'LokoChop Multi-Vendor Clearing Pool' : (primaryVendorAlloc?.bankDetails?.accountName || primaryVendorAlloc?.vendorName)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t border-outline-variant/20">
                            <span className="text-on-surface-variant font-bold">3. Account Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-base font-bold text-primary tracking-wider">
                                {isMultiVendor ? '1018492041' : (primaryVendorAlloc?.bankDetails?.accountNumber || '3089421570')}
                              </span>
                              <button 
                                type="button"
                                onClick={() => handleCopy(
                                  isMultiVendor ? '1018492041' : (primaryVendorAlloc?.bankDetails?.accountNumber || '3089421570'),
                                  'main'
                                )}
                                className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-container text-white text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-transform"
                                title="Copy account number"
                              >
                                {copiedKey === 'main' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedKey === 'main' ? 'Copied!' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t border-outline-variant/20">
                            <span className="text-on-surface-variant font-bold">4. Exact Total to Transfer:</span>
                            <span className="font-price-display text-base font-bold text-primary">
                              ₦{finalGrandTotal.toLocaleString()}
                            </span>
                          </div>
                          {isMultiVendor && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 pt-1 font-medium">
                              ✓ Automatically distributed to all {distinctVendorCount} kitchens upon confirmation.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* WhatsApp Support & Legal Terms Link */}
                    <div className="text-center pt-1 pb-2 space-y-1.5">
                      <a 
                        href="https://wa.me/2349074072454?text=Hello%20LokoChop%20Team,%20I%20have%20an%20inquiry%20regarding%20my%20order%20payment"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-tertiary hover:underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Need help with payment? WhatsApp: +2349074072454</span>
                      </a>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigate('faqs-legal');
                          }}
                          className="text-[11px] text-on-surface-variant hover:text-primary underline cursor-pointer"
                        >
                          View Multi-Vendor Policy, Location Tariffs &amp; NDPR Privacy Guarantee
                        </button>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Sticky Drawer Footer Action */}
              {items.length > 0 && (
                <div className="p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] border-t border-outline-variant/25 bg-surface-container-low/95 backdrop-blur-md">
                  <button 
                    type="button"
                    disabled={isProcessing}
                    onClick={handleTransferDone}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline text-sm sm:text-base font-bold shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                    <span className="truncate">
                      {isProcessing ? 'Logging Order...' : `I have transferred (₦${finalGrandTotal.toLocaleString()})`}
                    </span>
                  </button>
                  <p className="text-center text-[10px] sm:text-[11px] text-on-surface-variant mt-2">
                    {isMultiVendor 
                      ? `Dispatches alert to ${distinctVendorCount} kitchens and central dispatch (+2349074072454).`
                      : `Dispatches WhatsApp alert to ${primaryVendorAlloc?.vendorName || 'Kitchen'} and LokoChop Support.`}
                  </p>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Transfer Modal */}
      <PaymentTransferModal
        isOpen={isTransferModalOpen}
        order={activeCreatedOrder}
        onClose={() => setIsTransferModalOpen(false)}
        onProceedToTracking={handleProceedToTracking}
      />
    </>
  );
};
