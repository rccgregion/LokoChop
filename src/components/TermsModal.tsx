import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Lock, 
  CheckCircle2, 
  HelpCircle, 
  Building2, 
  Clock, 
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { LOKOCHOP_SUPPORT_WHATSAPP } from '../services/orderService';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'bank_policy' | 'ndpr_privacy' | 'refund_guarantee'>('bank_policy');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 max-w-2xl w-full p-6 shadow-xl text-on-surface max-h-[85vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">
                LokoChop Legal, Transfer &amp; Privacy Terms
              </h2>
              <p className="text-xs text-on-surface-variant">
                Direct Nigerian Bank Transfer Policy &bull; NDPR Compliance &bull; Kogi Fair Trade
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            aria-label="Close legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-outline-variant/20 py-3 shrink-0 overflow-x-auto custom-scroll text-xs">
          <button
            onClick={() => setActiveTab('bank_policy')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'bank_policy'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Direct Transfer Policy
          </button>
          <button
            onClick={() => setActiveTab('ndpr_privacy')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'ndpr_privacy'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
            }`}
          >
            NDPR Privacy &amp; Data Security
          </button>
          <button
            onClick={() => setActiveTab('refund_guarantee')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'refund_guarantee'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Refunds &amp; Spillage Guarantee
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="py-4 overflow-y-auto custom-scroll text-xs text-on-surface space-y-4 pr-1">
          
          {activeTab === 'bank_policy' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                <span className="font-headline font-bold text-sm text-primary flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> 1. Real Vendor Settlement Account Verification
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  LokoChop operates a zero-card-compromise policy. Customers pay directly into verified business accounts held at Central Bank of Nigeria (CBN) licensed commercial banks (First Bank, GTBank, Zenith, Access, UBA, Moniepoint, OPay). All vendor accounts undergo rigorous manual phone and CAC/NIN verification before onboarding.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                <span className="font-headline font-bold text-sm text-primary flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> 2. The 10-Minute Reservation Window
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  When you initiate a checkout, your food portions are placed on exclusive 10-minute hold with the kitchen. Once you make the transfer from your banking app, tap &quot;I Have Transferred to Vendor&quot; to notify the cook immediately. If a network delay occurs on the interbank NIP switch, the vendor&apos;s kitchen manager cross-checks their SMS alert or bank statement within 5 minutes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                <span className="font-headline font-bold text-sm text-primary flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> 3. Transparent Order Identification
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  Always use your designated Order Number (e.g. #LK-4092) in the narration of your bank transfer. This allows automated receipt reconciliation and prevents misallocated payments.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ndpr_privacy' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                <span className="font-headline font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" /> 1. NDPR &amp; NITDA Compliance
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  In compliance with the Nigeria Data Protection Regulation (NDPR 2019) and Nigeria Data Protection Act (NDPA 2023), LokoChop Technologies collects only minimal data necessary for order delivery: customer name, Nigerian phone number, and delivery street address/landmark in Lokoja.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                <span className="font-headline font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 2. Rider &amp; Vendor Access Restrictions
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  Riders receive your phone number and landmark solely for the duration of the active delivery run. We never sell, rent, or lease customer contact information to third-party marketing brokers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                <span className="font-headline font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 3. Data Deletion &amp; Rights
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  Any customer may request immediate scrubbing of their delivery address or past order records by contacting our Data Protection Officer via our Lokoja WhatsApp desk at +2349074072454.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'refund_guarantee' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                <span className="font-headline font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 1. Confluence Heat &amp; Spillage Shield
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  All soups (Ofe Nsala, Ogbono, Egusi, Bitterleaf) are double-bagged and heat-sealed. In the rare event that a courier encounters a pothole along the Meme bridge or Ganaja corridor causing container damage, contact the Dispute Desk within 15 minutes of handover for an immediate remake or 100% refund.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                <span className="font-headline font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> 2. 5-Minute WhatsApp Resolution Guarantee
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  No endless email tickets. Our human operations lead stationed in Lokoja reviews transaction proofs and liaises directly with the vendor kitchen to resolve any debit issue in under 5 minutes.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <a
            href={`https://wa.me/${LOKOCHOP_SUPPORT_WHATSAPP.replace(/\D/g, '')}?text=Hello%20LokoChop%20Legal%20Desk,%20I%20have%20a%20question%20about%20the%20transfer%20and%20privacy%20terms`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5 text-tertiary" />
            <span>Chat with Legal &amp; Compliance Lead ({LOKOCHOP_SUPPORT_WHATSAPP})</span>
          </a>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            I Understand &amp; Agree
          </button>
        </div>

      </div>
    </div>
  );
};
