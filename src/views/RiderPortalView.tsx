import React, { useState, useEffect } from 'react';
import { ActiveView } from '../types';
import { orderService, LiveOrder, LOKOCHOP_SUPPORT_WHATSAPP } from '../services/orderService';
import { 
  Bike, 
  MapPin, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  ArrowRight, 
  ShieldCheck, 
  Send, 
  RefreshCw, 
  ChevronRight,
  Package,
  DollarSign,
  AlertCircle,
  Layers,
  Store
} from 'lucide-react';

interface RiderPortalViewProps {
  onNavigate: (view: ActiveView) => void;
}

const RIDER_PROFILES = [
  { id: 'rider-ibrahim', name: 'Ibrahim Sani', phone: '0805 234 8901', bike: 'Boxer 150 (Plate: KG-742-LKJ)', zone: 'Central Lokoja & Lokongoma' },
  { id: 'rider-musa', name: 'Musa Garba', phone: '0802 911 4455', bike: 'Haojue 125 (Plate: KG-109-LKJ)', zone: 'Ganaja & Felele Corridor' },
  { id: 'rider-yakubu', name: 'Yakubu Mohammed', phone: '0813 555 7788', bike: 'Bajaj Pulsar (Plate: KG-338-LKJ)', zone: 'GRA & Marine Road' }
];

export const RiderPortalView: React.FC<RiderPortalViewProps> = ({ onNavigate }) => {
  const [selectedRider, setSelectedRider] = useState(RIDER_PROFILES[0]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'pickup_queue' | 'active_runs' | 'completed'>('pickup_queue');
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [smsSentNotice, setSmsSentNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = orderService.subscribeToAllOrders((allOrders) => {
      setOrders(allOrders);
    });
    return () => unsubscribe();
  }, []);

  // Filter orders by delivery lifecycle
  const pickupQueue = orders.filter(o => 
    (o.paymentStatus === 'vendor_verified' || o.paymentStatus === 'customer_confirmed') && 
    (o.kitchenStatus === 'cooking' || o.kitchenStatus === 'packaging' || (o.kitchenStatus === 'idle' && !o.riderName))
  );

  const activeRuns = orders.filter(o => 
    o.kitchenStatus === 'dispatched' || 
    (o.riderName === selectedRider.name && o.kitchenStatus !== 'delivered')
  );

  const completedRuns = orders.filter(o => 
    o.kitchenStatus === 'delivered' || (o.riderName === selectedRider.name && o.kitchenStatus === 'delivered')
  );

  const handleAcceptRun = async (order: LiveOrder) => {
    setIsProcessingId(order.id);
    try {
      await orderService.assignRider(order.id, selectedRider.name, selectedRider.phone);
      setActiveTab('active_runs');
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleMarkPickedUp = async (orderId: string) => {
    setIsProcessingId(orderId);
    try {
      await orderService.markRiderPickedUp(orderId);
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    setIsProcessingId(orderId);
    try {
      await orderService.markRiderDelivered(orderId);
      setActiveTab('completed');
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleSendSmsAlert = async (order: LiveOrder) => {
    await orderService.dispatchSmsAlert(
      order.id,
      order.customerPhone,
      `[LokoChop]: Rider ${selectedRider.name} is approaching with your meal for #${order.id}. Please be ready at your gate!`
    );
    setSmsSentNotice(`SMS alert dispatched to ${order.customerPhone} for #${order.id}`);
    setTimeout(() => setSmsSentNotice(null), 4000);
  };

  const totalEarningsToday = completedRuns.reduce((sum, o) => sum + (o.dispatchFee || 800), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 pb-20">
      
      {/* Breadcrumb Header */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-on-surface-variant text-xs mb-2">
        <button onClick={() => onNavigate('marketplace')} className="hover:text-primary transition-colors cursor-pointer">
          Marketplace
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-primary font-bold">Confluence Express Rider Portal</span>
      </nav>

      {/* Rider Status Card */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline text-xl md:text-2xl font-bold text-on-surface">
                {selectedRider.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                {selectedRider.bike}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-2">
              <span>{selectedRider.phone}</span>
              <span>&bull;</span>
              <span>Zone: {selectedRider.zone}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Switch Active Rider Simulation */}
          <select 
            value={selectedRider.id}
            onChange={(e) => {
              const found = RIDER_PROFILES.find(r => r.id === e.target.value);
              if (found) setSelectedRider(found);
            }}
            className="text-xs bg-surface-container-high border border-outline-variant/40 rounded-xl px-3 py-2 text-on-surface focus:outline-none"
          >
            {RIDER_PROFILES.map(r => (
              <option key={r.id} value={r.id}>Shift: {r.name}</option>
            ))}
          </select>

          {/* Shift Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isOnline 
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                : 'bg-stone-500/15 text-stone-600 border border-stone-400/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
            <span>{isOnline ? 'Online on Duty' : 'On Break'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span className="text-[11px] text-on-surface-variant font-bold block uppercase tracking-wider">Ready at Kitchen</span>
          <strong className="text-2xl font-bold font-headline text-amber-600 dark:text-amber-400 mt-1 block">
            {pickupQueue.length}
          </strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span className="text-[11px] text-on-surface-variant font-bold block uppercase tracking-wider">In Transit (Active)</span>
          <strong className="text-2xl font-bold font-headline text-primary mt-1 block">
            {activeRuns.length}
          </strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span className="text-[11px] text-on-surface-variant font-bold block uppercase tracking-wider">Delivered Today</span>
          <strong className="text-2xl font-bold font-headline text-emerald-600 dark:text-emerald-400 mt-1 block">
            {completedRuns.length}
          </strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <span className="text-[11px] text-on-surface-variant font-bold block uppercase tracking-wider">Dispatch Earnings</span>
          <strong className="text-2xl font-bold font-headline text-on-surface mt-1 block">
            ₦{totalEarningsToday.toLocaleString()}
          </strong>
        </div>
      </div>

      {/* SMS Alert Toast if dispatched */}
      {smsSentNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>{smsSentNotice}</span>
          </div>
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('pickup_queue')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'pickup_queue'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Pickup Queue ({pickupQueue.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('active_runs')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'active_runs'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Active Runs ({activeRuns.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed Trips ({completedRuns.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: Pickup Queue */}
      {activeTab === 'pickup_queue' && (
        <div className="space-y-4">
          {pickupQueue.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-3">
              <Clock className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
              <h3 className="font-headline font-bold text-base text-on-surface">No Orders Waiting for Pickup</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                All kitchen orders across Lokoja have been assigned or are currently being cooked. New orders will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pickupQueue.map(order => (
                <div 
                  key={order.id} 
                  className="bg-surface-container rounded-2xl border border-outline-variant/40 p-5 space-y-4 shadow-xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-primary">#{order.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300">
                        {order.kitchenStatus === 'cooking' ? 'Cooking in Kitchen' : 'Packaging Ready'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-on-surface">
                      Fare: ₦{(order.dispatchFee || 800).toLocaleString()}
                    </span>
                  </div>

                  {/* Vendor Pickup Point(s) */}
                  {order.isMultiVendor && order.vendorShares && order.vendorShares.length > 0 ? (
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Multi-Pickup ({order.vendorShares.length} Kitchen Stops):</span>
                        </span>
                      </div>
                      <div className="space-y-2 divide-y divide-outline-variant/20 pt-1">
                        {order.vendorShares.map((share, sIdx) => (
                          <div key={share.vendorId || sIdx} className="pt-1.5 first:pt-0 space-y-1 text-xs">
                            <div className="flex items-center justify-between font-bold text-on-surface">
                              <span className="flex items-center gap-1 text-primary">
                                <Store className="w-3 h-3" />
                                <span>{sIdx + 1}. {share.vendorName}</span>
                              </span>
                              <a 
                                href={`tel:${share.vendorPhone}`} 
                                className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                              >
                                <Phone className="w-2.5 h-2.5" /> Call
                              </a>
                            </div>
                            <div className="text-[10px] text-on-surface-variant flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-outline" />
                              <span>{share.locationName || 'Lokoja Pickup'}</span>
                              {share.isSharedLocation && (
                                <span className="text-emerald-600 font-bold text-[9px]">[Shared Stop]</span>
                              )}
                            </div>
                            <div className="text-[10px] text-on-surface-variant bg-surface-container-lowest p-1.5 rounded-lg">
                              <strong className="text-on-surface">Dishes: </strong>
                              {share.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Pickup From:</span>
                      <strong className="text-sm text-on-surface block font-headline">{order.vendorName}</strong>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant">
                        <span>Hotline: {order.vendorPhone}</span>
                        <a 
                          href={`tel:${order.vendorPhone}`} 
                          className="text-primary font-bold hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call Kitchen
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Customer Drop-off Destination */}
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Deliver To:</span>
                    <div className="flex items-start gap-1.5 text-xs text-on-surface font-semibold">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{order.destination}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      Customer: {order.customerName} ({order.customerPhone})
                    </p>
                  </div>

                  {/* Items summary for single vendor */}
                  {(!order.isMultiVendor || !order.vendorShares) && (
                    <div className="text-xs text-on-surface-variant">
                      <span className="font-bold text-on-surface">Food Package: </span>
                      {order.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                    </div>
                  )}

                  {/* Accept Button */}
                  <button
                    onClick={() => handleAcceptRun(order)}
                    disabled={isProcessingId === order.id}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-transform"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{isProcessingId === order.id ? 'Assigning...' : 'Accept This Delivery Run'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Active Runs */}
      {activeTab === 'active_runs' && (
        <div className="space-y-4">
          {activeRuns.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-3">
              <Navigation className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
              <h3 className="font-headline font-bold text-base text-on-surface">No Active Runs in Transit</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Accept a delivery from the Pickup Queue to begin navigating Lokoja streets.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRuns.map(order => (
                <div 
                  key={order.id} 
                  className="bg-surface-container rounded-2xl border-2 border-primary/40 p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-primary">#{order.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                        {order.kitchenStatus === 'dispatched' ? 'On Confluence Bike' : 'Picked Up & Packaging'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Earn: ₦{(order.dispatchFee || 800).toLocaleString()}
                    </span>
                  </div>

                  {/* Destination focus */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Customer Destination</span>
                      <span className="text-[11px] font-bold text-on-surface">{order.customerName}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-on-surface font-bold">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{order.destination}</span>
                    </div>

                    {/* Quick Communication Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="flex-1 py-1.5 rounded-lg bg-surface border border-outline-variant/40 hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span>Call Customer</span>
                      </a>
                      <a
                        href={`https://wa.me/234${order.customerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello ${order.customerName}, this is Rider ${selectedRider.name} from LokoChop. I have picked up your food from ${order.vendorName} and am heading to ${order.destination}!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <button
                        onClick={() => handleSendSmsAlert(order)}
                        className="px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/40 text-on-surface text-xs font-bold flex items-center gap-1 hover:bg-surface-container"
                        title="Send SMS backup alert"
                      >
                        <Send className="w-3.5 h-3.5 text-tertiary" />
                        <span>SMS</span>
                      </button>
                    </div>
                  </div>

                  {/* Pickup Checklist */}
                  {order.isMultiVendor && order.vendorShares && order.vendorShares.length > 0 ? (
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2 text-xs">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                        Kitchen Collection Checklist ({order.vendorShares.length} Stops):
                      </span>
                      <div className="space-y-2">
                        {order.vendorShares.map((share, sIdx) => (
                          <div key={share.vendorId || sIdx} className="bg-surface-container-lowest p-2 rounded-lg space-y-1">
                            <div className="flex items-center justify-between font-bold text-on-surface">
                              <span className="flex items-center gap-1 text-primary">
                                <Store className="w-3 h-3" />
                                <span>{sIdx + 1}. {share.vendorName}</span>
                              </span>
                              <a href={`tel:${share.vendorPhone}`} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                                <Phone className="w-2.5 h-2.5" /> Call
                              </a>
                            </div>
                            <div className="text-[10px] text-on-surface-variant flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-outline" />
                              <span>{share.locationName || 'Lokoja Kitchen'}</span>
                            </div>
                            <div className="text-[11px] text-on-surface-variant">
                              <span className="font-semibold text-on-surface">Dishes: </span>
                              {share.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Pickup Kitchen:</span>
                        <a href={`tel:${order.vendorPhone}`} className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-bold">
                          <Phone className="w-2.5 h-2.5" /> Call {order.vendorName}
                        </a>
                      </div>
                      <p className="font-bold text-on-surface">{order.vendorName}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        <span className="font-semibold text-on-surface">Food: </span>
                        {order.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Stage Transition Buttons */}
                  <div className="space-y-2 pt-1">
                    {order.kitchenStatus !== 'dispatched' ? (
                      <button
                        onClick={() => handleMarkPickedUp(order.id)}
                        disabled={isProcessingId === order.id}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-transform"
                      >
                        <Bike className="w-4 h-4" />
                        <span>{isProcessingId === order.id ? 'Updating...' : 'I Have Picked Up Food from Kitchen'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkDelivered(order.id)}
                        disabled={isProcessingId === order.id}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-transform"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isProcessingId === order.id ? 'Finalizing...' : 'Mark Delivered Hot & Confirm Handover'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Completed Trips */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5 space-y-3">
            <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Completed Runs Log &amp; Payouts
            </h3>
            <p className="text-xs text-on-surface-variant">
              Rider dispatch fees are settled daily at Confluence Central Hub or directly to your bank account.
            </p>

            <div className="divide-y divide-outline-variant/20 pt-2">
              {completedRuns.map(order => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">#{order.id}</span>
                      <strong className="text-on-surface">{order.customerName}</strong>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {order.vendorName} &rarr; {order.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 text-sm block">
                      +₦{(order.dispatchFee || 800).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">Delivered</span>
                  </div>
                </div>
              ))}

              {completedRuns.length === 0 && (
                <div className="py-8 text-center text-on-surface-variant text-xs">
                  No deliveries marked complete yet today.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Safety & Hotline Footer */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Confluence Rider Safety Protocol &bull; Helmets mandatory on Ganaja &amp; Murtala Muhammed roads</span>
        </div>
        <a
          href={`https://wa.me/2349074072454?text=${encodeURIComponent(`[Rider Alert - ${selectedRider.name}]: Dispatch support assistance needed on route.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-bold hover:underline flex items-center gap-1"
        >
          <MessageCircle className="w-3.5 h-3.5 text-tertiary" />
          <span>Rider Dispatch Help (+2349074072454)</span>
        </a>
      </div>

    </div>
  );
};
