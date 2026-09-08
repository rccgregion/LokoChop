import React, { useState, useMemo, useEffect } from 'react';
import { ActiveView, VendorUser, VendorMenuItem, VendorRemittanceRecord, CateringInquiry, VendorAddOn } from '../types';
import { APPROVED_LOKOJA_VENDORS } from '../data/approvedVendors';
import { INITIAL_REMITTANCES, INITIAL_CATERING_INQUIRIES } from '../data/reviewsAndInquiries';
import { VendorRemittanceModal } from '../components/VendorRemittanceModal';
import { CustomerReviews } from '../components/CustomerReviews';
import { orderService, LiveOrder } from '../services/orderService';
import { VendorConfirmPaymentModal } from '../components/VendorConfirmPaymentModal';
import { VendorAnalyticsDashboard } from '../components/VendorAnalyticsDashboard';
import { VendorAddOnsManager } from '../components/VendorAddOnsManager';
import { getVendorAddOns, saveVendorAddOns } from '../services/addOnsService';
import { 
  Store, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Bike, 
  DollarSign, 
  TrendingUp, 
  Bell, 
  Check, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight, 
  Download, 
  Filter, 
  ExternalLink,
  LogOut,
  UserCheck,
  Edit3,
  Plus,
  Trash2,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  UtensilsCrossed,
  Sparkles,
  RefreshCw,
  CheckCheck,
  Receipt,
  Users,
  Star,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  ArrowLeft,
  Send,
  Radio,
  Timer
} from 'lucide-react';
import { 
  getCurrentAndNextStockSlot, 
  STOCK_NOTIFICATION_SLOTS, 
  buildVendorStockPromptWhatsAppUrl, 
  buildVendorStockConfirmationToSupportUrl, 
  recordVendorStockConfirmation, 
  getVendorLastConfirmedTimes,
  setDishStockStatus 
} from '../services/vendorStockService';

interface VendorHubViewProps {
  onNavigate: (view: ActiveView) => void;
  vendorUser?: VendorUser | null;
  onLogout?: () => void;
  onUpdateVendorUser?: (user: VendorUser) => void;
  isAdminSupervising?: boolean;
  onExitSupervision?: () => void;
}

export const VendorHubView: React.FC<VendorHubViewProps> = ({ 
  onNavigate, 
  vendorUser, 
  onLogout,
  onUpdateVendorUser,
  isAdminSupervising,
  onExitSupervision
}) => {
  // Find matching approved vendor definition to hydrate default menu if needed
  const matchedApprovedVendor = useMemo(() => {
    if (!vendorUser) return APPROVED_LOKOJA_VENDORS[0];
    return (
      APPROVED_LOKOJA_VENDORS.find(
        v => v.vendorId === vendorUser.vendorId || 
             v.email.toLowerCase() === vendorUser.email.toLowerCase() ||
             v.id === vendorUser.id
      ) || APPROVED_LOKOJA_VENDORS[0]
    );
  }, [vendorUser]);

  // Local state for vendor profile & settings
  const [profile, setProfile] = useState<VendorUser>(() => {
    if (vendorUser) {
      return {
        ...vendorUser,
        menuItems: vendorUser.menuItems && vendorUser.menuItems.length > 0 
          ? vendorUser.menuItems 
          : matchedApprovedVendor.menuOfferings,
        isKitchenLive: vendorUser.isKitchenLive ?? true,
        prepTimeMins: vendorUser.prepTimeMins ?? 20,
        commissionRate: vendorUser.commissionRate ?? matchedApprovedVendor.commissionRate,
      };
    }
    return {
      id: matchedApprovedVendor.id,
      vendorId: matchedApprovedVendor.vendorId,
      vendorName: matchedApprovedVendor.name,
      ownerName: matchedApprovedVendor.ownerName,
      phone: matchedApprovedVendor.phone,
      email: matchedApprovedVendor.email,
      bankName: matchedApprovedVendor.bankDetails.bankName,
      accountNumber: matchedApprovedVendor.bankDetails.accountNumber,
      accountName: matchedApprovedVendor.bankDetails.accountName,
      landmark: matchedApprovedVendor.address,
      tier: matchedApprovedVendor.tier,
      category: matchedApprovedVendor.category,
      avatarColor: matchedApprovedVendor.logo.bg,
      logoInitials: matchedApprovedVendor.logo.initials,
      lastLogin: 'Today, Just now',
      isKitchenLive: true,
      prepTimeMins: 20,
      commissionRate: matchedApprovedVendor.commissionRate,
      menuItems: [...matchedApprovedVendor.menuOfferings],
    };
  });

  // Modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [editingPriceItem, setEditingPriceItem] = useState<VendorMenuItem | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<string>('');

  // Form states for profile editing
  const [editForm, setEditForm] = useState({
    vendorName: profile.vendorName,
    ownerName: profile.ownerName,
    phone: profile.phone,
    email: profile.email,
    landmark: profile.landmark,
    bankName: profile.bankName,
    accountNumber: profile.accountNumber,
    accountName: profile.accountName,
  });

  // Form states for adding dish
  const [newDishForm, setNewDishForm] = useState<{
    name: string;
    category: 'food' | 'drink' | 'confectionery';
    price: string;
    description: string;
  }>({
    name: '',
    category: 'food',
    price: '',
    description: '',
  });

  // Filter state for menu items
  const [menuFilter, setMenuFilter] = useState<'all' | 'food' | 'drink' | 'confectionery'>('all');

  // Pipeline state for this kitchen
  const [pipelineState, setPipelineState] = useState({
    pendingTransferConfirmed: false,
    orderPackedAndDispatched: false,
  });

  // Real-time Cloud Firestore live orders
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [selectedOrderForConfirmation, setSelectedOrderForConfirmation] = useState<LiveOrder | null>(null);
  const [isConfirmPaymentModalOpen, setIsConfirmPaymentModalOpen] = useState(false);

  // 2-Hourly Stock Verification Schedule State (10am, 12pm, 2pm, 4pm, 6pm, 8pm)
  const [stockInfo, setStockInfo] = useState(() => getCurrentAndNextStockSlot());
  const [confirmedSlots, setConfirmedSlots] = useState<Record<string, string>>(() => getVendorLastConfirmedTimes());

  useEffect(() => {
    const timer = setInterval(() => {
      setStockInfo(getCurrentAndNextStockSlot());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirmStockSlot = (slotTime: string) => {
    recordVendorStockConfirmation(profile.vendorId, slotTime);
    setConfirmedSlots(getVendorLastConfirmedTimes());
    showToast(`Stock verified for ${slotTime} slot! Central Dispatch notified.`);
  };

  const handleBulkSetAllStock = (inStock: boolean) => {
    const updatedItems = (profile.menuItems || []).map(item => {
      setDishStockStatus(item.id, inStock);
      return { ...item, inStock };
    });
    const updated: VendorUser = { ...profile, menuItems: updatedItems };
    setProfile(updated);
    if (onUpdateVendorUser) {
      onUpdateVendorUser(updated);
    }
    showToast(`All ${updatedItems.length} dishes marked as ${inStock ? 'IN STOCK (Pots Warm)' : 'SOLD OUT'}.`);
  };

  useEffect(() => {
    const unsub = orderService.subscribeToVendorOrders(profile.vendorName || profile.vendorId, (orders) => {
      setLiveOrders(orders);
    });
    return () => unsub();
  }, [profile.vendorName, profile.vendorId]);

  // Hub Active Navigation Tab
  const [activeHubTab, setActiveHubTab] = useState<'pipeline' | 'analytics' | 'menu' | 'addons' | 'remittances' | 'catering' | 'reviews'>('pipeline');

  // Vendor Add-Ons & Pricing state
  const [vendorAddOns, setVendorAddOns] = useState<VendorAddOn[]>(() => getVendorAddOns(profile.vendorId));

  const handleToggleAddOnAvailability = (id: string) => {
    const updated = vendorAddOns.map(a => a.id === id ? { ...a, available: !a.available } : a);
    setVendorAddOns(updated);
    saveVendorAddOns(profile.vendorId, updated);
    showToast(`Add-on availability updated.`);
  };

  const handleUpdateAddOnPrice = (id: string, newPrice: number) => {
    const updated = vendorAddOns.map(a => a.id === id ? { ...a, price: newPrice } : a);
    setVendorAddOns(updated);
    saveVendorAddOns(profile.vendorId, updated);
    showToast(`Add-on price updated to ₦${newPrice.toLocaleString()}! Synced to customer cart.`);
  };

  const handleAddCustomAddOn = (newAddOn: Omit<VendorAddOn, 'id'>) => {
    const created: VendorAddOn = {
      ...newAddOn,
      id: `custom-${Date.now()}`
    };
    const updated = [created, ...vendorAddOns];
    setVendorAddOns(updated);
    saveVendorAddOns(profile.vendorId, updated);
    showToast(`Custom add-on "${newAddOn.name}" added to cart offerings!`);
  };

  const handleDeleteCustomAddOn = (id: string) => {
    const updated = vendorAddOns.filter(a => a.id !== id);
    setVendorAddOns(updated);
    saveVendorAddOns(profile.vendorId, updated);
    showToast(`Add-on removed.`);
  };

  // Vendor Remittance State
  const [isRemittanceModalOpen, setIsRemittanceModalOpen] = useState(false);
  const [remittanceRecords, setRemittanceRecords] = useState<VendorRemittanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('lokochop_vendor_remittances');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_REMITTANCES.filter(r => 
      r.vendorName.toLowerCase() === profile.vendorName.toLowerCase() || 
      r.vendorId === profile.vendorId ||
      profile.vendorName.includes('Mama Ngozi')
    );
  });

  const commissionRatePercent = profile.commissionRate ?? 8.0;
  const initialPlatformFee = Math.round((matchedApprovedVendor.dailyGrossGMV || 64000) * (commissionRatePercent / 100));

  const [outstandingRemittance, setOutstandingRemittance] = useState<number>(initialPlatformFee);

  // Catering Inquiries State
  const [cateringInquiries, setCateringInquiries] = useState<CateringInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('lokochop_catering_inquiries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CATERING_INQUIRIES.filter(i => 
      i.vendorName.toLowerCase() === profile.vendorName.toLowerCase() || 
      i.vendorId === profile.vendorId ||
      profile.vendorName.includes('Mama Ngozi')
    );
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleRemittanceSuccess = (newRecord: VendorRemittanceRecord) => {
    setRemittanceRecords(prev => [newRecord, ...prev]);
    setOutstandingRemittance(0);
    showToast(`Remittance ${newRecord.reference} of ₦${newRecord.amount.toLocaleString()} logged! Platform share marked as settled.`);
  };

  const handleUpdateInquiryStatus = (inquiryId: string, status: CateringInquiry['status']) => {
    const updated = cateringInquiries.map(inq => inq.id === inquiryId ? { ...inq, status } : inq);
    setCateringInquiries(updated);
    try {
      localStorage.setItem('lokochop_catering_inquiries', JSON.stringify(updated));
    } catch {}
    showToast(`Inquiry #${inquiryId} updated to "${status}".`);
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: VendorUser = {
      ...profile,
      vendorName: editForm.vendorName.trim() || profile.vendorName,
      ownerName: editForm.ownerName.trim() || profile.ownerName,
      phone: editForm.phone.trim() || profile.phone,
      email: editForm.email.trim() || profile.email,
      landmark: editForm.landmark.trim() || profile.landmark,
      bankName: editForm.bankName.trim() || profile.bankName,
      accountNumber: editForm.accountNumber.trim() || profile.accountNumber,
      accountName: editForm.accountName.trim() || profile.accountName,
    };
    setProfile(updated);
    if (onUpdateVendorUser) {
      onUpdateVendorUser(updated);
    }
    setIsEditProfileOpen(false);
    showToast('Kitchen Profile & Bank Settlement details updated successfully!');
  };

  // Toggle Kitchen Live status
  const handleToggleKitchenStatus = () => {
    const updated: VendorUser = {
      ...profile,
      isKitchenLive: !profile.isKitchenLive,
    };
    setProfile(updated);
    if (onUpdateVendorUser) {
      onUpdateVendorUser(updated);
    }
    showToast(
      updated.isKitchenLive 
        ? 'Kitchen status: LIVE. Accepting customer orders across Lokoja!' 
        : 'Kitchen paused. Customer checkout temporarily placed on hold.'
    );
  };

  // Toggle Stock for a dish
  const handleToggleItemStock = (itemId: string) => {
    const target = (profile.menuItems || []).find(i => i.id === itemId);
    const nextStock = target ? !target.inStock : true;
    setDishStockStatus(itemId, nextStock);

    const updatedItems = (profile.menuItems || []).map(item => {
      if (item.id === itemId) {
        return { ...item, inStock: nextStock };
      }
      return item;
    });
    const updated: VendorUser = { ...profile, menuItems: updatedItems };
    setProfile(updated);
    if (onUpdateVendorUser) {
      onUpdateVendorUser(updated);
    }
    showToast(`${target?.name}: Status changed to ${nextStock ? 'IN STOCK' : 'SOLD OUT'}`);
  };

  // Update Price of an item
  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceItem) return;
    const numPrice = parseInt(newPriceValue, 10);
    if (isNaN(numPrice) || numPrice < 100) {
      showToast('Please enter a valid price (min ₦100)');
      return;
    }
    const updatedItems = (profile.menuItems || []).map(item => {
      if (item.id === editingPriceItem.id) {
        return { ...item, price: numPrice };
      }
      return item;
    });
    const updated: VendorUser = { ...profile, menuItems: updatedItems };
    setProfile(updated);
    if (onUpdateVendorUser) {
      onUpdateVendorUser(updated);
    }
    setEditingPriceItem(null);
    showToast(`Price updated for ${editingPriceItem.name} to ₦${numPrice.toLocaleString()}`);
  };

  // Add New Dish
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishForm.name.trim() || !newDishForm.price) return;
    const numPrice = parseInt(newDishForm.price, 10);
    if (isNaN(numPrice) || numPrice < 100) {
      showToast('Please enter a valid price');
      return;
    }
    const newItem: VendorMenuItem = {
      id: `dish-${Date.now()}`,
      name: newDishForm.name.trim(),
      category: newDishForm.category,
      price: numPrice,
      inStock: true,
      description: newDishForm.description.trim() || undefined,
    };
    const updatedItems = [newItem, ...(profile.menuItems || [])];
    const updated: VendorUser = { ...profile, menuItems: updatedItems };
    setProfile(updated);
    if (onUpdateVendorUser) {
      onUpdateVendorUser(updated);
    }
    setIsAddDishOpen(false);
    setNewDishForm({ name: '', category: 'food', price: '', description: '' });
    showToast(`Added "${newItem.name}" to your live menu!`);
  };

  // Delete Dish
  const handleDeleteDish = (itemId: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${itemName}" from your menu?`)) {
      return;
    }
    const updatedItems = (profile.menuItems || []).filter(item => item.id !== itemId);
    const updated: VendorUser = { ...profile, menuItems: updatedItems };
    setProfile(updated);
    if (onUpdateVendorUser) {
      onUpdateVendorUser(updated);
    }
    showToast(`Removed "${itemName}" from your menu.`);
  };

  // Pipeline order actions
  const handleOpenConfirmModalForLiveOrder = (order: LiveOrder) => {
    setSelectedOrderForConfirmation(order);
    setIsConfirmPaymentModalOpen(true);
  };

  const handleOpenConfirmModalForDemo = () => {
    const demoOrder: LiveOrder = {
      id: 'LK-5021',
      vendorId: profile.vendorId,
      vendorName: profile.vendorName,
      vendorPhone: profile.phone,
      customerName: 'Halimat Sani',
      customerPhone: '08031234567',
      destination: 'Lokongoma Phase 1',
      items: [{ id: 'demo-1', name: profile.menuItems?.[0]?.name || 'Special Dish', price: 3400, quantity: 2 }],
      foodSubtotal: 6800,
      dispatchFee: 800,
      packagingFee: 300,
      totalAmount: 7900,
      bankDetails: {
        bankName: profile.bankName,
        accountNumber: profile.accountNumber,
        accountName: profile.accountName
      },
      paymentStatus: 'customer_confirmed',
      kitchenStatus: 'idle',
      prepEtaMins: profile.prepTimeMins || 25,
      createdAt: new Date().toISOString()
    };
    setSelectedOrderForConfirmation(demoOrder);
    setIsConfirmPaymentModalOpen(true);
  };

  const handleVendorConfirmPayment = async (orderId: string, prepEtaMins: number) => {
    await orderService.vendorConfirmPayment(orderId, prepEtaMins);
    setPipelineState(prev => ({ ...prev, pendingTransferConfirmed: true }));
    showToast(`Payment confirmed for Order #${orderId}! Delivery countdown set to ${prepEtaMins} mins. Customer notified.`);
  };

  const handleConfirmTransfer = () => {
    handleOpenConfirmModalForDemo();
  };

  const handlePackOrder = () => {
    setPipelineState(prev => ({ ...prev, orderPackedAndDispatched: true }));
    showToast(`Order #LK-5018 packed! Rider Ibrahim alerted for pickup at ${profile.landmark.substring(0, 30)}...`);
  };

  const handlePackLiveOrder = async (orderId: string) => {
    await orderService.advanceKitchenStage(orderId, 'dispatched');
    showToast(`Order #${orderId} packed! Rider notified for immediate delivery.`);
  };

  const handleDownloadStatement = () => {
    showToast(`Generating official NUBAN settlement statement for ${profile.vendorName}... Sent to ${profile.email}!`);
  };

  // Filtered menu items
  const displayedItems = useMemo(() => {
    const items = profile.menuItems || [];
    if (menuFilter === 'all') return items;
    return items.filter(item => item.category === menuFilter);
  }, [profile.menuItems, menuFilter]);

  // Derived financial figures for this vendor
  const commissionPercent = profile.commissionRate ?? 8.0;
  const grossSales = matchedApprovedVendor.dailyGrossGMV || 64000;
  const platformFee = Math.round(grossSales * (commissionPercent / 100));
  const netSettled = grossSales - platformFee;

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 pb-16">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-amber-500/40">
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Super Admin Supervision Mode Banner */}
      {isAdminSupervising && (
        <div className="bg-amber-400 text-stone-950 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border-2 border-amber-500 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-950 flex items-center gap-2">
                <span>Master Admin Supervision Session</span>
                <span className="bg-stone-900 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">HQ Clearance</span>
              </div>
              <p className="text-xs text-stone-800 font-medium">
                Live surveillance of <strong>{profile.vendorName}</strong> ({profile.landmark}). All menu pricing, order advancement, and kitchen statuses reflect in real-time.
              </p>
            </div>
          </div>

          <button
            onClick={onExitSupervision || onLogout}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Return to Admin Portal</span>
          </button>
        </div>
      )}

      {/* Top Banner: Vendor Header & Primary Actions */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-4 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        
        {/* Left: Brand Identity & Status */}
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl ${profile.avatarColor || 'bg-amber-700'} text-white font-headline font-bold text-2xl flex items-center justify-center shadow-sm shrink-0`}>
            {profile.logoInitials || profile.vendorName.substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
                {profile.vendorName}
              </h1>
              
              {profile.isKitchenLive ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Kitchen Live
                </span>
              ) : (
                <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Orders Paused
                </span>
              )}

              <span className="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{profile.ownerName}</span>
              </span>
            </div>

            <p className="text-xs text-on-surface-variant flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                {profile.landmark}
              </span>
              <span>&bull;</span>
              <span className="font-semibold text-on-surface">
                {profile.bankName}: {profile.accountName} ({profile.accountNumber})
              </span>
              <span>&bull;</span>
              <span>Commission: <strong className="text-primary">{commissionPercent}%</strong></span>
            </p>
          </div>
        </div>

        {/* Right: Operational Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Edit Kitchen Profile & Bank Info */}
          <button
            onClick={() => {
              setEditForm({
                vendorName: profile.vendorName,
                ownerName: profile.ownerName,
                phone: profile.phone,
                email: profile.email,
                landmark: profile.landmark,
                bankName: profile.bankName,
                accountNumber: profile.accountNumber,
                accountName: profile.accountName,
              });
              setIsEditProfileOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-primary" />
            <span>Edit Profile &amp; Bank</span>
          </button>

          {/* Visual Analytics & Prep Speed Dashboard */}
          <button
            onClick={() => setActiveHubTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              activeHubTab === 'analytics'
                ? 'bg-primary text-white'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40'
            }`}
            title="Open Visual Sales & Preparation Velocity Dashboard"
          >
            <TrendingUp className={`w-3.5 h-3.5 ${activeHubTab === 'analytics' ? 'text-white' : 'text-primary'}`} />
            <span>Visual Analytics</span>
          </button>

          {/* Settle App Share Remittance */}
          <button
            onClick={() => setIsRemittanceModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Settle Platform Share Remittance"
          >
            <CreditCard className="w-3.5 h-3.5 text-primary" />
            <span>Remit App Share</span>
          </button>

          {/* Toggle Live Kitchen Status */}
          <button
            onClick={handleToggleKitchenStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              profile.isKitchenLive 
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {profile.isKitchenLive ? (
              <>
                <ToggleRight className="w-4 h-4 text-amber-700" />
                <span>Pause Orders</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-white" />
                <span>Resume Live Orders</span>
              </>
            )}
          </button>

          {/* View Customer Storefront */}
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant/30 flex items-center gap-1.5 cursor-pointer"
            title="Preview Customer Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Customer View</span>
          </button>

          {/* Sign Out */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200 flex items-center gap-1.5 cursor-pointer"
              title="Lock Console / Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

      </div>

      {/* Financial Settlement & Remittance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Metric 1: Customer Direct Payments Received */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant">
            <span>Customer Gross Received</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="font-price-display font-bold text-xl md:text-2xl text-on-surface">
            ₦{grossSales.toLocaleString()}
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% credited
            </span>
            <button
              onClick={() => setActiveHubTab('analytics')}
              className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>View Charts</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 2: Platform Share Commission */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 space-y-1.5 shadow-xs">
          <span className="text-[11px] font-bold text-on-surface-variant flex items-center justify-between">
            <span>Platform Share ({commissionPercent}%)</span>
            <Receipt className="w-4 h-4 text-amber-600" />
          </span>
          <div className="font-price-display font-bold text-xl md:text-2xl text-amber-800 dark:text-amber-300">
            ₦{platformFee.toLocaleString()}
          </div>
          <span className="text-[10px] text-on-surface-variant">
            Tier 1 partner rate • Accrued on sales
          </span>
        </div>

        {/* Metric 3: Total Remitted to App */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 space-y-1.5 shadow-xs">
          <span className="text-[11px] font-bold text-on-surface-variant flex items-center justify-between">
            <span>Total Remitted to App</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="font-price-display font-bold text-xl md:text-2xl text-emerald-700">
            ₦{remittanceRecords.reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-on-surface-variant truncate block">
            {remittanceRecords.length} settlement cycles verified
          </span>
        </div>

        {/* Metric 4: Outstanding App Share Remittance Due */}
        <div className={`rounded-2xl border p-4 space-y-1.5 shadow-xs transition-all ${
          outstandingRemittance > 0 
            ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/40' 
            : 'bg-surface-container-lowest border-outline-variant/30'
        }`}>
          <span className="text-[11px] font-bold text-on-surface-variant flex items-center justify-between">
            <span>Outstanding App Share</span>
            <CreditCard className="w-4 h-4 text-primary" />
          </span>
          <div className="font-price-display font-bold text-xl md:text-2xl text-primary">
            ₦{outstandingRemittance.toLocaleString()}
          </div>
          {outstandingRemittance > 0 ? (
            <button
              onClick={() => setIsRemittanceModalOpen(true)}
              className="w-full mt-1 py-1.5 px-2 rounded-lg bg-primary hover:bg-primary-container text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              <CreditCard className="w-3 h-3" />
              <span>Pay Remittance</span>
            </button>
          ) : (
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> All Remittances Cleared
            </span>
          )}
        </div>

      </div>

      {/* ⏰ 2-HOURLY WHATSAPP STOCK NOTIFICATION & READY POTS BANNER */}
      <div className="bg-surface-container-lowest rounded-3xl border-2 border-primary/25 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface">
                  2-Hourly WhatsApp Stock Synchronizer
                </h3>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Pots Ready Since 10:00 AM
                </span>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                  Slot: {stockInfo.currentSlot.slot} ({stockInfo.currentSlot.label})
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                By 10:00 AM, food is ready in kitchen warmers. To guarantee customers never order finished pots, kitchens receive 2-hourly alerts on WhatsApp ({profile.phone}) to confirm available dishes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-on-surface-variant font-medium block">Next Stock Ping:</span>
              <span className="font-mono font-bold text-xs text-primary">
                {stockInfo.nextSlot.slot} ({stockInfo.minutesToNextSlot}m remaining)
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp Alert & Confirmation Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-on-surface-variant text-[11px] font-medium">Quick Verification:</span>
            {confirmedSlots[profile.vendorId] ? (
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                {confirmedSlots[profile.vendorId]}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleConfirmStockSlot(stockInfo.currentSlot.slot)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Pots Ready &amp; In-Stock</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveHubTab('menu')}
              className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-outline-variant/30 transition-colors cursor-pointer"
            >
              Manage Dish Toggles
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={buildVendorStockPromptWhatsAppUrl(
                profile.phone, 
                profile.vendorName, 
                (profile.menuItems || []).map(m => ({ name: m.name, inStock: m.inStock })), 
                stockInfo.currentSlot.slot
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-headline text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ping My WhatsApp ({profile.phone})</span>
            </a>

            <a
              href={buildVendorStockConfirmationToSupportUrl(
                profile.vendorName, 
                (profile.menuItems || []).filter(i => i.inStock).length,
                (profile.menuItems || []).filter(i => !i.inStock).map(i => i.name),
                stockInfo.currentSlot.slot
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-stone-700"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Notify Central Dispatch</span>
            </a>
          </div>
        </div>
      </div>

      {/* Hub Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scroll border-b border-outline-variant/30 pb-3">
        {[
          { id: 'pipeline', label: 'Orders & Live Pipeline', icon: Clock, badge: pipelineState.orderPackedAndDispatched ? '3' : '4' },
          { 
            id: 'analytics', 
            label: 'Sales & Prep Analytics', 
            icon: TrendingUp, 
            badge: 'Live Charts',
            badgeColor: activeHubTab === 'analytics' ? 'bg-white/20 text-white' : 'bg-emerald-600 text-white'
          },
          { id: 'menu', label: 'Menu, Prices & Stock', icon: UtensilsCrossed, badge: `${profile.menuItems?.length || 0}` },
          { 
            id: 'addons', 
            label: '1-Click Add-Ons & Pricing', 
            icon: Sparkles, 
            badge: `${vendorAddOns.filter(a => a.available).length} Active`,
            badgeColor: activeHubTab === 'addons' ? 'bg-white/20 text-white' : 'bg-amber-600 text-white'
          },
          { 
            id: 'remittances', 
            label: 'App Share Remittance & Ledger', 
            icon: CreditCard, 
            badge: outstandingRemittance > 0 ? `₦${outstandingRemittance.toLocaleString()} Due` : 'Cleared',
            badgeColor: outstandingRemittance > 0 ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
          },
          { id: 'catering', label: 'Bulk & Catering Inquiries', icon: Users, badge: `${cateringInquiries.length}` },
          { id: 'reviews', label: 'Customer Reviews & Feedback', icon: Star, badge: '4.9 ★' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveHubTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeHubTab === tab.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              tab.badgeColor ? tab.badgeColor : activeHubTab === tab.id ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface'
            }`}>
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* 4-Stage Kitchen Order Pipeline */}
      {activeHubTab === 'pipeline' && (
      <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-4">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Live Kitchen Pipeline ({profile.vendorName})
            </h2>
            <p className="text-xs text-on-surface-variant">
              Confirm bank transfers, advance cooking fireplace, pack orders, and assign Confluence dispatch riders.
            </p>
          </div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Syncing live with Lokoja riders
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Column 1: Transfer Check */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <span className="font-headline text-xs font-bold text-primary flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> 1. Transfer Check
              </span>
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                {liveOrders.filter(o => o.paymentStatus === 'customer_confirmed' || o.paymentStatus === 'pending_transfer').length || (!pipelineState.pendingTransferConfirmed ? 1 : 0)}
              </span>
            </div>

            {/* Live Firestore Pending Orders */}
            {liveOrders
              .filter(o => o.paymentStatus === 'customer_confirmed' || o.paymentStatus === 'pending_transfer')
              .map(order => (
                <div key={order.id} className="bg-surface-container-lowest p-3.5 rounded-xl border-2 border-emerald-500/40 shadow-xs space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-on-surface">#{order.id}</span>
                    <span className="font-price-display font-bold text-emerald-700 text-xs">₦{order.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-on-surface-variant space-y-0.5">
                    <p className="font-semibold text-on-surface">{order.customerName} ({order.destination})</p>
                    <p className="truncate">{order.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-[11px] text-emerald-900 dark:text-emerald-300">
                    <span className="font-bold block">Customer Transferred:</span>
                    Check {order.bankDetails.bankName} #{order.bankDetails.accountNumber}
                  </div>
                  <button
                    onClick={() => handleOpenConfirmModalForLiveOrder(order)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Credit &amp; Set ETA</span>
                  </button>
                </div>
              ))}

            {/* Standard Demo Order if no live pending order */}
            {liveOrders.filter(o => o.paymentStatus === 'customer_confirmed' || o.paymentStatus === 'pending_transfer').length === 0 && !pipelineState.pendingTransferConfirmed ? (
              <div className="bg-surface-container-lowest p-3.5 rounded-xl border-2 border-primary/30 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">#LK-5021</span>
                  <span className="font-price-display font-bold text-primary text-xs">₦6,800</span>
                </div>
                <div className="text-xs text-on-surface-variant space-y-0.5">
                  <p className="font-semibold text-on-surface">Halimat Sani (Lokongoma Phase 1)</p>
                  <p>2x {profile.menuItems?.[0]?.name || 'Special Order'}</p>
                </div>
                <div className="p-2 rounded-lg bg-surface-container text-[11px] text-on-surface-variant">
                  <span className="font-bold text-primary block">Transfer Alert Match:</span>
                  Check credit to {profile.bankName} #{profile.accountNumber}
                </div>
                <button
                  onClick={handleConfirmTransfer}
                  className="w-full py-2 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Credit &amp; Set ETA</span>
                </button>
              </div>
            ) : liveOrders.filter(o => o.paymentStatus === 'customer_confirmed' || o.paymentStatus === 'pending_transfer').length === 0 && pipelineState.pendingTransferConfirmed ? (
              <div className="text-center py-8 text-on-surface-variant text-xs">
                All bank transfers verified!
              </div>
            ) : null}
          </div>

          {/* Column 2: Kitchen Fireplace */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <span className="font-headline text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> 2. Kitchen Fireplace
              </span>
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">
                {liveOrders.filter(o => o.kitchenStatus === 'cooking').length + (pipelineState.pendingTransferConfirmed && !pipelineState.orderPackedAndDispatched ? 2 : 1)}
              </span>
            </div>

            {/* Live cooking orders with ETA */}
            {liveOrders.filter(o => o.kitchenStatus === 'cooking').map(order => (
              <div key={order.id} className="bg-surface-container-lowest p-3 rounded-xl border border-amber-500/40 shadow-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">#{order.id}</span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    {order.prepEtaMins} mins ETA
                  </span>
                </div>
                <p className="text-xs text-on-surface font-medium">{order.customerName} ({order.destination})</p>
                <p className="text-[11px] text-on-surface-variant">{order.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}</p>
                <button
                  onClick={() => handlePackLiveOrder(order.id)}
                  className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Pack &amp; Signal Rider</span>
                </button>
              </div>
            ))}

            {pipelineState.pendingTransferConfirmed && (
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-xs space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">#LK-5021 (Just Confirmed)</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">Cooking</span>
                </div>
                <p className="text-xs text-on-surface-variant">On the fire now. Est. delivery: {profile.prepTimeMins || 25} mins</p>
              </div>
            )}

            {!pipelineState.orderPackedAndDispatched && (
              <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">#LK-5018</span>
                  <span className="font-price-display font-bold text-primary text-xs">₦5,200</span>
                </div>
                <div className="text-xs text-on-surface-variant space-y-0.5">
                  <p className="font-semibold text-on-surface">Danladi Yakubu (GRA Hospital Rd)</p>
                  <p>1x {profile.menuItems?.[1]?.name || 'Special Combo'}</p>
                </div>
                <button
                  onClick={handlePackOrder}
                  className="w-full py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Pack Order &amp; Signal Rider</span>
                </button>
              </div>
            )}
          </div>

          {/* Column 3: Out with Rider */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <span className="font-headline text-xs font-bold text-tertiary flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5" /> 3. Out with Rider
              </span>
              <span className="w-5 h-5 rounded-full bg-tertiary text-on-tertiary text-[11px] font-bold flex items-center justify-center">
                {pipelineState.orderPackedAndDispatched ? '2' : '1'}
              </span>
            </div>

            {pipelineState.orderPackedAndDispatched && (
              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-xs space-y-1 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface">#LK-5018</span>
                  <span className="text-[10px] text-tertiary font-bold bg-tertiary/10 px-1.5 py-0.5 rounded">Handed to Rider</span>
                </div>
                <p className="text-xs text-on-surface-variant">Rider Ibrahim en route to GRA Hospital Road.</p>
              </div>
            )}

            <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-on-surface">#LK-5014</span>
                <span className="text-[10px] text-tertiary font-bold bg-tertiary/10 px-1.5 py-0.5 rounded">In-Transit</span>
              </div>
              <p className="text-xs text-on-surface-variant">Rider Musa &bull; ETA 7 mins to Adankolo</p>
              <div className="text-[11px] text-on-surface-variant">Total: ₦4,600</div>
            </div>
          </div>

          {/* Column 4: Delivered & Settled */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <span className="font-headline text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 4. Delivered &amp; Settled
              </span>
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center">
                22
              </span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-xs space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-on-surface">#LK-5009</span>
                <span className="font-price-display font-bold text-emerald-700">₦8,400</span>
              </div>
              <p className="text-on-surface-variant">Delivered to Ganaja Junction</p>
              <span className="text-[10px] text-emerald-600 block font-semibold">Credited to {profile.bankName}</span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 shadow-xs space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-on-surface">#LK-5003</span>
                <span className="font-price-display font-bold text-emerald-700">₦3,900</span>
              </div>
              <p className="text-on-surface-variant">Delivered to Zone 8 Secretariat</p>
              <span className="text-[10px] text-emerald-600 block font-semibold">Credited to {profile.bankName}</span>
            </div>
          </div>

        </div>
      </section>
      )}

      {/* Visual Analytics & Preparation Times Dashboard */}
      {activeHubTab === 'analytics' && (
        <VendorAnalyticsDashboard 
          profile={profile}
          liveOrders={liveOrders}
          onRefresh={() => showToast(`Analytics refreshed for ${profile.vendorName}.`)}
        />
      )}

      {/* Live Menu & In-Stock Management (Fully Editable!) */}
      {activeHubTab === 'menu' && (
      <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-lg md:text-xl font-bold text-on-surface">
                Live Menu, Pricing &amp; Stock Control
              </h2>
              <span className="text-xs bg-surface-container text-on-surface-variant font-bold px-2.5 py-0.5 rounded-full">
                {profile.menuItems?.length || 0} Items
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Instantly toggle dishes as sold out when pots empty, update item prices, or add new foods/drinks/bakes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddDishOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* 2-Hourly WhatsApp Stock Schedule Track */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-headline text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-primary" />
                <span>2-Hourly WhatsApp Stock Broadcast Schedule</span>
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Alerts dispatched every 2 hours to {profile.phone}. Confirm what dishes remain in your pots.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkSetAllStock(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold border border-emerald-600/30 transition-all cursor-pointer"
              >
                ✓ All In Stock (Pots Ready)
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetAllStock(false)}
                className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[11px] font-semibold border border-outline-variant/30 transition-all cursor-pointer"
              >
                Mark All Sold Out
              </button>
            </div>
          </div>

          {/* Slots Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {STOCK_NOTIFICATION_SLOTS.map(slot => {
              const isCurrent = stockInfo.currentSlot.slot === slot.slot;
              const isConfirmed = !!confirmedSlots[slot.slot];

              return (
                <div 
                  key={slot.slot}
                  className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                    isCurrent 
                      ? 'bg-primary-fixed/20 border-primary shadow-xs' 
                      : isConfirmed 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-surface-container-lowest border-outline-variant/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-on-surface text-[11px]">{slot.slot}</span>
                    {isCurrent ? (
                      <span className="text-[9px] bg-primary text-white px-1.5 py-0.2 rounded font-bold">ACTIVE</span>
                    ) : isConfirmed ? (
                      <span className="text-[9px] text-emerald-700 font-bold">✓ DONE</span>
                    ) : (
                      <span className="text-[9px] text-outline">PENDING</span>
                    )}
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium mt-1 truncate">
                    {slot.label}
                  </span>
                  
                  {isCurrent && !isConfirmed && (
                    <button
                      type="button"
                      onClick={() => handleConfirmStockSlot(slot.slot)}
                      className="mt-2 py-1 px-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer text-center"
                    >
                      Confirm Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 text-xs">
          {(['all', 'food', 'drink', 'confectionery'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setMenuFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer capitalize ${
                menuFilter === cat 
                  ? 'bg-secondary text-white shadow-xs' 
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat === 'confectionery' ? 'Bakes & Sweets' : cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedItems.map((dish) => (
            <div 
              key={dish.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                dish.inStock 
                  ? 'bg-surface-container-lowest border-outline-variant/30 shadow-xs' 
                  : 'bg-surface-container-low/50 border-outline-variant/20 opacity-75'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-on-surface leading-tight">{dish.name}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                    dish.category === 'drink' 
                      ? 'bg-blue-100 text-blue-800' 
                      : dish.category === 'confectionery' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {dish.category}
                  </span>
                </div>

                {dish.description && (
                  <p className="text-[11px] text-on-surface-variant line-clamp-2">
                    {dish.description}
                  </p>
                )}

                <div className="pt-1 flex items-center justify-between">
                  <span className="font-price-display font-bold text-base text-primary">
                    ₦{dish.price.toLocaleString()}
                  </span>
                  
                  <button
                    onClick={() => {
                      setEditingPriceItem(dish);
                      setNewPriceValue(dish.price.toString());
                    }}
                    className="text-[11px] text-on-surface-variant hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Price
                  </button>
                </div>
              </div>

              {/* Bottom Card Controls: In-Stock Toggle & Delete */}
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                <button
                  onClick={() => handleToggleItemStock(dish.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  {dish.inStock ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-bold">
                      <ToggleRight className="w-6 h-6 text-emerald-600" /> In Stock
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1 font-bold">
                      <ToggleLeft className="w-6 h-6 text-rose-500" /> Sold Out
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteDish(dish.id, dish.name)}
                  className="p-1.5 text-on-surface-variant hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {displayedItems.length === 0 && (
          <div className="text-center py-10 text-on-surface-variant text-xs">
            No items found in this category. Click "Add New Item" to create one!
          </div>
        )}
      </section>
      )}

      {/* Tab Content: 1-Click Upsell Add-Ons & Pricing Control */}
      {activeHubTab === 'addons' && (
        <VendorAddOnsManager
          vendorId={profile.vendorId}
          vendorName={profile.vendorName}
          addOns={vendorAddOns}
          onToggleAvailability={handleToggleAddOnAvailability}
          onUpdatePrice={handleUpdateAddOnPrice}
          onAddCustomAddOn={handleAddCustomAddOn}
          onDeleteCustomAddOn={handleDeleteCustomAddOn}
        />
      )}

      {/* Tab Content: App Share Remittances & Financial Ledger */}
      {activeHubTab === 'remittances' && (
        <section className="space-y-6 animate-fade-in">
          {/* Remittance Explanation Banner */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline text-xl font-bold text-on-surface">
                    App Share Remittance &amp; Financial Ledger
                  </h2>
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
                    Direct Vendor Settlement
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
                  Under LokoChop's partner agreement, <strong>100% of customer order payments drop directly into your bank account ({profile.bankName} #{profile.accountNumber})</strong> with zero upfront deductions. You remit the agreed <strong>{commissionPercent}% app commission</strong> (₦{platformFee.toLocaleString()} accrued on verified sales) to LokoChop Corporate Escrow via Direct Bank Transfer or instant card billing.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setIsRemittanceModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                <span>Make Remittance Payment</span>
              </button>
            </div>

            {/* Corporate Escrow Account Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  LokoChop Corporate Bank
                </span>
                <p className="font-bold text-base text-on-surface">Providus Bank</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-sm font-bold text-primary">1029384756</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">Corporate Escrow</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-1.5">
                <span className="text-[11px] font-bold text-on-surface-variant block">Beneficiary Account Name</span>
                <p className="font-bold text-xs text-on-surface leading-snug">LokoChop Technologies Ltd (Corporate Escrow)</p>
                <span className="text-[10px] text-on-surface-variant block pt-1">RC Number: 1892044 • CBN Licensed</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-1.5">
                <span className="text-[11px] font-bold text-on-surface-variant block">Settlement Frequency</span>
                <p className="font-bold text-xs text-on-surface">Daily or Weekly Cycles</p>
                <span className="text-[10px] text-emerald-600 font-semibold block pt-1">
                  Auto-reconciliation via NIP transaction reference
                </span>
              </div>
            </div>
          </div>

          {/* Remittance Ledger Table */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">
                  Remittance Payment Records &amp; Clearance Slips
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Historical log of app commission remittances made by {profile.vendorName}
                </p>
              </div>
              <button
                onClick={handleDownloadStatement}
                className="px-3.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface border border-outline-variant/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Statement (CSV/PDF)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Reference</th>
                    <th className="p-3">Period / Cycle</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3 rounded-r-xl text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {remittanceRecords.map(record => (
                    <tr key={record.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">{record.reference}</td>
                      <td className="p-3 text-on-surface">{record.accruedPeriod}</td>
                      <td className="p-3 text-on-surface-variant">{record.paymentMethod}</td>
                      <td className="p-3 font-price-display font-bold text-sm text-on-surface">
                        ₦{record.amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {record.status}
                        </span>
                      </td>
                      <td className="p-3 text-on-surface-variant">{record.date}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => showToast(`Downloading official remittance clearance slip for ${record.reference}...`)}
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Download Clearance Slip"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {remittanceRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-on-surface-variant text-xs">
                        No remittance records logged yet. Click "Make Remittance Payment" to log your first payment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tab Content: Bulk & Catering Inquiries */}
      {activeHubTab === 'catering' && (
        <section className="space-y-6 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline text-xl font-bold text-on-surface">
                    Bulk Orders &amp; Catering Inquiries
                  </h2>
                  <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-full">
                    {cateringInquiries.length} Inquiries
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Requests submitted by diners across Lokoja for wedding receptions, corporate secretariat workshops, and large family celebrations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cateringInquiries.map(inq => (
                <div 
                  key={inq.id}
                  className="bg-surface-container-low/60 rounded-2xl border border-outline-variant/30 p-5 space-y-3.5 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-primary font-bold">{inq.id}</span>
                        <h3 className="font-headline text-base font-bold text-on-surface">{inq.customerName}</h3>
                        <p className="text-xs text-on-surface-variant font-semibold">{inq.eventType}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        inq.status === 'Confirmed & Booked'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inq.status === 'Quote Sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inq.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-1">
                      <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 space-y-0.5">
                        <span className="text-[10px] text-on-surface-variant block">Guest Count</span>
                        <span className="font-bold text-on-surface flex items-center gap-1">
                          <Users className="w-3 h-3 text-secondary" /> {inq.guestCount} Guests
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 space-y-0.5">
                        <span className="text-[10px] text-on-surface-variant block">Event Date</span>
                        <span className="font-bold text-on-surface flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary" /> {inq.eventDate} ({inq.eventTime})
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-start gap-1.5 text-on-surface-variant">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span className="line-clamp-2"><strong>Venue:</strong> {inq.deliveryVenue}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-xs">
                        <span className="font-bold text-primary block mb-0.5">Menu Preferences:</span>
                        <p className="text-on-surface-variant text-[11px] leading-relaxed">{inq.menuPreferences}</p>
                      </div>
                      {inq.specialRequests && (
                        <p className="text-[11px] text-on-surface-variant italic">
                          <strong>Note:</strong> "{inq.specialRequests}"
                        </p>
                      )}
                    </div>

                    {inq.estimatedBudget && (
                      <div className="flex items-baseline justify-between pt-1 text-xs">
                        <span className="text-on-surface-variant">Estimated Customer Budget:</span>
                        <span className="font-price-display text-base font-bold text-emerald-700">
                          ₦{inq.estimatedBudget.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${inq.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${inq.customerName}, regarding your catering inquiry for ${inq.eventType} on LokoChop, Mama Ngozi's Kitchen is ready with your custom quote!`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Client</span>
                      </a>
                      <a
                        href={`tel:${inq.phone}`}
                        className="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface"
                        title="Call Client"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="flex items-center gap-1">
                      {inq.status !== 'Quote Sent' && (
                        <button
                          onClick={() => handleUpdateInquiryStatus(inq.id, 'Quote Sent')}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 font-semibold hover:bg-blue-100 cursor-pointer"
                        >
                          Mark Quote Sent
                        </button>
                      )}
                      {inq.status !== 'Confirmed & Booked' && (
                        <button
                          onClick={() => handleUpdateInquiryStatus(inq.id, 'Confirmed & Booked')}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100 cursor-pointer"
                        >
                          Confirm Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tab Content: Customer Reviews & Ratings */}
      {activeHubTab === 'reviews' && (
        <section className="space-y-6 animate-fade-in">
          <CustomerReviews 
            vendorFilter={profile.vendorName}
            defaultVendorName={profile.vendorName}
          />
        </section>
      )}

      {/* Modal: Edit Kitchen Profile & Bank Remittance */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Edit Kitchen Profile &amp; Bank Settlement
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Update your physical restaurant information and bank remittance details
                </p>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Kitchen / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.vendorName}
                    onChange={(e) => setEditForm({ ...editForm, vendorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Manager / Owner Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.ownerName}
                    onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Contact Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Contact Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Physical Location / Landmark Address</label>
                <input
                  type="text"
                  required
                  value={editForm.landmark}
                  onChange={(e) => setEditForm({ ...editForm, landmark: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Settlement Bank Details Section */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  NUBAN Bank Remittance (Direct Credit)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-amber-950">Settlement Bank Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.bankName}
                      onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                      placeholder="e.g. First Bank of Nigeria"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-amber-950">Account Number (NUBAN)</label>
                    <input
                      type="text"
                      required
                      value={editForm.accountNumber}
                      onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                      placeholder="10 digit NUBAN"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-on-surface font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-950">Account Name (Beneficiary)</label>
                  <input
                    type="text"
                    required
                    value={editForm.accountName}
                    onChange={(e) => setEditForm({ ...editForm, accountName: e.target.value })}
                    placeholder="Registered business name"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Menu Item */}
      {isAddDishOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-headline text-base font-bold text-on-surface">
                Add Menu Offering ({profile.vendorName})
              </h3>
              <button
                onClick={() => setIsAddDishOpen(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDish} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Item / Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Peppered Turkey Wings"
                  value={newDishForm.name}
                  onChange={(e) => setNewDishForm({ ...newDishForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Category</label>
                  <select
                    value={newDishForm.category}
                    onChange={(e) => setNewDishForm({ ...newDishForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="food">Food Dish</option>
                    <option value="drink">Drink / Beverage</option>
                    <option value="confectionery">Confectionery / Bake</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Price (₦)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 3500"
                    value={newDishForm.price}
                    onChange={(e) => setNewDishForm({ ...newDishForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface font-price-display focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Brief Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, flavors or sides..."
                  value={newDishForm.description}
                  onChange={(e) => setNewDishForm({ ...newDishForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDishOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Add to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Price */}
      {editingPriceItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <h3 className="font-headline text-sm font-bold text-on-surface">
                Edit Price: {editingPriceItem.name}
              </h3>
              <button
                onClick={() => setEditingPriceItem(null)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-on-surface">New Price in Naira (₦)</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={newPriceValue}
                  onChange={(e) => setNewPriceValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-base font-price-display font-bold text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPriceItem(null)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Remittance Modal for App Share Settlement */}
      <VendorRemittanceModal
        isOpen={isRemittanceModalOpen}
        onClose={() => setIsRemittanceModalOpen(false)}
        vendor={profile}
        outstandingBalance={outstandingRemittance}
        onRemittanceSuccess={handleRemittanceSuccess}
      />

      {/* Vendor Direct Payment Confirmation & Delivery ETA Modal */}
      <VendorConfirmPaymentModal
        isOpen={isConfirmPaymentModalOpen}
        order={selectedOrderForConfirmation}
        onClose={() => setIsConfirmPaymentModalOpen(false)}
        onConfirm={handleVendorConfirmPayment}
      />

    </div>
  );
};
