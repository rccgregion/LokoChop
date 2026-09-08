import React, { useState } from 'react';
import { ActiveView, CartItem, FoodItem, VendorUser, AdminUser, ApprovedVendorAccount } from './types';
import { INITIAL_CART_ITEMS } from './data/mockData';
import { TopNavBar } from './components/TopNavBar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CartDrawer } from './components/CartDrawer';
import { NotificationsModal } from './components/NotificationsModal';
import { PortalModal } from './components/PortalModal';

import { MarketplaceView } from './views/MarketplaceView';
import { VendorStorefrontView } from './views/VendorStorefrontView';
import { NeighborhoodsView } from './views/NeighborhoodsView';
import { ZoneVendorsDirectory } from './components/ZoneVendorsDirectory';
import { OrderTrackingView } from './views/OrderTrackingView';
import { OrderHistoryView } from './views/OrderHistoryView';
import { VendorHubView } from './views/VendorHubView';
import { VendorLoginView } from './views/VendorLoginView';
import { AdminPortalView } from './views/AdminPortalView';
import { AdminLoginView } from './views/AdminLoginView';
import { VendorOnboardingView } from './views/VendorOnboardingView';
import { RiderPortalView } from './views/RiderPortalView';
import { TransparencyAndLegalView } from './views/TransparencyAndLegalView';
import { TermsModal } from './components/TermsModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('marketplace');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('craving-spot');
  const [selectedZoneKey, setSelectedZoneKey] = useState<string>('tier3');

  // Auth Sessions for Vendor and Admin Portals
  const [vendorUser, setVendorUser] = useState<VendorUser | null>(() => {
    try {
      const saved = localStorage.getItem('lokochop_vendor_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Favorite / Starred Food Items State (Persisted locally)
  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lokochop_favorite_food_ids');
      return saved ? JSON.parse(saved) : ['store-jollof', 'cr-crunchy-wings', 'cs-custom-shawarma', 'store-catfish-grill'];
    } catch {
      return ['store-jollof', 'cr-crunchy-wings', 'cs-custom-shawarma', 'store-catfish-grill'];
    }
  });

  const handleToggleFavorite = (foodId: string) => {
    setFavoriteFoodIds(prev => {
      const exists = prev.includes(foodId);
      const updated = exists ? prev.filter(id => id !== foodId) : [...prev, foodId];
      try {
        localStorage.setItem('lokochop_favorite_food_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('lokochop_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleVendorLoginSuccess = (user: VendorUser) => {
    // Check if there are vendor-specific saved customizations
    let finalUser = user;
    try {
      const existingSaved = localStorage.getItem(`lokochop_vendor_data_${user.vendorId}`);
      if (existingSaved) {
        finalUser = { ...user, ...JSON.parse(existingSaved) };
      }
    } catch {}
    setVendorUser(finalUser);
    try {
      localStorage.setItem('lokochop_vendor_session', JSON.stringify(finalUser));
    } catch {}
  };

  const handleUpdateVendorUser = (updatedUser: VendorUser) => {
    setVendorUser(updatedUser);
    try {
      localStorage.setItem('lokochop_vendor_session', JSON.stringify(updatedUser));
      localStorage.setItem(`lokochop_vendor_data_${updatedUser.vendorId}`, JSON.stringify(updatedUser));
    } catch {}
  };

  const handleVendorLogout = () => {
    setVendorUser(null);
    try {
      localStorage.removeItem('lokochop_vendor_session');
    } catch {}
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    try {
      localStorage.setItem('lokochop_admin_session', JSON.stringify(user));
    } catch {}
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setAdminSupervisedVendor(null);
    try {
      localStorage.removeItem('lokochop_admin_session');
    } catch {}
  };

  // Admin Vendor Supervision Flow
  const [adminSupervisedVendor, setAdminSupervisedVendor] = useState<VendorUser | null>(null);

  const handleAdminSuperviseVendor = (vendor: ApprovedVendorAccount | VendorUser) => {
    // Convert ApprovedVendorAccount to VendorUser format if needed
    const vendorObj: VendorUser = 'credentials' in vendor ? {
      id: vendor.id,
      vendorId: vendor.vendorId,
      vendorName: vendor.name,
      ownerName: vendor.ownerName,
      phone: vendor.phone,
      email: vendor.email,
      bankName: vendor.bankDetails.bankName,
      accountNumber: vendor.bankDetails.accountNumber,
      accountName: vendor.bankDetails.accountName,
      landmark: vendor.address,
      tier: vendor.tier,
      category: vendor.category,
      avatarColor: vendor.logo.bg,
      logoInitials: vendor.logo.initials,
      lastLogin: 'Super Admin Supervisory Session',
      isKitchenLive: true,
      prepTimeMins: 20,
      commissionRate: vendor.commissionRate,
      menuItems: [...vendor.menuOfferings],
    } : vendor;

    setAdminSupervisedVendor(vendorObj);
    setCurrentView('vendor-hub');
  };

  const handleExitSupervision = () => {
    setAdminSupervisedVendor(null);
    setCurrentView('admin-portal');
  };

  // Cart Calculations
  const cartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const cartTotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

  const handleAddToCart = (item: FoodItem) => {
    setCartItems(prev => {
      const existing = prev.find(it => it.id === item.id);
      if (existing) {
        return prev.map(it => 
          it.id === item.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      } else {
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            customization: item.tier
          }
        ];
      }
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => {
      return prev
        .map(it => {
          if (it.id === id) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(it => it.id !== id));
  };

  const handleEmptyCart = () => {
    setCartItems([]);
  };

  const handleReorderItems = (items: CartItem[]) => {
    setCartItems(items);
    setIsCartOpen(true);
  };

  const handleConfirmPayment = () => {
    // Order confirmed
  };

  const handleNavigate = (view: ActiveView, vendorId?: string, zoneKey?: string) => {
    if (vendorId) {
      setSelectedVendorId(vendorId);
    }
    if (zoneKey) {
      setSelectedZoneKey(zoneKey);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="lokoja-app-root" className="min-h-screen bg-surface text-on-surface flex flex-col font-body antialiased pb-[calc(env(safe-area-inset-bottom,0px)+4.5rem)] md:pb-0">
      
      {/* Top Header Navigation */}
      <TopNavBar
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenPortalModal={() => setIsPortalModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        vendorUser={vendorUser}
        adminUser={adminUser}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'marketplace' && (
          <MarketplaceView
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            searchQuery={searchQuery}
            favoriteFoodIds={favoriteFoodIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView === 'vendor-storefront' && (
          <VendorStorefrontView
            selectedVendorId={selectedVendorId}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onOpenCart={() => setIsCartOpen(true)}
            onNavigate={handleNavigate}
            favoriteFoodIds={favoriteFoodIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView === 'zone-directory' && (
          <ZoneVendorsDirectory
            zoneKey={selectedZoneKey}
            onSelectVendor={(vendorId) => handleNavigate('vendor-storefront', vendorId)}
            onAddToCart={handleAddToCart}
            onBack={() => handleNavigate('marketplace')}
            favoriteFoodIds={favoriteFoodIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView === 'neighborhoods' && (
          <NeighborhoodsView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'order-tracking' && (
          <OrderTrackingView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'order-history' && (
          <OrderHistoryView
            onNavigate={handleNavigate}
            onReorder={handleReorderItems}
          />
        )}

        {currentView === 'rider-portal' && (
          <RiderPortalView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'vendor-hub' && (
          (adminSupervisedVendor || vendorUser) ? (
            <VendorHubView
              onNavigate={handleNavigate}
              vendorUser={adminSupervisedVendor || vendorUser}
              onLogout={adminSupervisedVendor ? handleExitSupervision : handleVendorLogout}
              onUpdateVendorUser={adminSupervisedVendor ? (updated) => setAdminSupervisedVendor(updated) : handleUpdateVendorUser}
              isAdminSupervising={Boolean(adminSupervisedVendor)}
              onExitSupervision={handleExitSupervision}
            />
          ) : (
            <VendorLoginView
              onLoginSuccess={handleVendorLoginSuccess}
              onNavigate={handleNavigate}
            />
          )
        )}

        {currentView === 'admin-portal' && (
          adminUser ? (
            <AdminPortalView
              onNavigate={handleNavigate}
              adminUser={adminUser}
              onLogout={handleAdminLogout}
              onSuperviseVendor={handleAdminSuperviseVendor}
            />
          ) : (
            <AdminLoginView
              onLoginSuccess={handleAdminLoginSuccess}
              onNavigate={handleNavigate}
            />
          )
        )}

        {currentView === 'vendor-onboarding' && (
          <VendorOnboardingView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'faqs-legal' && (
          <TransparencyAndLegalView
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Shared Global Footer */}
      <Footer 
        onNavigate={handleNavigate} 
        onOpenTermsModal={() => setIsTermsModalOpen(true)}
      />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPortalModal={() => setIsPortalModalOpen(true)}
      />

      {/* Interactive Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onEmptyCart={handleEmptyCart}
        onConfirmPayment={handleConfirmPayment}
        onNavigate={handleNavigate}
        onOpenTerms={() => setIsTermsModalOpen(true)}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Portal Switcher Modal */}
      <PortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        onSelectView={handleNavigate}
        vendorUser={vendorUser}
        adminUser={adminUser}
      />

      {/* Direct Bank Transfer & NDPR Privacy Policy Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      {/* PWA Offline & Install Prompt Banner */}
      <PwaInstallBanner />

    </div>
  );
}
