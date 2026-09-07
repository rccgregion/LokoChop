import React, { useState, useEffect, useMemo } from 'react';
import { CartItem, ActiveView } from '../types';
import { APPROVED_LOKOJA_VENDORS } from '../data/approvedVendors';
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
  ChevronDown
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
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

  // Customer contact & destination fields
  const [customerName, setCustomerName] = useState('Halimat Sani');
  const [customerPhone, setCustomerPhone] = useState('08031234567');
  
  // Specific Customer Location in Lokoja
  const [customerLocationId, setCustomerLocationId] = useState<string>('lokongoma');
  const [destination, setDestination] = useState('Near Police Post, Phase 1 Gate');

  // Multi-vendor payment mode toggle: Defaults to 'itemized' as required by user
  const [transferMode, setTransferMode] = useState<'itemized' | 'consolidated'>('itemized');

  // Active Order & Modal
  const [activeCreatedOrder, setActiveCreatedOrder] = useState<LiveOrder | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
      LOKOJA_LOCATIONS.find(l => l.id === customerLocationId)?.name || 'Lokongoma'
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
      totalAmount: grandTotal,
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

    // Save active order ID in local storage for tracking
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-xs z-50 transition-opacity duration-300"
      />

      {/* Slide-out Drawer */}
      <div 
        className="fixed top-0 right-0 h-full w-full sm:w-[540px] bg-surface-container-lowest/98 backdrop-blur-md shadow-2xl z-50 flex flex-col border-l border-outline-variant/30 text-on-surface"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-headline text-xl font-bold text-on-surface">Your Chop Cart</h2>
            </div>
            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
              {isMultiVendor ? (
                <span className="text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {distinctVendorCount} Kitchens across {distinctLocationCount} Pickup Stop{distinctLocationCount > 1 ? 's' : ''}
                </span>
              ) : (
                <>
                  Vendor: <strong className="text-on-surface">{primaryVendorAlloc?.vendorName || 'Lokoja Kitchen'}</strong> ({primaryVendorAlloc?.location.name || 'Lokoja'})
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button 
                id="empty-cart-header-btn"
                type="button"
                onClick={() => setShowEmptyConfirm(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-error bg-error/10 hover:bg-error/20 border border-error/25 transition-all active:scale-95 cursor-pointer"
                title="Empty entire cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Cart</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dynamic Items List & Direct Transfer Notice */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scroll">

          {/* Toast Notification for Removed / Emptied Cart */}
          {removedNotice && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/25 text-error text-xs font-semibold flex items-center justify-between animate-fade-in shadow-2xs">
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
            <div className="p-4 bg-error/10 border border-error/30 rounded-2xl space-y-3 text-xs animate-fade-in shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-error">Empty your Chop Cart?</h4>
                  <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">
                    Are you sure you want to remove all {items.reduce((acc, it) => acc + it.quantity, 0)} item{items.length > 1 ? 's' : ''} from your cart? This will clear your current food order.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmptyConfirm(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onEmptyCart) onEmptyCart();
                    setShowEmptyConfirm(false);
                    setRemovedNotice('Your Chop Cart has been emptied');
                    setTimeout(() => setRemovedNotice(null), 3000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-error text-white hover:bg-error/90 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Empty Cart</span>
                </button>
              </div>
            </div>
          )}
          
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto text-on-surface-variant">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface">Your Chop Cart is Empty</h3>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                Discover steaming authentic dishes from Lokoja&apos;s verified traditional and modern kitchens.
              </p>
            </div>
          ) : (
            <>
              {/* Hold Reservation Timer */}
              <div className="p-3 bg-tertiary-fixed/30 text-on-tertiary-fixed rounded-xl flex items-center justify-between text-xs border border-tertiary/20">
                <span className="flex items-center gap-1.5 font-bold">
                  <Timer className="w-4 h-4 text-tertiary animate-pulse" />
                  Kitchen pot reservation held:
                </span>
                <span className="font-mono font-bold bg-tertiary text-on-tertiary px-2 py-0.5 rounded">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>

              {/* Thermal Packaging & 10am Ready Pots Note */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-[11px] text-on-surface">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔥</span>
                  <div>
                    <span className="font-bold">Hot Pots Ready Since 10:00 AM:</span> No cooking delays. Fast 3–7 min packaging.
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full shrink-0">
                  Thermal Guaranteed
                </span>
              </div>

              {/* 🚨 TRANSPARENT MULTI-VENDOR NOTIFICATION BANNER */}
              {isMultiVendor && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 space-y-2 animate-fade-in shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs text-amber-950 dark:text-amber-200">
                          Multi-Vendor Dispatch Notice
                        </h4>
                        <span className="bg-amber-500/30 text-amber-900 dark:text-amber-100 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          {distinctVendorCount} Separate Kitchens
                        </span>
                        <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {distinctLocationCount} Pickup Stop{distinctLocationCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface leading-relaxed">
                        You have ordered from <strong>{vendorAllocations.map(v => v.vendorName).join(', ')}</strong>.
                      </p>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        Dispatch fees are calculated transparently based on each kitchen&apos;s distinct location in Lokoja relative to your delivery destination (<strong>{customerLocation.name}</strong>).
                      </p>
                      {hasCoLocatedVendors && (
                        <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            <strong>Shared Location Discount:</strong> Multiple kitchens share the same pickup hub — their stop fee is consolidated so you are not charged twice!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Dishes Grouped by Kitchen */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>Ordered Dishes ({items.length})</span>
                  <div className="flex items-center gap-3">
                    <span>{distinctVendorCount} Kitchen{distinctVendorCount > 1 ? 's' : ''}</span>
                    <button
                      type="button"
                      onClick={() => setShowEmptyConfirm(true)}
                      className="text-error hover:underline flex items-center gap-1 font-bold normal-case text-xs cursor-pointer"
                      title="Empty all items from cart"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Empty Cart</span>
                    </button>
                  </div>
                </div>

                {vendorAllocations.map((alloc) => (
                  <div 
                    key={alloc.vendorId}
                    className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2.5 shadow-xs"
                  >
                    {/* Kitchen Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-on-surface">{alloc.vendorName}</h4>
                          <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            {alloc.location.name} ({alloc.location.tier})
                            {alloc.isSharedLocation && (
                              <span className="text-emerald-600 font-bold ml-1">
                                [Shared Stop]
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-on-surface-variant block">Food Subtotal</span>
                        <span className="font-price-display font-bold text-xs text-primary">
                          ₦{alloc.foodSubtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Kitchen Items */}
                    <div className="space-y-2">
                      {alloc.items.map((item) => (
                        <div 
                          key={item.id} 
                          id={`cart-item-${item.id}`}
                          className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-on-surface truncate">{item.name}</h5>
                            <div className="font-price-display text-primary font-bold text-xs">
                              ₦{(item.price * item.quantity).toLocaleString()}
                              <span className="text-[10px] font-normal text-on-surface-variant ml-1 font-sans">
                                (₦{item.price.toLocaleString()} ea)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-outline-variant/40 rounded-lg bg-surface-container">
                              <button 
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="p-1 hover:bg-surface-container-high transition-colors cursor-pointer text-on-surface-variant"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-1.5 text-xs font-bold text-on-surface">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="p-1 hover:bg-surface-container-high transition-colors cursor-pointer text-on-surface-variant"
                                title="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Explicit Remove from Cart Button */}
                            <button 
                              id={`remove-from-cart-${item.id}`}
                              type="button"
                              onClick={() => {
                                onRemoveItem(item.id);
                                setRemovedNotice(`Removed "${item.name}" from cart`);
                                setTimeout(() => setRemovedNotice(null), 2500);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-error hover:text-white hover:bg-error bg-error/10 border border-error/25 rounded-lg transition-all active:scale-95 cursor-pointer group"
                              title="Remove from cart"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 className="w-3 h-3 text-error group-hover:text-white transition-colors" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Contact & Accurate Delivery Destination Selection */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Delivery Destination (Lokoja Dispatch)
                </span>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-on-surface flex items-center gap-1 mb-1">
                      <User className="w-3 h-3 text-primary" />
                      <span>Customer Name:</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Halimat Sani"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-on-surface flex items-center gap-1 mb-1">
                      <Phone className="w-3 h-3 text-primary" />
                      <span>Phone Number (for WhatsApp/Calls):</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 08031234567"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-primary"
                      required
                    />
                  </div>

                  {/* 📍 Accurate Lokoja Delivery Neighborhood Selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>Select Delivery Neighborhood:</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                        {customerLocation.tierLabel}
                      </span>
                    </label>
                    <select
                      value={customerLocationId}
                      onChange={(e) => setCustomerLocationId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface font-semibold focus:outline-primary cursor-pointer"
                    >
                      <optgroup label="Tier 1 — Core Urban (Base ₦800)">
                        {LOKOJA_LOCATIONS.filter(l => l.tier === 'Tier 1').map(l => (
                          <option key={l.id} value={l.id}>
                            {l.name} ({l.tierLabel})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Tier 2 — Mid-Range Corridors (Base ₦1,200)">
                        {LOKOJA_LOCATIONS.filter(l => l.tier === 'Tier 2').map(l => (
                          <option key={l.id} value={l.id}>
                            {l.name} ({l.tierLabel})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Tier 3 — Peripheral Highway (Base ₦2,000)">
                        {LOKOJA_LOCATIONS.filter(l => l.tier === 'Tier 3').map(l => (
                          <option key={l.id} value={l.id}>
                            {l.name} ({l.tierLabel})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-on-surface flex items-center gap-1 mb-1">
                      <Store className="w-3 h-3 text-primary" />
                      <span>Street Address / Exact Landmark:</span>
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Flat 4, Behind Police Post, Phase 1 Gate"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 100% Transparent Price Calculation Breakdown */}
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                  <span className="font-bold text-on-surface uppercase text-[11px] tracking-wider">
                    Transparent Cost Breakdown
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('faqs-legal');
                    }}
                    className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>How fees are calculated</span>
                  </button>
                </div>

                <div className="flex justify-between text-on-surface-variant">
                  <span>Food Subtotal ({items.reduce((s, it) => s + it.quantity, 0)} dishes):</span>
                  <span className="font-semibold text-on-surface">₦{totalFoodSubtotal.toLocaleString()}</span>
                </div>

                {/* Granular Location Dispatch Breakdown */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-on-surface">
                    <span className="flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5 text-primary" />
                      <span>
                        Rider Dispatch ({distinctLocationCount} Location Stop{distinctLocationCount > 1 ? 's' : ''} to {customerLocation.name}):
                      </span>
                    </span>
                    <span className="text-primary font-price-display font-bold text-xs">
                      ₦{totalDispatchFee.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Stops breakdown list */}
                  <div className="space-y-1 pl-3 border-l-2 border-primary/30 text-[10px] text-on-surface-variant">
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
                </div>

                <div className="flex justify-between text-on-surface-variant">
                  <span>Eco-Insulated Packaging ({distinctVendorCount} kitchen{distinctVendorCount > 1 ? 's' : ''} @ ₦250):</span>
                  <span className="font-semibold text-on-surface">₦{totalPackagingFee.toLocaleString()}</span>
                </div>

                <div className="pt-2 border-t border-outline-variant/30 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-on-surface block">Total Payable:</span>
                    <span className="text-[10px] text-on-surface-variant">
                      {isMultiVendor 
                        ? `Covering ${distinctVendorCount} kitchens across ${distinctLocationCount} Lokoja locations` 
                        : 'Food + Single Kitchen Rider'}
                    </span>
                  </div>
                  <span className="font-price-display text-2xl font-bold text-primary">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* MANDATORY USER REQUIREMENT: Direct Bank Transfer Details */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>DIRECT BANK PAYMENT INSTRUCTIONS</span>
                  </div>
                  {isMultiVendor && (
                    <div className="flex items-center p-0.5 bg-surface-container rounded-lg text-[10px]">
                      <button
                        type="button"
                        onClick={() => setTransferMode('itemized')}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
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
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
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
                  <strong>100% Direct Payout Guarantee:</strong> Zero wallet lockups. Transfer directly to the respective verified vendor bank account(s) shown below:
                </p>

                {/* 🎯 USER REQUIREMENT: Itemized Transfer per Kitchen Showing Account Details & Exact Amount for All Vendors */}
                {transferMode === 'itemized' ? (
                  <div className="space-y-3 text-xs">
                    {vendorAllocations.map((alloc, idx) => (
                      <div 
                        key={alloc.vendorId}
                        className="p-3 rounded-xl bg-surface-container-lowest border-2 border-outline-variant/40 hover:border-primary/50 transition-colors space-y-2 shadow-xs"
                      >
                        {/* Kitchen Header & Share Total */}
                        <div className="flex items-start justify-between pb-1.5 border-b border-outline-variant/20">
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
                            <span className="text-[9px] text-on-surface-variant uppercase font-bold block">Pay to this Kitchen</span>
                            <span className="font-price-display font-black text-sm text-primary">
                              ₦{alloc.totalToPay.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Breakdown for this Vendor */}
                        <div className="bg-surface-container-low p-2 rounded-lg text-[10px] space-y-0.5 text-on-surface-variant">
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
                        <div className="p-2 rounded-lg bg-surface-container border border-outline-variant/30 space-y-1 text-xs">
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
                                className="px-2 py-0.5 rounded-md bg-primary hover:bg-primary/90 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
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
                          className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-headline text-[11px] font-bold shadow-xs active:scale-98 transition-all flex items-center justify-between cursor-pointer"
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
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-amber-500/30 space-y-1.5 text-xs">
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
                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
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
                          className="px-2 py-0.5 rounded-lg bg-primary hover:bg-primary-container text-white text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-transform"
                          title="Copy account number"
                        >
                          {copiedKey === 'main' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'main' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                      <span className="text-on-surface-variant font-bold">4. Exact Total to Transfer:</span>
                      <span className="font-price-display text-base font-bold text-primary">
                        ₦{grandTotal.toLocaleString()}
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
              <div className="text-center pt-1 space-y-1.5">
                <a 
                  href="https://wa.me/2349074072454?text=Hello%20LokoChop%20Team,%20I%20have%20an%20inquiry%20regarding%20my%20multi-vendor%20bank%20transfer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Need help with transfer? WhatsApp: +2349074072454</span>
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
          <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest">
            <button 
              type="button"
              disabled={isProcessing}
              onClick={handleTransferDone}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline text-base font-bold shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>
                {isProcessing ? 'Logging Order...' : `I have transferred payment (₦${grandTotal.toLocaleString()})`}
              </span>
            </button>
            <p className="text-center text-[11px] text-on-surface-variant mt-2">
              {isMultiVendor 
                ? `Dispatches alert to ${distinctVendorCount} kitchens and central dispatch (+2349074072454).`
                : `Dispatches WhatsApp alert to ${primaryVendorAlloc?.vendorName || 'Kitchen'} and LokoChop Support.`}
            </p>
          </div>
        )}

      </div>

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

