import React, { useState, useEffect } from 'react';
import { ActiveView } from '../types';
import { 
  orderService, 
  LiveOrder, 
  buildVendorWhatsAppUrl, 
  buildVendorSpecificWhatsAppUrl,
  buildSupportWhatsAppUrl, 
  LOKOCHOP_SUPPORT_WHATSAPP 
} from '../services/orderService';
import { 
  Check, 
  Copy, 
  Clock, 
  Timer, 
  RotateCw, 
  MessageCircle, 
  MapPin, 
  Store, 
  ShieldAlert, 
  Bike, 
  Home, 
  Flame, 
  CreditCard,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronDown,
  Crown,
  Users,
  ShieldCheck
} from 'lucide-react';

interface OrderTrackingViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showAllVendorWhatsApp, setShowAllVendorWhatsApp] = useState(false);
  const [activeOrder, setActiveOrder] = useState<LiveOrder | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(25 * 60);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Subscribe to the active order
  useEffect(() => {
    let activeId = localStorage.getItem('lokochop_active_order_id') || 'LK-4092';
    const unsub = orderService.subscribeToOrder(activeId, (order) => {
      setActiveOrder(order);
      if (order.prepEtaMins) {
        setCountdownSeconds(order.prepEtaMins * 60);
      }
    });
    return () => unsub();
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentOrder: LiveOrder = activeOrder || {
    id: 'LK-4092',
    vendorId: 'mama-ngozi-kitchen',
    vendorName: "Mama Ngozi's Kitchen",
    vendorPhone: '+2348035551201',
    customerName: 'Halimat Sani',
    customerPhone: '08031234567',
    destination: 'House 14, Phase 1 Lokongoma, Lokoja',
    items: [
      { id: '1', name: 'Smoked Catfish Fishermans Soup & Pounded Yam', price: 4200, quantity: 1 },
      { id: '2', name: 'Party Jollof & Fried Goat Meat', price: 2800, quantity: 1 }
    ],
    foodSubtotal: 7000,
    dispatchFee: 800,
    packagingFee: 300,
    totalAmount: 8100,
    bankDetails: {
      bankName: 'First Bank of Nigeria',
      accountNumber: '3089421570',
      accountName: 'Ngozi Amaka Ventures'
    },
    paymentStatus: 'customer_confirmed',
    kitchenStatus: 'idle',
    prepEtaMins: 25,
    createdAt: new Date().toISOString()
  };

  const isPaymentConfirmedByVendor = currentOrder.paymentStatus === 'vendor_verified';
  const isCooking = currentOrder.kitchenStatus === 'cooking';
  const isDispatched = currentOrder.kitchenStatus === 'dispatched';
  const isDelivered = currentOrder.kitchenStatus === 'delivered';

  const handleCopyAccount = () => {
    navigator.clipboard?.writeText(currentOrder.bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyVendorAccount = (accNum: string, idx: number) => {
    navigator.clipboard?.writeText(accNum);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (isPaymentConfirmedByVendor) {
        setRefreshMessage(`Vendor ${currentOrder.vendorName} has verified payment! Food preparation is underway.`);
      } else {
        setRefreshMessage(`Still checking with ${currentOrder.vendorName}... Awaiting direct mobile bank verification.`);
      }
      setTimeout(() => setRefreshMessage(null), 5000);
    }, 900);
  };

  const vendorWhatsAppUrl = buildVendorWhatsAppUrl(currentOrder);
  const supportWhatsAppUrl = buildSupportWhatsAppUrl(currentOrder);

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 pb-16">
      
      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-on-surface-variant text-xs mb-2">
        <button onClick={() => onNavigate('marketplace')} className="hover:text-primary transition-colors cursor-pointer">
          Marketplace
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <button onClick={() => onNavigate('order-history')} className="hover:text-primary transition-colors cursor-pointer">
          My Account
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-primary font-bold truncate">Order #{currentOrder.id}</span>
      </nav>

      {/* Top Alert Notification Bar */}
      <div className="w-full bg-surface-container-high border border-outline-variant/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-on-surface text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          {isPaymentConfirmedByVendor ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-primary shrink-0 animate-pulse" />
          )}
          <p className="leading-tight">
            <span className="font-bold text-primary">Live Dispatch Status:</span>{' '}
            {isPaymentConfirmedByVendor
              ? `Payment confirmed by ${currentOrder.vendorName}! Estimated delivery in ${minutes} mins.`
              : `Payment transferred by customer. Awaiting ${currentOrder.vendorName} to verify bank credit alert.`}
          </p>
        </div>
        <button
          onClick={handleRefreshStatus}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-primary font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-outline-variant/30 transition-all shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Checking...' : 'Check Status'}</span>
        </button>
      </div>

      {refreshMessage && (
        <div className="p-3 bg-secondary-fixed text-on-secondary-fixed rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span>{refreshMessage}</span>
          <button onClick={() => setRefreshMessage(null)} className="cursor-pointer text-xs font-bold">&times;</button>
        </div>
      )}

      {/* Asymmetric 12-Column Hero & Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Columns: Status Hero Panel & Detailed 6-Step Timeline */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Prominent Status Hero Card */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-7 relative overflow-hidden shadow-xs space-y-4">
            
            {/* Top Tag and Live Pulse */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPaymentConfirmedByVendor ? 'bg-emerald-500' : 'bg-primary'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isPaymentConfirmedByVendor ? 'bg-emerald-600' : 'bg-primary'}`}></span>
                </span>
                <span className="text-xs text-primary font-bold tracking-wide font-mono">ORDER #{currentOrder.id}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentOrder.isPremiumTier && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full font-bold border border-amber-500/30">
                    <Crown className="w-3 h-3 text-amber-600" />
                    <span>Premium: Hot Guaranteed</span>
                  </span>
                )}
                {currentOrder.isPrivateDelivery && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-primary/15 text-primary px-2.5 py-1 rounded-full font-bold border border-primary/25">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Private #{currentOrder.privateReferenceCode}</span>
                  </span>
                )}
                {currentOrder.isGroupCart && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full font-bold border border-indigo-500/25">
                    <Users className="w-3 h-3" />
                    <span>Group ({currentOrder.memberCount || 2} members)</span>
                  </span>
                )}
                <span className="text-xs text-secondary bg-secondary-fixed/50 px-3 py-1 rounded-full font-bold">
                  Vendor: {currentOrder.vendorName}
                </span>
              </div>
            </div>

            {/* Scheduled Window Alert if applicable */}
            {currentOrder.scheduled_window && (
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-primary font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Scheduled Delivery Window: <strong>{currentOrder.scheduled_window}</strong></span>
              </div>
            )}

            {/* Hero Status Banner */}
            <div>
              <div className={`inline-block font-headline text-xs font-bold px-3 py-1 rounded-lg mb-2 ${
                isPaymentConfirmedByVendor 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-primary-fixed text-primary'
              }`}>
                {isPaymentConfirmedByVendor ? 'Payment Verified & Portioning' : 'Payment Under Vendor Review'}
              </div>
              
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface leading-tight">
                {isDispatched
                  ? 'Food Handed to Confluence Rider'
                  : isCooking || isPaymentConfirmedByVendor
                  ? `Pots Ready & Packaging at ${currentOrder.vendorName}`
                  : 'Awaiting Vendor Payment Confirmation'}
              </h1>

              <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
                {isPaymentConfirmedByVendor
                  ? `The kitchen verified credit of ₦${currentOrder.totalAmount.toLocaleString()} to ${currentOrder.bankDetails.bankName}. Because morning pots are hot and ready by 10:00 AM, food does not need raw cooking from scratch—it is being portioned and sealed into tamper-evident thermal packs right now!`
                  : `Customer confirmed bank transfer of ₦${currentOrder.totalAmount.toLocaleString()} to ${currentOrder.bankDetails.bankName} #${currentOrder.bankDetails.accountNumber}. The vendor is reconciling their mobile bank alert.`}
              </p>
            </div>

            {/* Thermal Freshness Guarantee Card */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5">
              <span className="text-lg">🔥</span>
              <div className="space-y-0.5">
                <strong className="text-amber-900 dark:text-amber-300 font-bold block">
                  Lokoja Thermal Warmth Guarantee
                </strong>
                <p className="text-on-surface-variant text-[11px] leading-relaxed">
                  Food is kept hot in kitchen warmers (prepared fresh by 10:00 AM daily) and dispatched in double-insulated thermal delivery packs. No cold food anxiety!
                </p>
              </div>
            </div>

            {/* Live WhatsApp Alert Triggers for Customer */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2.5">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Need immediate update? Dispatch WhatsApp alerts:</span>
              </span>
              
              {currentOrder.isMultiVendor && currentOrder.vendorShares && currentOrder.vendorShares.length > 0 ? (
                <div className="space-y-2">
                  <a
                    href={supportWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95 border border-stone-700"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Central Dispatch (All {currentOrder.vendorShares.length} Kitchens Itemized)</span>
                  </a>

                  <button
                    onClick={() => setShowAllVendorWhatsApp(!showAllVendorWhatsApp)}
                    className="w-full py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs flex items-center justify-between cursor-pointer border border-outline-variant/30 transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Message Specific Kitchen ({currentOrder.vendorShares.length} Available)</span>
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllVendorWhatsApp ? 'rotate-180' : ''}`} />
                  </button>

                  {showAllVendorWhatsApp && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {currentOrder.vendorShares.map((share, sIdx) => {
                        const vUrl = buildVendorSpecificWhatsAppUrl(currentOrder, share);
                        return (
                          <a
                            key={share.vendorId || sIdx}
                            href={vUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 text-[11px] font-semibold flex items-center justify-between gap-1 transition-all"
                          >
                            <span className="truncate">{share.vendorName}</span>
                            <MessageCircle className="w-3 h-3 shrink-0 text-emerald-600" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={vendorWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Vendor ({currentOrder.vendorName})</span>
                  </a>
                  <a
                    href={supportWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95 border border-stone-700"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Support ({LOKOCHOP_SUPPORT_WHATSAPP})</span>
                  </a>
                </div>
              )}
            </div>

            {/* Live Step-by-Step Progress Timeline (6 Steps) */}
            <div className="mt-4 pt-4 border-t border-outline-variant/15 space-y-4">
              <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">PROGRESS TIMELINE</h2>
              
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/40">
                
                {/* Step 1: Order Placed */}
                <div className="relative flex items-start gap-3.5 text-xs">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-headline text-sm font-bold text-on-surface">1. Order Placed &amp; Cataloged</p>
                      <span className="text-emerald-700 font-bold">Completed &#10003;</span>
                    </div>
                    <p className="text-on-surface-variant text-[11px]">
                      {currentOrder.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Step 2: Customer Bank Transfer Sent */}
                <div className="relative flex items-start gap-3.5 text-xs">
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-headline text-sm font-bold text-on-surface">2. Customer Bank Transfer Sent</p>
                      <span className="text-emerald-700 font-bold">Completed &#10003;</span>
                    </div>
                    <p className="text-on-surface-variant text-[11px]">
                      ₦{currentOrder.totalAmount.toLocaleString()} sent from customer&apos;s mobile app to {currentOrder.bankDetails.bankName}
                    </p>
                  </div>
                </div>

                {/* Step 3: Vendor Payment Confirmation */}
                <div className={`relative flex items-start gap-3.5 p-3 rounded-xl border text-xs ${
                  isPaymentConfirmedByVendor 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30' 
                    : 'bg-primary-fixed/20 border-primary/20 -mx-3'
                }`}>
                  <div className={`absolute -left-3 top-3 w-5 h-5 rounded-full flex items-center justify-center text-xs ring-4 ${
                    isPaymentConfirmedByVendor
                      ? 'bg-emerald-600 text-white ring-emerald-200'
                      : 'bg-primary text-on-primary ring-primary-fixed'
                  }`}>
                    {isPaymentConfirmedByVendor ? <Check className="w-3 h-3 stroke-[3]" /> : <RotateCw className="w-3 h-3 animate-spin" />}
                  </div>
                  <div className="flex-1 pl-2">
                    <div className="flex items-center justify-between">
                      <p className={`font-headline text-sm font-bold ${isPaymentConfirmedByVendor ? 'text-emerald-800 dark:text-emerald-300' : 'text-primary'}`}>
                        3. Vendor Credit Verification
                      </p>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                        isPaymentConfirmedByVendor
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-primary-fixed text-primary'
                      }`}>
                        {isPaymentConfirmedByVendor ? 'Verified &#10003;' : 'Under Review &#x23F3;'}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-[11px] mt-0.5">
                      {isPaymentConfirmedByVendor
                        ? `${currentOrder.vendorName} confirmed credit alert of ₦${currentOrder.totalAmount.toLocaleString()} and set prep time to ${currentOrder.prepEtaMins} mins.`
                        : `${currentOrder.vendorName} is checking ${currentOrder.bankDetails.bankName} alert for credit of ₦${currentOrder.totalAmount.toLocaleString()}.`}
                    </p>
                  </div>
                </div>

                {/* Step 4: Food Preparing in Kitchen */}
                <div className={`relative flex items-start gap-3.5 text-xs ${isPaymentConfirmedByVendor ? 'opacity-100' : 'opacity-60'}`}>
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isCooking || isPaymentConfirmedByVendor 
                      ? 'bg-amber-600 text-white animate-pulse' 
                      : 'bg-surface-container-highest border border-outline text-outline'
                  }`}>
                    <Flame className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-headline text-sm font-bold text-on-surface">4. Portioning &amp; Tamper-Evident Packaging</p>
                      <span className={isPaymentConfirmedByVendor ? 'text-amber-700 font-bold' : 'text-on-surface-variant'}>
                        {isPaymentConfirmedByVendor ? 'Pots Ready Since 10am' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-[11px]">
                      Food cooked fresh by 10:00 AM and kept warm in insulated warmers. Fast 3–7 min packaging turnaround into leakproof thermal containers.
                    </p>
                  </div>
                </div>

                {/* Step 5: Out for Delivery with Rider */}
                <div className={`relative flex items-start gap-3.5 text-xs ${isDispatched ? 'opacity-100' : 'opacity-60'}`}>
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isDispatched 
                      ? 'bg-tertiary text-on-tertiary' 
                      : 'bg-surface-container-highest border border-outline text-outline'
                  }`}>
                    <Bike className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-headline text-sm font-bold text-on-surface">5. Out for Delivery with Rider</p>
                      <span className={isDispatched ? 'text-tertiary font-bold' : 'text-on-surface-variant'}>
                        {isDispatched ? 'En Route' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-[11px]">
                      Confluence dispatch rider in insulated carrier to: {currentOrder.destination}
                    </p>
                  </div>
                </div>

                {/* Step 6: Delivered to Doorstep */}
                <div className={`relative flex items-start gap-3.5 text-xs ${isDelivered ? 'opacity-100' : 'opacity-60'}`}>
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isDelivered ? 'bg-emerald-600 text-white' : 'bg-surface-container-highest border border-outline text-outline'
                  }`}>
                    <Home className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-headline text-sm font-bold text-on-surface">6. Delivered Hot &amp; Steaming</p>
                      <span className="text-on-surface-variant">{isDelivered ? 'Delivered' : 'Final Step'}</span>
                    </div>
                    <p className="text-on-surface-variant text-[11px]">{currentOrder.destination}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Vendor Details Box */}
          {currentOrder.isMultiVendor && currentOrder.vendorShares && currentOrder.vendorShares.length > 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  <div>
                    <h2 className="font-headline text-base font-bold text-on-surface">Participating Kitchens</h2>
                    <p className="text-[11px] text-on-surface-variant">Order spans {currentOrder.vendorShares.length} distinct food artisans across Lokoja</p>
                  </div>
                </div>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {currentOrder.vendorShares.length} Pickups
                </span>
              </div>

              <div className="divide-y divide-outline-variant/20">
                {currentOrder.vendorShares.map((share, sIdx) => (
                  <div key={share.vendorId || sIdx} className="py-2.5 first:pt-0 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-on-surface">
                      <span className="flex items-center gap-1.5 text-primary">
                        <Store className="w-3.5 h-3.5" />
                        <span>{sIdx + 1}. {share.vendorName}</span>
                      </span>
                      <a href={`tel:${share.vendorPhone}`} className="text-primary hover:underline flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" /> {share.vendorPhone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                      <MapPin className="w-3 h-3 text-outline" />
                      <span>{share.locationName || 'Lokoja Kitchen'}</span>
                      {share.isSharedLocation && (
                        <span className="text-emerald-700 bg-emerald-100 text-[9px] px-1.5 py-0.2 rounded font-bold">Shared Location</span>
                      )}
                    </div>
                    <div className="text-[11px] text-on-surface bg-surface-container-low p-2 rounded-lg">
                      <span className="font-semibold text-on-surface-variant">Preparing: </span>
                      {share.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 flex flex-col sm:flex-row gap-5 items-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-700 text-white font-headline font-bold text-2xl flex items-center justify-center shrink-0 shadow-xs">
                {currentOrder.vendorName.substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1.5 text-center sm:text-left text-xs">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-headline text-base font-bold text-on-surface">{currentOrder.vendorName}</span>
                  <span className="bg-tertiary/15 text-tertiary px-2 py-0.5 rounded-md text-[10px] font-bold">Verified Kitchen</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Direct kitchen preparation. No microwaved foods; authentic traditional recipes cooked warm upon payment verification.
                </p>
                <div className="inline-flex items-center gap-1.5 text-tertiary font-semibold pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Vendor Hotline: {currentOrder.vendorPhone}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right 5 Columns: Countdown Card, Transfer Verification Box & Order Details */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Preparation & Delivery Countdown Card */}
          <div className="bg-surface-container rounded-3xl border-2 border-primary-container p-4 sm:p-6 relative shadow-xs overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold text-primary uppercase tracking-wider">
                {isPaymentConfirmedByVendor ? 'Estimated Delivery Countdown' : 'Awaiting Vendor Credit Confirmation'}
              </span>
            </div>

            {/* Digital Countdown Display */}
            <div className="bg-surface-container-lowest rounded-2xl p-3.5 sm:p-5 border border-outline-variant/30 text-center space-y-1 shadow-inner">
              <div className="font-price-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight">
                {formattedCountdown}
              </div>
              <p className="text-[11px] sm:text-xs text-on-surface-variant font-semibold">
                {isPaymentConfirmedByVendor
                  ? `Vendor Set Prep & Delivery Window (${currentOrder.prepEtaMins} mins)`
                  : 'Reconciliation Window (Direct Bank Verification)'}
              </p>
            </div>

            {/* Reassurance Note */}
            <p className="text-xs text-on-surface mt-4 leading-relaxed bg-surface-container-high/60 p-3.5 rounded-xl border border-outline-variant/20">
              <span className="font-bold text-on-surface">{currentOrder.vendorName}</span> confirms payments directly from their merchant view. Once verified, the kitchen indicates how long before your meal arrives hot.
            </p>

            <div className="mt-4 flex items-center justify-between text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Direct NUBAN Transfer
              </span>
              <span className="font-mono font-bold text-on-surface">Order #{currentOrder.id}</span>
            </div>
          </div>

          {/* Vendor Bank Account Reference Card */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-secondary" />
                <h2 className="font-headline text-base font-bold text-on-surface">
                  {currentOrder.isMultiVendor && currentOrder.vendorShares && currentOrder.vendorShares.length > 0
                    ? `Direct Bank Accounts (${currentOrder.vendorShares.length} Kitchens)`
                    : 'Vendor Bank Details'}
                </h2>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                100% Direct Transfer
              </span>
            </div>

            {currentOrder.isMultiVendor && currentOrder.vendorShares && currentOrder.vendorShares.length > 0 ? (
              <div className="space-y-3">
                {currentOrder.vendorShares.map((share, idx) => {
                  const shareTotal = share.totalPayableShare || (share.subtotal + (share.packagingFeeShare ?? 250) + (share.dispatchFeeShare ?? 0));
                  return (
                    <div key={share.vendorId || idx} className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-on-surface flex items-center gap-1 text-primary">
                          <Store className="w-3 h-3" />
                          <span>{idx + 1}. {share.vendorName}</span>
                        </span>
                        <span className="font-price-display font-bold text-primary text-xs">
                          ₦{shareTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        <div>Bank: <strong className="text-on-surface">{share.bankDetails.bankName}</strong></div>
                        <div>Name: <span className="text-on-surface">{share.bankDetails.accountName}</span></div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                        <span className="font-mono text-sm font-bold text-on-surface tracking-wider">
                          {share.bankDetails.accountNumber}
                        </span>
                        <button
                          onClick={() => handleCopyVendorAccount(share.bankDetails.accountNumber, idx)}
                          className="px-2 py-0.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-[10px] font-bold text-secondary flex items-center gap-1 border border-outline-variant/30 cursor-pointer"
                        >
                          {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2.5 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 text-xs">
                <div>
                  <span className="text-on-surface-variant block uppercase text-[10px]">Bank Name</span>
                  <span className="font-headline text-sm font-bold text-on-surface">{currentOrder.bankDetails.bankName}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block uppercase text-[10px]">Account Name</span>
                  <span className="font-semibold text-on-surface text-xs">{currentOrder.bankDetails.accountName}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block uppercase text-[10px]">Account Number</span>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-base font-bold text-primary tracking-wider">
                      {currentOrder.bankDetails.accountNumber}
                    </span>
                    <button 
                      onClick={handleCopyAccount}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-[10px] font-bold text-secondary flex items-center gap-1 border border-outline-variant/30 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items Breakdown */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/20 text-xs">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                Order Items ({currentOrder.items.length})
              </span>
              
              {currentOrder.isMultiVendor && currentOrder.vendorShares && currentOrder.vendorShares.length > 0 ? (
                <div className="space-y-3">
                  {currentOrder.vendorShares.map((share, idx) => (
                    <div key={share.vendorId || idx} className="bg-surface-container-low p-2.5 rounded-xl space-y-1">
                      <div className="font-bold text-primary text-xs flex items-center justify-between border-b border-outline-variant/20 pb-1">
                        <span>{share.vendorName}</span>
                        <span className="font-price-display">₦{share.subtotal.toLocaleString()}</span>
                      </div>
                      {share.items.map((it, iIdx) => (
                        <div key={iIdx} className="flex justify-between items-center text-[11px]">
                          <span className="text-on-surface">{it.quantity}x {it.name}</span>
                          <span className="font-price-display font-semibold text-on-surface">₦{(it.price * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                currentOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span className="text-on-surface">{it.quantity}x {it.name}</span>
                    <span className="font-price-display font-bold text-on-surface">₦{(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))
              )}

              <div className="flex justify-between items-center text-on-surface-variant text-[11px] pt-1">
                <span>Confluence Dispatch Fee:</span>
                <span className="font-price-display">₦{currentOrder.dispatchFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant text-[11px]">
                <span>Packaging Fee:</span>
                <span className="font-price-display">₦{currentOrder.packagingFee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center text-sm font-bold">
                <span>Total Amount Transferred:</span>
                <span className="font-price-display text-lg text-primary">₦{currentOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
