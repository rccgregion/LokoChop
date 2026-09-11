import React from 'react';
import { ActiveView, VendorUser, AdminUser } from '../types';
import { AppLogo } from './AppLogo';
import { 
  X, 
  Utensils, 
  Store, 
  ShieldCheck, 
  Navigation, 
  FileText, 
  Clock, 
  ChevronRight, 
  UserPlus,
  Lock,
  CheckCircle2,
  Bike,
  Sparkles
} from 'lucide-react';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: ActiveView) => void;
  vendorUser?: VendorUser | null;
  adminUser?: AdminUser | null;
}

export const PortalModal: React.FC<PortalModalProps> = ({
  isOpen,
  onClose,
  onSelectView,
  vendorUser,
  adminUser,
}) => {
  if (!isOpen) return null;

  const workspaces = [
    {
      id: 'marketplace' as ActiveView,
      title: 'Customer Marketplace',
      desc: 'Browse 14 Bukas, order fresh meals & track delivery across Lokoja.',
      icon: Utensils,
      color: 'text-primary bg-primary/10',
      badge: null
    },
    {
      id: 'vendor-storefront' as ActiveView,
      title: "Mama Ngozi's Kitchen Storefront",
      desc: 'Famous firewood Jollof, Confluence point & kill catfish, pounded yam.',
      icon: Store,
      color: 'text-amber-700 bg-amber-100',
      badge: null
    },
    {
      id: 'order-tracking' as ActiveView,
      title: 'Order #LK-4092 Live Tracking',
      desc: '6-stage live progress timeline, First Bank transfer grace countdown.',
      icon: Clock,
      color: 'text-emerald-700 bg-emerald-100',
      badge: null
    },
    {
      id: 'order-history' as ActiveView,
      title: 'Order History & Issue Resolution Desk',
      desc: 'Past orders, receipts, and direct WhatsApp dispute escalation.',
      icon: FileText,
      color: 'text-blue-700 bg-blue-100',
      badge: null
    },
    {
      id: 'vendor-hub' as ActiveView,
      title: vendorUser ? `Kitchen Hub: ${vendorUser.vendorName}` : 'Vendor Kitchen Hub (Mama Ngozi)',
      desc: 'Confirm incoming bank transfers, 4-column order pipeline & daily ledger.',
      icon: Store,
      color: 'text-teal-700 bg-teal-100',
      badge: vendorUser ? { text: 'Logged In', type: 'active' } : { text: 'Login Required', type: 'locked' }
    },
    {
      id: 'admin-portal' as ActiveView,
      title: adminUser ? `Admin Terminal: ${adminUser.name}` : 'Admin Command & Remittance Center',
      desc: '14-vendor commission controls, GMV tracker, mismatch alerts & payout clearing.',
      icon: ShieldCheck,
      color: 'text-rose-700 bg-rose-100',
      badge: adminUser ? { text: 'Logged In', type: 'active' } : { text: 'Login Required', type: 'locked' }
    },
    {
      id: 'neighborhoods' as ActiveView,
      title: 'Neighborhoods & Delivery Zones',
      desc: 'Tariffs and courier coverage across Tier 1, Tier 2, and Tier 3 corridors.',
      icon: Navigation,
      color: 'text-indigo-700 bg-indigo-100',
      badge: null
    },
    {
      id: 'vendor-onboarding' as ActiveView,
      title: 'Vendor Onboarding & Registration Portal',
      desc: '4-step kitchen registration with direct bank setup and 4-hour review guarantee.',
      icon: UserPlus,
      color: 'text-purple-700 bg-purple-100',
      badge: null
    },
    {
      id: 'rider-portal' as ActiveView,
      title: 'Confluence Express Rider Dispatch Portal',
      desc: 'Accept delivery runs, navigate landmarks across Lokoja, and mark delivered hot.',
      icon: Bike,
      color: 'text-orange-700 bg-orange-100',
      badge: { text: 'Express Bike', type: 'active' }
    },
    {
      id: 'faqs-legal' as ActiveView,
      title: 'FAQs, Cost Transparency & Legal Hub',
      desc: 'Multi-vendor logic, interactive fee calculator, NDPR privacy policy, and terms.',
      icon: FileText,
      color: 'text-emerald-700 bg-emerald-100',
      badge: { text: '100% Transparent', type: 'active' }
    },
    {
      id: 'about' as ActiveView,
      title: 'About LokoChop: Logo & Heritage',
      desc: 'The Confluence food story, logo symbolism, and color palette identity.',
      icon: Sparkles,
      color: 'text-[#0E2A47] bg-[#FAF4EB]',
      badge: { text: 'Brand Story', type: 'active' }
    }
  ];

  return (
    <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 max-w-lg w-full p-6 shadow-xl text-on-surface max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" />
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Select LokoChop Workspace</h3>
              <p className="text-xs text-on-surface-variant">Switch between customer, vendor, rider, and admin roles</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 space-y-2 overflow-y-auto custom-scroll flex-1 pr-1">
          {workspaces.map(ws => {
            const Icon = ws.icon;
            return (
              <button
                key={ws.id}
                onClick={() => {
                  onSelectView(ws.id);
                  onClose();
                }}
                className="w-full p-3 rounded-xl border border-outline-variant/30 hover:border-primary text-left flex items-center justify-between hover:bg-surface-container-low transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ws.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                        {ws.title}
                      </h4>
                      {ws.badge && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          ws.badge.type === 'active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ws.badge.type === 'active' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          <span>{ws.badge.text}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant line-clamp-1">{ws.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-outline-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center text-[11px] text-on-surface-variant shrink-0">
          <span>Lokoja Confluence Mesh Online</span>
          <span className="font-semibold text-tertiary">All 8 Portals Active</span>
        </div>
      </div>
    </div>
  );
};
