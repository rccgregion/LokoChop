import React, { useState, useMemo } from 'react';
import { ApprovedVendorAccount, CateringInquiry, CustomerReview, VendorMenuItem, VendorRemittanceRecord } from '../types';
import { INITIAL_REVIEWS, INITIAL_CATERING_INQUIRIES, INITIAL_REMITTANCES } from '../data/reviewsAndInquiries';
import { 
  UtensilsCrossed, 
  Store, 
  CreditCard, 
  Flame, 
  Bike, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight, 
  ExternalLink, 
  UserCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Star, 
  MessageSquare, 
  ShieldCheck, 
  CheckCheck, 
  Download, 
  Plus, 
  ArrowRight,
  Receipt,
  Sparkles,
  PackageCheck,
  Eye
} from 'lucide-react';

export interface AdminPipelineOrder {
  id: string;
  vendorId: string;
  customerName: string;
  customerPhone: string;
  destination: string;
  items: string;
  amount: number;
  stage: 'transfer_check' | 'cooking' | 'packaging' | 'dispatched';
  riderName?: string;
  riderBike?: string;
  orderTime: string;
  nipRef: string;
  specialNote?: string;
}

interface AdminVendorMonitorProps {
  vendors: ApprovedVendorAccount[];
  selectedVendorId: string;
  onSelectVendorId: (id: string) => void;
  onSuperviseVendor?: (vendor: ApprovedVendorAccount) => void;
}

// Initial sample orders generator across Bukas
const getInitialOrdersForVendor = (vendor: ApprovedVendorAccount): AdminPipelineOrder[] => {
  const dish1 = vendor.menuOfferings[0]?.name || 'House Special Combo';
  const dish2 = vendor.menuOfferings[1]?.name || 'Signature Pot Jollof';
  const dish3 = vendor.menuOfferings[2]?.name || 'Fried Chicken Platter';
  const price1 = vendor.menuOfferings[0]?.price || 3500;
  const price2 = vendor.menuOfferings[1]?.price || 4200;
  const price3 = vendor.menuOfferings[2]?.price || 2800;

  return [
    {
      id: `#LK-${Math.floor(5000 + Math.random() * 4000)}`,
      vendorId: vendor.id,
      customerName: 'Halimat Sani',
      customerPhone: '+2348039218491',
      destination: 'Lokongoma Phase II, near Kefas Hall',
      items: `2x ${dish1}`,
      amount: price1 * 2,
      stage: 'transfer_check',
      orderTime: '6 mins ago',
      nipRef: `NIP-LKJ-${Math.floor(100000 + Math.random() * 900000)}`,
      specialNote: 'Extra hot pepper, verify credit to vendor bank'
    },
    {
      id: `#LK-${Math.floor(5000 + Math.random() * 4000)}`,
      vendorId: vendor.id,
      customerName: 'Ibrahim Danladi',
      customerPhone: '+2347039481102',
      destination: 'Ganaja Junction Axis, Rianzo Plaza',
      items: `1x ${dish2} + 1x ${dish3}`,
      amount: price2 + price3,
      stage: 'cooking',
      orderTime: '18 mins ago',
      nipRef: `NIP-LKJ-${Math.floor(100000 + Math.random() * 900000)}`,
      specialNote: 'In fireplace • 10 mins prep remaining'
    },
    {
      id: `#LK-${Math.floor(5000 + Math.random() * 4000)}`,
      vendorId: vendor.id,
      customerName: 'Fatima Abubakar',
      customerPhone: '+2348123991204',
      destination: 'Zone 8 Secretariat Complex, Lokoja',
      items: `1x ${dish1}`,
      amount: price1,
      stage: 'packaging',
      orderTime: '28 mins ago',
      nipRef: `NIP-LKJ-${Math.floor(100000 + Math.random() * 900000)}`,
      specialNote: 'Packed in insulated thermal box • Awaiting Confluence Okada rider'
    },
    {
      id: `#LK-${Math.floor(5000 + Math.random() * 4000)}`,
      vendorId: vendor.id,
      customerName: 'David Oche',
      customerPhone: '+2349038291044',
      destination: 'Hospital Road, GRA Lokoja',
      items: `2x ${dish3}`,
      amount: price3 * 2,
      stage: 'dispatched',
      riderName: 'Musa Haruna',
      riderBike: 'Confluence Okada #LKJ-482-KG',
      orderTime: '38 mins ago',
      nipRef: `NIP-LKJ-${Math.floor(100000 + Math.random() * 900000)}`,
      specialNote: 'En route with rider • 5 mins to delivery'
    }
  ];
};

export const AdminVendorMonitor: React.FC<AdminVendorMonitorProps> = ({
  vendors,
  selectedVendorId,
  onSelectVendorId,
  onSuperviseVendor
}) => {
  // Search and category filter for vendor selector
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorCategory, setVendorCategory] = useState('All');

  // Subtabs within the vendor monitor view
  const [monitorTab, setMonitorTab] = useState<'pipeline' | 'menu' | 'remittance' | 'catering' | 'reviews'>('pipeline');

  // Live kitchen open/paused status overrides
  const [kitchenStatuses, setKitchenStatuses] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    vendors.forEach(v => {
      init[v.id] = true;
    });
    return init;
  });

  // Pipeline orders per vendor
  const [allVendorOrders, setAllVendorOrders] = useState<Record<string, AdminPipelineOrder[]>>(() => {
    const init: Record<string, AdminPipelineOrder[]> = {};
    vendors.forEach(v => {
      init[v.id] = getInitialOrdersForVendor(v);
    });
    return init;
  });

  // Menu items in-stock status overrides
  const [menuStockOverrides, setMenuStockOverrides] = useState<Record<string, boolean>>({});

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Currently selected vendor
  const currentVendor = useMemo(() => {
    return vendors.find(v => v.id === selectedVendorId) || vendors[0];
  }, [vendors, selectedVendorId]);

  // Orders for current vendor
  const currentOrders = useMemo(() => {
    return allVendorOrders[currentVendor.id] || [];
  }, [allVendorOrders, currentVendor.id]);

  // Stage orders breakdown
  const ordersStage1 = useMemo(() => currentOrders.filter(o => o.stage === 'transfer_check'), [currentOrders]);
  const ordersStage2 = useMemo(() => currentOrders.filter(o => o.stage === 'cooking'), [currentOrders]);
  const ordersStage3 = useMemo(() => currentOrders.filter(o => o.stage === 'packaging'), [currentOrders]);
  const ordersStage4 = useMemo(() => currentOrders.filter(o => o.stage === 'dispatched'), [currentOrders]);

  // Filtered vendors for selector bar
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchQuery = 
        v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.address.toLowerCase().includes(vendorSearch.toLowerCase());
      const matchCat = vendorCategory === 'All' || v.category.toLowerCase().includes(vendorCategory.toLowerCase());
      return matchQuery && matchCat;
    });
  }, [vendors, vendorSearch, vendorCategory]);

  // Catering inquiries for this vendor
  const vendorInquiries = useMemo(() => {
    return INITIAL_CATERING_INQUIRIES.filter(i => 
      i.vendorName.toLowerCase().includes(currentVendor.name.toLowerCase()) ||
      currentVendor.name.toLowerCase().includes(i.vendorName.toLowerCase()) ||
      currentVendor.id === 'vendor-cr'
    );
  }, [currentVendor]);

  // Reviews for this vendor
  const vendorReviews = useMemo(() => {
    return INITIAL_REVIEWS.filter(r => 
      r.vendorName.toLowerCase().includes(currentVendor.name.toLowerCase()) ||
      currentVendor.name.toLowerCase().includes(r.vendorName.toLowerCase()) ||
      currentVendor.id === 'vendor-cr'
    );
  }, [currentVendor]);

  // Remittance records for this vendor
  const vendorRemittances = useMemo(() => {
    return INITIAL_REMITTANCES.filter(r => 
      r.vendorName.toLowerCase().includes(currentVendor.name.toLowerCase()) ||
      currentVendor.name.toLowerCase().includes(r.vendorName.toLowerCase()) ||
      currentVendor.id === 'vendor-cr'
    );
  }, [currentVendor]);

  // Toggle Kitchen Live / Orders Paused
  const handleToggleKitchen = () => {
    setKitchenStatuses(prev => {
      const current = prev[currentVendor.id] ?? true;
      const next = !current;
      showToast(`${currentVendor.name} kitchen is now ${next ? 'ONLINE (Orders Active)' : 'PAUSED (Orders On Hold)'}`);
      return { ...prev, [currentVendor.id]: next };
    });
  };

  // Advance Order Pipeline Stage
  const handleAdvanceOrder = (orderId: string) => {
    setAllVendorOrders(prev => {
      const list = prev[currentVendor.id] || [];
      const updated = list.map(o => {
        if (o.id !== orderId) return o;
        if (o.stage === 'transfer_check') {
          showToast(`Order ${o.id}: Bank transfer verified! Advanced to Cooking Fireplace.`);
          return { ...o, stage: 'cooking' as const, specialNote: 'Payment verified • Cooking underway' };
        }
        if (o.stage === 'cooking') {
          showToast(`Order ${o.id}: Cooking complete! Moved to Food Warmer & Packaging.`);
          return { ...o, stage: 'packaging' as const, specialNote: 'Food boxed & insulated • Awaiting dispatch rider' };
        }
        if (o.stage === 'packaging') {
          showToast(`Order ${o.id}: Dispatched with Confluence rider Musa Haruna (#LKJ-482-KG)!`);
          return { 
            ...o, 
            stage: 'dispatched' as const, 
            riderName: 'Musa Haruna', 
            riderBike: 'Confluence Okada #LKJ-482-KG',
            specialNote: 'En route with rider'
          };
        }
        if (o.stage === 'dispatched') {
          showToast(`Order ${o.id}: Marked as successfully delivered to ${o.customerName}!`);
          return { ...o, specialNote: 'Delivered successfully • Order completed' };
        }
        return o;
      });
      return { ...prev, [currentVendor.id]: updated };
    });
  };

  // Toggle Dish In-Stock Status
  const handleToggleDishStock = (dishId: string, currentStock: boolean) => {
    const key = `${currentVendor.id}-${dishId}`;
    setMenuStockOverrides(prev => {
      const currentVal = prev[key] ?? currentStock;
      const nextVal = !currentVal;
      showToast(`Item marked ${nextVal ? 'IN STOCK' : 'OUT OF STOCK'} for ${currentVendor.name}`);
      return { ...prev, [key]: nextVal };
    });
  };

  const isDishInStock = (dish: VendorMenuItem) => {
    const key = `${currentVendor.id}-${dish.id}`;
    if (menuStockOverrides[key] !== undefined) {
      return menuStockOverrides[key];
    }
    return dish.inStock;
  };

  const isKitchenLive = kitchenStatuses[currentVendor.id] ?? true;
  const grossSales = currentVendor.dailyGrossGMV || 64000;
  const commissionRate = currentVendor.commissionRate || 8.0;
  const platformShare = Math.round(grossSales * (commissionRate / 100));

  // Network overall stats
  const totalOpenKitchens = useMemo(() => {
    return vendors.filter(v => kitchenStatuses[v.id] ?? true).length;
  }, [vendors, kitchenStatuses]);

  const totalActivePipelineOrders = useMemo(() => {
    return (Object.values(allVendorOrders) as AdminPipelineOrder[][]).reduce((acc: number, orders: AdminPipelineOrder[]) => {
      return acc + orders.filter(o => o.stage !== 'dispatched' || o.specialNote?.includes('En route')).length;
    }, 0);
  }, [allVendorOrders]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-amber-500/50">
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Overview Metric Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
          <span className="text-[11px] text-on-surface-variant font-medium">Active Kitchens Operating</span>
          <div className="font-price-display text-2xl font-bold text-emerald-700 flex items-center gap-2">
            <span>{totalOpenKitchens} / {vendors.length}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% of network receiving orders</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
          <span className="text-[11px] text-on-surface-variant font-medium">Orders Currently in Prep/Transit</span>
          <div className="font-price-display text-2xl font-bold text-primary">
            {totalActivePipelineOrders} Orders
          </div>
          <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Synchronized across all 14 Bukas
          </span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
          <span className="text-[11px] text-on-surface-variant font-medium">Selected Kitchen Daily GMV</span>
          <div className="font-price-display text-2xl font-bold text-on-surface">
            ₦{grossSales.toLocaleString()}
          </div>
          <span className="text-[11px] text-on-surface-variant">
            Direct NUBAN to {currentVendor.bankDetails.bankName}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
          <span className="text-[11px] text-on-surface-variant font-medium">Platform Share Accrued ({commissionRate}%)</span>
          <div className="font-price-display text-2xl font-bold text-amber-700">
            ₦{platformShare.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
            Corporate Escrow settlement due
          </span>
        </div>
      </div>

      {/* Vendor Selector & Quick Switcher Strip */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <span>Select Partner Buka / Kitchen to Monitor</span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              Click any of the 14 verified kitchens below to view its live pipeline, active orders, stock, and bank remittances.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={vendorSearch}
                onChange={e => setVendorSearch(e.target.value)}
                placeholder="Find vendor name..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            
            <select
              value={vendorCategory}
              onChange={e => setVendorCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface font-medium focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Fast Food">Fast Food</option>
              <option value="Nigerian Restaurant">Nigerian Restaurant</option>
              <option value="Bakery">Bakery</option>
              <option value="Cafe">Cafe</option>
            </select>
          </div>
        </div>

        {/* Vendor Selector Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {filteredVendors.map(vendor => {
            const isSelected = vendor.id === currentVendor.id;
            const live = kitchenStatuses[vendor.id] ?? true;
            const ordersCount = (allVendorOrders[vendor.id] || []).length;

            return (
              <button
                key={vendor.id}
                onClick={() => onSelectVendorId(vendor.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20 scale-[1.02]'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant/30'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className={`w-8 h-8 rounded-xl ${vendor.logo.bg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                    {vendor.logo.initials}
                  </div>
                  <span className={`w-2 h-2 rounded-full ${live ? 'bg-emerald-400' : 'bg-rose-400'}`} title={live ? 'Kitchen Orders Active' : 'Orders Paused'} />
                </div>

                <div>
                  <h4 className="font-bold text-xs line-clamp-1">{vendor.name}</h4>
                  <div className={`text-[10px] flex items-center justify-between mt-0.5 ${isSelected ? 'text-white/80' : 'text-on-surface-variant'}`}>
                    <span>{vendor.tier}</span>
                    <span className="font-semibold">{ordersCount} orders</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Vendor Dashboard Telemetry Container */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 shadow-xs space-y-6">
        
        {/* Selected Vendor Master Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl ${currentVendor.logo.bg} text-white font-headline font-bold text-2xl flex items-center justify-center shadow-xs shrink-0`}>
              {currentVendor.logo.initials}
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-headline text-xl md:text-2xl font-bold text-on-surface">
                  {currentVendor.name}
                </h2>

                {isKitchenLive ? (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Orders Active
                  </span>
                ) : (
                  <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Orders Paused
                  </span>
                )}

                <span className="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-2 py-0.5 rounded-md">
                  {currentVendor.category} &bull; {currentVendor.tier}
                </span>
              </div>

              <p className="text-xs text-on-surface-variant flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>Manager:</strong> {currentVendor.ownerName} ({currentVendor.phone})
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  {currentVendor.address}
                </span>
              </p>
            </div>
          </div>

          {/* Admin Control Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Toggle Kitchen Live/Paused */}
            <button
              onClick={handleToggleKitchen}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isKitchenLive 
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isKitchenLive ? (
                <>
                  <ToggleRight className="w-4 h-4 text-amber-700" />
                  <span>Pause Kitchen Orders</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-white" />
                  <span>Resume Live Orders</span>
                </>
              )}
            </button>

            {/* Launch Full Supervisory Terminal */}
            {onSuperviseVendor && (
              <button
                onClick={() => onSuperviseVendor(currentVendor)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="Open full interactive Vendor Hub for this kitchen"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch Full Hub (Supervisor Mode)</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs inside Selected Vendor Monitor */}
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2 overflow-x-auto text-xs">
          <button
            onClick={() => setMonitorTab('pipeline')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              monitorTab === 'pipeline'
                ? 'bg-secondary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>4-Stage Order Pipeline</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {currentOrders.length}
            </span>
          </button>

          <button
            onClick={() => setMonitorTab('menu')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              monitorTab === 'menu'
                ? 'bg-secondary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Live Menu &amp; Stock</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {currentVendor.menuOfferings.length}
            </span>
          </button>

          <button
            onClick={() => setMonitorTab('remittance')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              monitorTab === 'remittance'
                ? 'bg-secondary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>App Share Remittances</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px]">
              ₦{platformShare.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => setMonitorTab('catering')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              monitorTab === 'catering'
                ? 'bg-secondary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Bulk / Catering Inquiries</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
              {vendorInquiries.length}
            </span>
          </button>

          <button
            onClick={() => setMonitorTab('reviews')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              monitorTab === 'reviews'
                ? 'bg-secondary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Customer Reviews &amp; Ratings</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {vendorReviews.length}
            </span>
          </button>
        </div>

        {/* SUBTAB 1: 4-STAGE KITCHEN ORDER PIPELINE */}
        {monitorTab === 'pipeline' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span>Live 4-Stage Kitchen Pipeline ({currentVendor.name})</span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Telemetry
                  </span>
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Supervise incoming orders, confirm bank transfers, check cooking stages, and track dispatch riders.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* STAGE 1: TRANSFER VERIFICATION */}
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <span className="font-headline text-xs font-bold text-primary flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> 1. Transfer Verification
                  </span>
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                    {ordersStage1.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {ordersStage1.map(order => (
                    <div key={order.id} className="bg-surface-container-lowest p-3 rounded-xl border border-primary/30 shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary">{order.id}</span>
                        <span className="font-price-display font-bold text-primary">₦{order.amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{order.customerName}</p>
                        <p className="text-[11px] text-on-surface-variant">{order.items}</p>
                        <p className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-700" /> {order.destination}
                        </p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-surface-container text-[10px] text-on-surface-variant font-mono">
                        NIP: {order.nipRef} &bull; {currentVendor.bankDetails.bankName}
                      </div>
                      <button
                        onClick={() => handleAdvanceOrder(order.id)}
                        className="w-full py-1.5 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Credit Received</span>
                      </button>
                    </div>
                  ))}
                  {ordersStage1.length === 0 && (
                    <div className="text-center py-6 text-on-surface-variant text-xs">
                      All transfers verified!
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE 2: KITCHEN FIREPLACE */}
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <span className="font-headline text-xs font-bold text-amber-700 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> 2. Kitchen Fireplace
                  </span>
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {ordersStage2.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {ordersStage2.map(order => (
                    <div key={order.id} className="bg-surface-container-lowest p-3 rounded-xl border border-amber-500/30 shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-800">{order.id}</span>
                        <span className="font-price-display font-bold text-on-surface">₦{order.amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{order.customerName}</p>
                        <p className="text-[11px] text-on-surface-variant">{order.items}</p>
                        <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                          {order.specialNote}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdvanceOrder(order.id)}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Move to Food Warmer</span>
                      </button>
                    </div>
                  ))}
                  {ordersStage2.length === 0 && (
                    <div className="text-center py-6 text-on-surface-variant text-xs">
                      Fireplace currently clear
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE 3: FOOD WARMER & PACKAGING */}
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <span className="font-headline text-xs font-bold text-secondary flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5" /> 3. Warmer &amp; Packing
                  </span>
                  <span className="w-5 h-5 rounded-full bg-secondary text-white text-[11px] font-bold flex items-center justify-center">
                    {ordersStage3.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {ordersStage3.map(order => (
                    <div key={order.id} className="bg-surface-container-lowest p-3 rounded-xl border border-secondary/30 shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-secondary">{order.id}</span>
                        <span className="font-price-display font-bold text-on-surface">₦{order.amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{order.customerName}</p>
                        <p className="text-[11px] text-on-surface-variant">{order.items}</p>
                        <span className="text-[10px] text-secondary font-semibold block mt-0.5">
                          {order.specialNote}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdvanceOrder(order.id)}
                        className="w-full py-1.5 bg-secondary hover:bg-secondary/90 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Assign Okada Rider</span>
                      </button>
                    </div>
                  ))}
                  {ordersStage3.length === 0 && (
                    <div className="text-center py-6 text-on-surface-variant text-xs">
                      No orders awaiting packing
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE 4: CONFLUENCE OKADA DISPATCH */}
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <span className="font-headline text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5" /> 4. En Route / Rider
                  </span>
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {ordersStage4.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {ordersStage4.map(order => (
                    <div key={order.id} className="bg-surface-container-lowest p-3 rounded-xl border border-emerald-500/30 shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-700">{order.id}</span>
                        <span className="font-price-display font-bold text-on-surface">₦{order.amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{order.customerName}</p>
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-[10px] text-emerald-900 font-semibold space-y-0.5 mt-1 border border-emerald-200">
                          <p>Rider: {order.riderName || 'Musa Haruna'}</p>
                          <p className="font-mono">{order.riderBike || 'Confluence #LKJ-482-KG'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAdvanceOrder(order.id)}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Confirm Delivery</span>
                      </button>
                    </div>
                  ))}
                  {ordersStage4.length === 0 && (
                    <div className="text-center py-6 text-on-surface-variant text-xs">
                      No active dispatches
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 2: LIVE MENU & STOCK CONTROL */}
        {monitorTab === 'menu' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-on-surface">
                  Live Menu Offerings &amp; Stock Availability ({currentVendor.menuOfferings.length} Dishes)
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Toggle items in or out of stock in real-time if the kitchen runs out of ingredients.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentVendor.menuOfferings.map(dish => {
                const inStock = isDishInStock(dish);
                return (
                  <div 
                    key={dish.id} 
                    className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">{dish.name}</span>
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.2 rounded">
                          {dish.category}
                        </span>
                      </div>
                      <div className="font-price-display font-bold text-primary text-sm">
                        ₦{dish.price.toLocaleString()}
                      </div>
                      {dish.description && (
                        <p className="text-[11px] text-on-surface-variant line-clamp-1">{dish.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleDishStock(dish.id, dish.inStock)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        inStock
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {inStock ? 'In Stock' : 'Sold Out'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 3: APP SHARE REMITTANCE & FINANCIAL TELEMETRY */}
        {monitorTab === 'remittance' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">
                    Direct Bank Remittance &amp; App Share Governance
                  </h4>
                  <p className="text-on-surface-variant">
                    Diners transfer 100% directly to {currentVendor.bankDetails.bankName} (#{currentVendor.bankDetails.accountNumber}). The vendor remits the {commissionRate}% platform share.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">
                  Settlement Account Verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 space-y-1">
                  <span className="text-[11px] text-on-surface-variant font-medium">Customer Gross Collected</span>
                  <div className="font-price-display font-bold text-base text-on-surface">
                    ₦{grossSales.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600 block">Credited to vendor bank</span>
                </div>

                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 space-y-1">
                  <span className="text-[11px] text-on-surface-variant font-medium">LokoChop App Share ({commissionRate}%)</span>
                  <div className="font-price-display font-bold text-base text-primary">
                    ₦{platformShare.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-on-surface-variant block">Accrued platform commission</span>
                </div>

                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 space-y-1">
                  <span className="text-[11px] text-on-surface-variant font-medium">Settlement Status</span>
                  <div className="font-bold text-sm text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Cleared / Standing Ok
                  </div>
                  <span className="text-[10px] text-on-surface-variant block">Weekly reconciliation cycle</span>
                </div>
              </div>
            </div>

            {/* Historical Remittances Table */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-on-surface">Historical Remittance Clearance Records</h5>
              <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-on-surface-variant text-[11px]">
                    <tr>
                      <th className="p-2.5">Reference</th>
                      <th className="p-2.5">Period</th>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15">
                    {vendorRemittances.map(rem => (
                      <tr key={rem.id} className="hover:bg-surface-container-low/40">
                        <td className="p-2.5 font-mono font-bold text-primary">{rem.reference}</td>
                        <td className="p-2.5">{rem.accruedPeriod}</td>
                        <td className="p-2.5 text-on-surface-variant">{rem.paymentMethod}</td>
                        <td className="p-2.5 font-bold">₦{rem.amount.toLocaleString()}</td>
                        <td className="p-2.5">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {rem.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-on-surface-variant">{rem.date}</td>
                      </tr>
                    ))}
                    {vendorRemittances.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-on-surface-variant">
                          No past remittances logged for this cycle.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: BULK CATERING INQUIRIES */}
        {monitorTab === 'catering' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-on-surface">
                  Bulk Orders &amp; Event Inquiries ({vendorInquiries.length} Requests)
                </h4>
                <p className="text-on-surface-variant">
                  High-volume requests for wedding receptions, ministerial workshops, and private celebrations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vendorInquiries.map(inq => (
                <div key={inq.id} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-primary font-bold">{inq.id}</span>
                      <h5 className="font-bold text-sm text-on-surface">{inq.customerName}</h5>
                      <p className="text-on-surface-variant">{inq.eventType} &bull; {inq.guestCount} Guests</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      {inq.status}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-surface-container-lowest text-[11px] space-y-1">
                    <p><strong>Venue:</strong> {inq.deliveryVenue}</p>
                    <p><strong>Date:</strong> {inq.eventDate} ({inq.eventTime})</p>
                    <p><strong>Menu:</strong> {inq.menuPreferences}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-emerald-700 text-xs">
                      Budget: ₦{(inq.estimatedBudget || 150000).toLocaleString()}
                    </span>
                    <a
                      href={`https://wa.me/${inq.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp Client</span>
                    </a>
                  </div>
                </div>
              ))}
              {vendorInquiries.length === 0 && (
                <div className="col-span-2 text-center py-8 text-on-surface-variant">
                  No bulk catering inquiries logged for this kitchen yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 5: CUSTOMER REVIEWS */}
        {monitorTab === 'reviews' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-on-surface">
                  Customer Ratings &amp; Reviews ({vendorReviews.length} Reviews)
                </h4>
                <p className="text-on-surface-variant">
                  Real feedback and star ratings submitted by verified diners across Lokoja.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {vendorReviews.map(rev => (
                <div key={rev.id} className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{rev.customerName}</span>
                      <span className="text-[10px] text-on-surface-variant">({rev.customerLocation})</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-on-surface-variant italic">"{rev.reviewText}"</p>
                  <div className="text-[10px] text-on-surface-variant flex items-center justify-between pt-1 border-t border-outline-variant/15">
                    <span>Dish: <strong>{rev.foodItemName}</strong></span>
                    <span>{rev.date}</span>
                  </div>
                </div>
              ))}
              {vendorReviews.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant">
                  No diner reviews logged for this vendor yet.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
