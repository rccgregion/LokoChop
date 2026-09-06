import React, { useState } from 'react';
import { ShieldCheck, X, FileText, Lock, AlertCircle, Phone, Scale } from 'lucide-react';
import { LOKOCHOP_SUPPORT_WHATSAPP } from '../services/orderService';

interface TermsAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'payment_terms' | 'ndpr_privacy' | 'dispute_rules'>('payment_terms');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-on-surface text-xs">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-on-surface">
                Legal Notice, Payment Terms &amp; NDPR Privacy
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                LokoChop Confluence Food Platform &bull; Kogi State, Nigeria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-outline-variant/20 px-5 pt-3 gap-3 bg-surface-container-low text-xs">
          <button
            onClick={() => setActiveTab('payment_terms')}
            className={`pb-2.5 font-bold transition-all cursor-pointer border-b-2 ${
              activeTab === 'payment_terms'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Direct Payment Policy
          </button>
          <button
            onClick={() => setActiveTab('ndpr_privacy')}
            className={`pb-2.5 font-bold transition-all cursor-pointer border-b-2 ${
              activeTab === 'ndpr_privacy'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            NDPR Privacy &amp; Data
          </button>
          <button
            onClick={() => setActiveTab('dispute_rules')}
            className={`pb-2.5 font-bold transition-all cursor-pointer border-b-2 ${
              activeTab === 'dispute_rules'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Dispute Resolution
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 leading-relaxed text-on-surface-variant custom-scroll">
          
          {activeTab === 'payment_terms' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-300">
                <span className="font-bold block text-xs">Zero-In-App-Payment Model:</span>
                LokoChop operates strictly on a direct peer-to-peer bank transfer basis. No payments, debit cards, or bank credentials are ever captured or processed on LokoChop servers.
              </div>

              <h4 className="font-headline font-bold text-sm text-on-surface">1. Transfer Protocol</h4>
              <p>
                When you finalize your cart, the total amount payable (food items + neighborhood dispatch fee + packaging) is displayed alongside the verified bank details of the kitchen fulfilling your meal. You make an authentic NIP transfer directly using your bank&apos;s mobile app or USSD (*737#, *894#, *966#, etc.).
              </p>

              <h4 className="font-headline font-bold text-sm text-on-surface">2. Verification Responsibility</h4>
              <p>
                Customers are strictly required to double-check the recipient account name, account number, and bank before approving the transfer. Vendors are notified immediately via WhatsApp and dashboard alerts, and will verify their mobile bank alerts before lighting the burners.
              </p>

              <h4 className="font-headline font-bold text-sm text-on-surface">3. Dispatch Fees</h4>
              <p>
                All Confluence delivery fees are fixed based on verified Lokoja geographic zones (Tier 1: Central Lokoja / Paparanda, Tier 2: Mid-distance Lokongoma / Felele, Tier 3: Ganaja / Zango / Crusher) ensuring fair compensation for bike riders in Kogi State.
              </p>
            </div>
          )}

          {activeTab === 'ndpr_privacy' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-300">
                <span className="font-bold block text-xs">NDPR (Nigeria Data Protection Regulation) Compliant:</span>
                Your personal details (name, delivery address, and phone number) are processed solely for the fulfillment of your food delivery.
              </div>

              <h4 className="font-headline font-bold text-sm text-on-surface">1. Data Minimization</h4>
              <p>
                LokoChop does not request or store BVN, credit/debit card numbers, ATM PINs, or banking passwords. We only hold the phone number and delivery location needed by the rider to navigate Lokoja streets.
              </p>

              <h4 className="font-headline font-bold text-sm text-on-surface">2. Vendor &amp; Rider Contact</h4>
              <p>
                Your phone number is shared with the specific vendor and dispatch rider assigned to your order to coordinate delivery arrival at your gate or landmark.
              </p>

              <h4 className="font-headline font-bold text-sm text-on-surface">3. Data Retention &amp; Erasure</h4>
              <p>
                You may at any time request the erasure of your historical orders or contact details by contacting the LokoChop Privacy Desk.
              </p>
            </div>
          )}

          {activeTab === 'dispute_rules' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-on-surface">
                <span className="font-bold block text-xs text-primary">Confluence Mediation Desk:</span>
                In the rare event of a delayed bank reversal or unfulfilled food order, LokoChop mediation officers arbitrate between the customer and vendor.
              </div>

              <h4 className="font-headline font-bold text-sm text-on-surface">1. Bank Reversal Inquiries</h4>
              <p>
                If your bank debits your account but the vendor does not receive the credit within 15 minutes, please take a screenshot of your bank debit session ID or receipt.
              </p>

              <h4 className="font-headline font-bold text-sm text-on-surface">2. Direct Escalation</h4>
              <p>
                Reach out immediately to LokoChop Support via WhatsApp at <strong>{LOKOCHOP_SUPPORT_WHATSAPP}</strong> with your Order ID (#LK-XXXX) and debit session ID. Our team will verify the transfer with the bank&apos;s NIP portal.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>Hotline: <strong>+234 907 407 2454</strong> (Available 8:00 AM – 10:00 PM Daily)</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container">
          <span className="text-[11px] text-on-surface-variant">
            Last Updated: March 2026 &bull; Lokoja, Kogi State
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition-transform"
          >
            I Understand &amp; Agree
          </button>
        </div>

      </div>
    </div>
  );
};
