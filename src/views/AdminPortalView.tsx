import React, { useState, useMemo } from 'react';
import { ActiveView, AdminUser, ApprovedVendorAccount } from '../types';
import { APPROVED_LOKOJA_VENDORS } from '../data/approvedVendors';
import { 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Bike, 
  Check, 
  Save, 
  Download, 
  Filter, 
  Search, 
  LogOut,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Copy,
  CheckCheck,
  KeyRound,
  Building2,
  MapPin,
  Phone,
  Mail,
  UtensilsCrossed,
  Key,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Edit3,
  X
} from 'lucide-react';
import { AdminVendorMonitor } from '../components/AdminVendorMonitor';

interface AdminPortalViewProps {
  onNavigate: (view: ActiveView) => void;
  adminUser?: AdminUser | null;
  onLogout?: () => void;
  onSuperviseVendor?: (vendor: ApprovedVendorAccount) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ 
  onNavigate, 
  adminUser, 
  onLogout,
  onSuperviseVendor
}) => {
  // Navigation tabs within Admin Portal
  const [activeTab, setActiveTab] = useState<'kitchen-monitor' | 'vault' | 'commissions' | 'tariffs'>('kitchen-monitor');
  const [selectedMonitorVendorId, setSelectedMonitorVendorId] = useState<string>(APPROVED_LOKOJA_VENDORS[0].id);

  // Vendor Logins Vault State
  const [vendorAccounts, setVendorAccounts] = useState<ApprovedVendorAccount[]>(() => {
    return [...APPROVED_LOKOJA_VENDORS];
  });
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultCategory, setVaultCategory] = useState('All');
  const [showAllPasscodes, setShowAllPasscodes] = useState(true);
  const [revealedRows, setRevealedRows] = useState<Record<string, boolean>>({});

  // Passcode editing modal state
  const [editingVendorPasscode, setEditingVendorPasscode] = useState<ApprovedVendorAccount | null>(null);
  const [newPasscodeValue, setNewPasscodeValue] = useState('');

  // Commission Rates State
  const [rates, setRates] = useState<Record<string, number>>(() => {
    const initialRates: Record<string, number> = {};
    APPROVED_LOKOJA_VENDORS.forEach(v => {
      initialRates[v.id] = v.commissionRate;
    });
    return initialRates;
  });

  // Delivery Tariffs State
  const [tariffs, setTariffs] = useState({
    tier1: 800,
    tier2: 1200,
    tier3: 2000,
    rainSurcharge: 300
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle visibility of a specific row's passcode
  const toggleRowPasscode = (vendorId: string) => {
    setRevealedRows(prev => ({
      ...prev,
      [vendorId]: prev[vendorId] === undefined ? !showAllPasscodes : !prev[vendorId]
    }));
  };

  const isPasscodeVisible = (vendorId: string) => {
    if (revealedRows[vendorId] !== undefined) {
      return revealedRows[vendorId];
    }
    return showAllPasscodes;
  };

  // Copy credentials helper
  const handleCopyCredentials = (vendor: ApprovedVendorAccount) => {
    const textToCopy = `LokoChop Vendor Access Credentials
Kitchen: ${vendor.name}
Manager: ${vendor.ownerName}
Login Identifier: ${vendor.credentials.identifier}
Security Passcode: ${vendor.credentials.passcode}
Universal Master PIN: ${vendor.credentials.pin}
Settlement Bank: ${vendor.bankDetails.bankName} (${vendor.bankDetails.accountNumber})
Portal Link: https://lokochop.ng/vendor-hub`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast(`Copied login credentials for ${vendor.name} to clipboard!`);
    }).catch(() => {
      showToast(`Login Passcode: ${vendor.credentials.passcode}`);
    });
  };

  // Reset or Update Passcode
  const handleSaveNewPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendorPasscode || !newPasscodeValue.trim()) return;

    const trimmed = newPasscodeValue.trim();
    setVendorAccounts(prev => 
      prev.map(v => {
        if (v.id === editingVendorPasscode.id) {
          return {
            ...v,
            credentials: {
              ...v.credentials,
              passcode: trimmed
            }
          };
        }
        return v;
      })
    );
    showToast(`Updated passcode for ${editingVendorPasscode.name} to "${trimmed}"`);
    setEditingVendorPasscode(null);
    setNewPasscodeValue('');
  };

  // Commission Rate Change
  const handleRateChange = (id: string, delta: number) => {
    setRates(prev => {
      const current = prev[id] || 8;
      const next = Math.min(15, Math.max(5, current + delta));
      return { ...prev, [id]: next };
    });
    showToast(`Adjusted commission rate to ${(rates[id] || 8) + delta}%`);
  };

  const handleSaveTariffs = () => {
    showToast(`Saved live dispatch tariffs across Lokoja tiers!`);
  };

  // Filtered vendors for the vault table
  const filteredVaultVendors = useMemo(() => {
    return vendorAccounts.filter(v => {
      const matchesSearch = 
        v.name.toLowerCase().includes(vaultSearch.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(vaultSearch.toLowerCase()) ||
        v.address.toLowerCase().includes(vaultSearch.toLowerCase()) ||
        v.credentials.identifier.toLowerCase().includes(vaultSearch.toLowerCase());
      
      const matchesCategory = 
        vaultCategory === 'All' || 
        v.category.toLowerCase().includes(vaultCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [vendorAccounts, vaultSearch, vaultCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-amber-500/50">
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Title & Command Bar */}
      <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-headline font-bold text-2xl shadow-xs shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
                LokoChop Master Administrator
              </h1>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
                {adminUser ? `${adminUser.role} (Level ${adminUser.clearanceLevel})` : 'Super Admin HQ'}
              </span>
              {adminUser && (
                <span className="bg-surface-container-high text-on-surface-variant text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-outline-variant/30">
                  <UserCheck className="w-3 h-3 text-primary" />
                  <span>{adminUser.name}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Authorized Governance: Vendor Logins Vault, Direct NUBAN Remittances &amp; Confluence Okada Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <button 
            onClick={() => onNavigate('vendor-hub')}
            className="px-3.5 py-2 bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-semibold rounded-xl border border-outline-variant/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
            <span>Open Vendor Hub</span>
          </button>
          
          {onLogout && (
            <button 
              onClick={onLogout}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="End admin session and lock console"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Lock Console</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('kitchen-monitor')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'kitchen-monitor'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Live Kitchen Monitor &amp; Dashboards</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            14 Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'vault'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Vendor Logins &amp; Credentials Vault</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">14</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'commissions'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Commission Governance (8-12%)</span>
        </button>

        <button
          onClick={() => setActiveTab('tariffs')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'tariffs'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Okada Dispatch Tariffs</span>
        </button>
      </div>

      {/* Platform Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Platform GMV (Past 30 Days)</span>
          <div className="font-price-display text-2xl font-bold text-primary">₦4,820,400</div>
          <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +22.4% MoM across 14 Bukas
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Net Commission Revenue</span>
          <div className="font-price-display text-2xl font-bold text-secondary">₦394,800</div>
          <span className="text-[11px] text-on-surface-variant">Weighted average rate: 8.2%</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Active Okada Dispatchers</span>
          <div className="font-price-display text-2xl font-bold text-emerald-700">24 Riders</div>
          <span className="text-[11px] text-tertiary font-semibold">Dry weather tariff active</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Vendor Accounts Secured</span>
          <div className="font-price-display text-2xl font-bold text-amber-700">14 Active</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCheck className="w-3 h-3" /> Credentials Admin Vault
          </span>
        </div>
      </div>

      {/* TAB 0: LIVE KITCHEN MONITOR & DASHBOARDS */}
      {activeTab === 'kitchen-monitor' && (
        <section className="space-y-6">
          <AdminVendorMonitor
            vendors={vendorAccounts}
            selectedVendorId={selectedMonitorVendorId}
            onSelectVendorId={setSelectedMonitorVendorId}
            onSuperviseVendor={onSuperviseVendor}
          />
        </section>
      )}

      {/* TAB 1: VENDOR LOGINS & CREDENTIALS VAULT */}
      {activeTab === 'vault' && (
        <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 space-y-5 shadow-xs animate-fade-in">
          
          {/* Vault Header Notice & Privacy Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-200/80 text-amber-900 rounded-xl shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-amber-800" />
              </div>
              <div className="space-y-0.5 text-xs text-amber-950">
                <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <span>Secured Vendor Logins Vault (Admin Clearance Only)</span>
                  <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">Restricted</span>
                </div>
                <p>
                  Per enterprise security policy, vendor login credentials are <strong>strictly masked from the public vendor sign-in terminal</strong> and stored securely here for administrative distribution, password resets, and account audits.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAllPasscodes(!showAllPasscodes)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {showAllPasscodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAllPasscodes ? 'Mask All Passcodes' : 'Reveal All Passcodes'}</span>
            </button>
          </div>

          {/* Search and Category Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={vaultSearch}
                onChange={e => setVaultSearch(e.target.value)}
                placeholder="Search vendor name, manager, phone or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              {['All', 'Fast Food', 'Nigerian Restaurant', 'Bakery', 'Cafe'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setVaultCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    vaultCategory === cat
                      ? 'bg-secondary text-white shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Vault Credentials Table */}
          <div className="overflow-x-auto custom-scroll rounded-2xl border border-outline-variant/30">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant/30">
                  <th className="py-3 px-3.5">Vendor / Buka</th>
                  <th className="py-3 px-3.5">Login Identifier (Email / Phone)</th>
                  <th className="py-3 px-3.5">Assigned Passcode</th>
                  <th className="py-3 px-3.5">Universal PIN</th>
                  <th className="py-3 px-3.5">Settlement Bank &amp; NUBAN</th>
                  <th className="py-3 px-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                {filteredVaultVendors.map(vendor => {
                  const visible = isPasscodeVisible(vendor.id);
                  return (
                    <tr key={vendor.id} className="hover:bg-surface-container-low/40 transition-colors">
                      
                      {/* Vendor Name & Info */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${vendor.logo.bg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                            {vendor.logo.initials}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface flex items-center gap-1.5">
                              <span>{vendor.name}</span>
                              <span className="text-[10px] bg-surface-container text-on-surface-variant px-1.5 py-0.2 rounded font-medium">
                                {vendor.tier}
                              </span>
                            </div>
                            <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span>{vendor.ownerName}</span>
                              <span>&bull;</span>
                              <span>{vendor.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Login Identifier */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-mono text-xs text-on-surface font-semibold truncate max-w-[200px]" title={vendor.credentials.identifier}>
                          {vendor.credentials.identifier}
                        </div>
                        <div className="text-[10px] text-on-surface-variant">
                          Alternative: {vendor.phone}
                        </div>
                      </td>

                      {/* Secured Passcode with Toggle */}
                      <td className="py-3.5 px-3.5">
                        <div className="inline-flex items-center gap-2 bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/40">
                          <span className="font-mono font-bold text-amber-900 text-xs tracking-wider">
                            {visible ? vendor.credentials.passcode : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRowPasscode(vendor.id)}
                            className="text-on-surface-variant hover:text-on-surface p-0.5 cursor-pointer"
                            title={visible ? 'Hide passcode' : 'Show passcode'}
                          >
                            {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Universal Testing PIN */}
                      <td className="py-3.5 px-3.5">
                        <span className="font-mono text-xs bg-surface-container px-2 py-0.5 rounded text-tertiary font-bold border border-outline-variant/20">
                          {vendor.credentials.pin}
                        </span>
                      </td>

                      {/* Settlement Bank Details */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-semibold text-on-surface">
                          {vendor.bankDetails.bankName}
                        </div>
                        <div className="text-[11px] font-mono text-on-surface-variant">
                          {vendor.bankDetails.accountNumber} ({vendor.bankDetails.accountName})
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          
                          {/* Monitor Dashboard Button */}
                          <button
                            onClick={() => {
                              setSelectedMonitorVendorId(vendor.id);
                              setActiveTab('kitchen-monitor');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-colors flex items-center gap-1 border border-primary/30 cursor-pointer"
                            title="Monitor this vendor's live dashboard, orders, stock, and remittances"
                          >
                            <Eye className="w-3 h-3 text-primary" />
                            <span>Monitor</span>
                          </button>

                          {/* Launch Supervisory Terminal */}
                          {onSuperviseVendor && (
                            <button
                              onClick={() => onSuperviseVendor(vendor)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 text-[11px] font-bold transition-colors flex items-center gap-1 border border-amber-500/30 cursor-pointer"
                              title="Launch full supervisory terminal into this vendor's hub"
                            >
                              <ExternalLink className="w-3 h-3 text-amber-700" />
                              <span>Launch Hub</span>
                            </button>
                          )}

                          {/* Copy Credentials Button */}
                          <button
                            onClick={() => handleCopyCredentials(vendor)}
                            className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold transition-colors flex items-center gap-1 border border-outline-variant/30 cursor-pointer"
                            title="Copy credentials for vendor communication"
                          >
                            <Copy className="w-3 h-3 text-primary" />
                            <span>Copy</span>
                          </button>

                          {/* Edit / Reset Passcode Button */}
                          <button
                            onClick={() => {
                              setEditingVendorPasscode(vendor);
                              setNewPasscodeValue(vendor.credentials.passcode);
                            }}
                            className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-amber-700 transition-colors cursor-pointer"
                            title="Reset / Update Passcode"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredVaultVendors.length === 0 && (
            <div className="text-center py-10 text-on-surface-variant text-xs">
              No vendor accounts matched your search.
            </div>
          )}
        </section>
      )}

      {/* TAB 2: COMMISSION GOVERNANCE */}
      {activeTab === 'commissions' && (
        <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 space-y-4 shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                14 Verified Lokoja Bukas &amp; Commission Rates
              </h2>
              <p className="text-xs text-on-surface-variant">
                Direct bank remittances happen per order; commission settled bi-weekly via invoice.
              </p>
            </div>
            <span className="text-xs font-semibold bg-tertiary/10 text-tertiary px-3 py-1 rounded-full">
              All 14 Vendors Operating Active
            </span>
          </div>

          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant font-semibold">
                  <th className="py-3 px-3">Vendor / Buka</th>
                  <th className="py-3 px-3">Bank &amp; Account Details</th>
                  <th className="py-3 px-3">Corridor / Tier</th>
                  <th className="py-3 px-3">Current Commission</th>
                  <th className="py-3 px-3 text-right">Adjust Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {vendorAccounts.map(vendor => {
                  const currentRate = rates[vendor.id] || vendor.commissionRate || 8;
                  return (
                    <tr key={vendor.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-on-surface">{vendor.name}</div>
                        <div className="text-[11px] text-on-surface-variant">{vendor.phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-on-surface">{vendor.bankDetails.bankName}</div>
                        <div className="text-[11px] text-on-surface-variant font-mono">{vendor.bankDetails.accountNumber}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] font-medium text-on-surface">
                          {vendor.tier}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-price-display text-sm font-bold text-primary">
                          {currentRate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1 bg-surface-container rounded-lg p-1 border border-outline-variant/30">
                          <button
                            onClick={() => handleRateChange(vendor.id, -1)}
                            className="px-2 py-0.5 rounded hover:bg-surface-container-high font-bold text-on-surface cursor-pointer"
                            title="Decrease rate"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold">{currentRate}%</span>
                          <button
                            onClick={() => handleRateChange(vendor.id, 1)}
                            className="px-2 py-0.5 rounded hover:bg-surface-container-high font-bold text-on-surface cursor-pointer"
                            title="Increase rate"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: DISPATCH TARIFFS */}
      {activeTab === 'tariffs' && (
        <section className="bg-surface-container rounded-3xl border border-outline-variant/30 p-5 md:p-6 space-y-4 shadow-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">Lokoja Delivery Tariff Engine</h2>
              <p className="text-xs text-on-surface-variant">Update live courier payout fees across the three geographical corridors.</p>
            </div>
            <button
              onClick={handleSaveTariffs}
              className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Tariffs</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 space-y-2">
              <span className="font-bold text-tertiary block">Tier 1 Core (10-15 mins)</span>
              <p className="text-[11px] text-on-surface-variant">Paparanda, Lokongoma, GRA, Adankolo</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-on-surface-variant">Fee: ₦</span>
                <input
                  type="number"
                  value={tariffs.tier1}
                  onChange={e => setTariffs(t => ({ ...t, tier1: Number(e.target.value) }))}
                  className="w-24 px-2 py-1 bg-surface-container rounded border border-outline-variant font-bold text-primary font-price-display"
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 space-y-2">
              <span className="font-bold text-secondary block">Tier 2 Mid-Range (15-25 mins)</span>
              <p className="text-[11px] text-on-surface-variant">Sarkin Noma, Zone 8, Kabawa</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-on-surface-variant">Fee: ₦</span>
                <input
                  type="number"
                  value={tariffs.tier2}
                  onChange={e => setTariffs(t => ({ ...t, tier2: Number(e.target.value) }))}
                  className="w-24 px-2 py-1 bg-surface-container rounded border border-outline-variant font-bold text-primary font-price-display"
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 space-y-2">
              <span className="font-bold text-primary block">Tier 3 Peripheral (25-40 mins)</span>
              <p className="text-[11px] text-on-surface-variant">Nataco, Felele, Ganaja Village</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-on-surface-variant">Fee: ₦</span>
                <input
                  type="number"
                  value={tariffs.tier3}
                  onChange={e => setTariffs(t => ({ ...t, tier3: Number(e.target.value) }))}
                  className="w-24 px-2 py-1 bg-surface-container rounded border border-outline-variant font-bold text-primary font-price-display"
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 space-y-2">
              <span className="font-bold text-amber-700 block">Rain / Flood Surcharge</span>
              <p className="text-[11px] text-on-surface-variant">Downpour incentive for Meme corridors</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-on-surface-variant">Add: +₦</span>
                <input
                  type="number"
                  value={tariffs.rainSurcharge}
                  onChange={e => setTariffs(t => ({ ...t, rainSurcharge: Number(e.target.value) }))}
                  className="w-20 px-2 py-1 bg-surface-container rounded border border-outline-variant font-bold text-primary font-price-display"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modal: Reset / Update Vendor Passcode */}
      {editingVendorPasscode && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-700" />
                <h3 className="font-headline text-base font-bold text-on-surface">
                  Reset Vendor Passcode
                </h3>
              </div>
              <button
                onClick={() => setEditingVendorPasscode(null)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-on-surface-variant space-y-1">
              <p>Vendor: <strong className="text-on-surface">{editingVendorPasscode.name}</strong></p>
              <p>Identifier: <span className="font-mono">{editingVendorPasscode.credentials.identifier}</span></p>
            </div>

            <form onSubmit={handleSaveNewPasscode} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-on-surface">New Security Passcode</label>
                <input
                  type="text"
                  required
                  value={newPasscodeValue}
                  onChange={e => setNewPasscodeValue(e.target.value)}
                  placeholder="e.g. chicken2026 or new secret code"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-outline-variant font-mono font-bold text-primary text-sm focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] text-on-surface-variant">
                  This new passcode will immediately apply to the vendor's login credentials.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVendorPasscode(null)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
