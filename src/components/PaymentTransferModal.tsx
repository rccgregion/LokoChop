import React, { useState } from 'react';
import { AppLogo } from './AppLogo';
import { 
  LiveOrder, 
  buildVendorWhatsAppUrl, 
  buildVendorSpecificWhatsAppUrl,
  buildSupportWhatsAppUrl, 
  LOKOCHOP_SUPPORT_WHATSAPP 
} from '../services/orderService';
import { 
  CheckCircle2, 
  MessageCircle, 
  Clock, 
  ExternalLink, 
  ArrowRight,
  Copy,
  Check,
  Store,
  Bike,
  AlertCircle,
  Layers,
  MapPin
} from 'lucide-react';

interface PaymentTransferModalProps {
  order: LiveOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToTracking: () => void;
}

export const PaymentTransferModal: React.FC<PaymentTransferModalProps> = ({
  order,
  isOpen,
  onClose,
  onProceedToTracking
}) => {
  const [copiedAccountKey, setCopiedAccountKey] = useState<string | null>(null);
  const [sentVendors, setSentVendors] = useState<Record<string, boolean>>({});
  const [checkedTransfers, setCheckedTransfers] = useState<Record<string, boolean>>({});
  const [supportWhatsAppSent, setSupportWhatsAppSent] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedAccountKey(key);
    setTimeout(() => setCopiedAccountKey(null), 2000);
  };

  const toggleCheckedTransfer = (key: string) => {
    setCheckedTransfers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isMultiVendor = Boolean(order.isMultiVendor && order.vendorShares && order.vendorShares.length > 1);
  const supportWhatsAppUrl = buildSupportWhatsAppUrl(order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-surface-container-lowest w-full max-w-lg rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-700 text-white p-5 sm:p-6 text-center relative">
          <div className="absolute top-4 left-4">
            <AppLogo size="xs" />
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-white animate-bounce" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest bg-emerald-800/80 px-3 py-1 rounded-full text-emerald-100 font-bold inline-block mb-1">
            {isMultiVendor ? 'Multi-Kitchen Transfer Logged' : 'Transfer Confirmed by Customer'}
          </span>
          <h2 className="font-headline text-2xl font-bold">Order #{order.id} Logged</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto">
            {isMultiVendor 
              ? `Payment confirmed across ${order.vendorShares?.length} different Lokoja kitchens.`
              : 'Payment has been marked as transferred from your mobile banking app.'}
          </p>
        </div>

        {/* 3-Step Micro-Timeline Reassurance */}
        <div className="bg-surface-container-low px-5 py-3 border-b border-outline-variant/30">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mb-1">
                ✓
              </span>
              <span className="font-bold text-on-surface">1. Transferred</span>
              <span className="text-[9px] text-on-surface-variant">From your bank</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center mb-1 animate-pulse">
                2
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-300">2. Alert Reconcile</span>
              <span className="text-[9px] text-on-surface-variant">Avg 2–3 mins</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant font-bold flex items-center justify-center mb-1">
                3
              </span>
              <span className="font-bold text-on-surface">3. Warm Packaging</span>
              <span className="text-[9px] text-on-surface-variant">Pots ready since 10am</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scroll space-y-4 text-on-surface">
          
          {/* Lokoja Ready Pots Notice */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5">
            <span className="text-base">🍲</span>
            <div className="text-[11px] leading-relaxed">
              <strong className="text-amber-900 dark:text-amber-300 block">Pots Ready in Food Warmers (Since 10:00 AM)</strong>
              Kitchens do not cook your food from scratch. As soon as credit confirms, vendors simply ladle and seal tamper-evident packaging in 3–7 minutes!
            </div>
          </div>
          
          {/* Multi-Vendor vs Single-Vendor Transfer Summary */}
          {isMultiVendor && order.vendorShares ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <Layers className="w-4 h-4" />
                  <span>Kitchens Credited ({order.vendorShares.length})</span>
                </span>
                <span className="text-primary font-price-display font-bold">
                  Total: ₦{order.totalAmount.toLocaleString()}
                </span>
              </div>

              {order.vendorShares.map((share, idx) => {
                const vendorTotal = share.totalPayableShare || (share.subtotal + (share.packagingFeeShare ?? 250) + (share.dispatchFeeShare ?? 0));
                return (
                  <div 
                    key={share.vendorId} 
                    className="p-3.5 rounded-2xl bg-surface-container-low border-2 border-outline-variant/30 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between pb-1.5 border-b border-outline-variant/20">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-on-surface">
                          <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{share.vendorName}</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span>{share.locationName || 'Lokoja Pickup'}</span>
                          {share.isSharedLocation && (
                            <span className="text-emerald-600 font-bold text-[9px] ml-1">
                              [Shared Stop]
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-on-surface-variant uppercase font-bold block">Transferred</span>
                        <span className="font-price-display font-bold text-sm text-primary">
                          ₦{vendorTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Granular Breakdown */}
                    <div className="bg-surface-container p-2 rounded-xl text-[10px] space-y-0.5 text-on-surface-variant">
                      <div className="flex justify-between">
                        <span>Food Subtotal ({share.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}):</span>
                        <strong className="text-on-surface">₦{share.subtotal.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Packaging Share:</span>
                        <strong className="text-on-surface">₦{(share.packagingFeeShare ?? 250).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Location Dispatch Share:</span>
                        <strong className="text-on-surface">₦{(share.dispatchFeeShare ?? 0).toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-on-surface-variant font-medium">Bank:</span>
                        <strong className="text-on-surface">{share.bankDetails.bankName}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-on-surface-variant font-medium">Account Name:</span>
                        <span className="text-on-surface font-semibold truncate max-w-[180px]">{share.bankDetails.accountName}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                        <span className="text-on-surface-variant font-medium">Account Number:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-primary">{share.bankDetails.accountNumber}</span>
                          <button
                            onClick={() => handleCopy(share.bankDetails.accountNumber, `share-${idx}`)}
                            className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="Copy account number"
                          >
                            {copiedAccountKey === `share-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Transfer Completion Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleCheckedTransfer(share.vendorId)}
                      className={`w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        checkedTransfers[share.vendorId] 
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Check className={`w-3.5 h-3.5 ${checkedTransfers[share.vendorId] ? 'text-emerald-600' : 'text-outline-variant'}`} />
                        <span>{checkedTransfers[share.vendorId] ? 'Transferred in bank app' : 'Mark as transferred'}</span>
                      </span>
                      <span className="font-mono text-[10px]">₦{vendorTotal.toLocaleString()}</span>
                    </button>
                  </div>
                );
              })}

              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
                <span className="flex items-center gap-1.5 font-bold text-on-surface">
                  <Bike className="w-4 h-4 text-primary" />
                  <span>Grand Total (Food + Location Dispatch + Packaging):</span>
                </span>
                <span className="font-price-display font-black text-sm text-primary">
                  ₦{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            /* Single Vendor Summary Card */
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Vendor Credited</span>
                <span className="text-xs font-bold text-primary">{order.vendorName}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/20">
                <span className="text-on-surface-variant">Bank Name:</span>
                <strong className="text-on-surface">{order.bankDetails.bankName}</strong>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Account Name:</span>
                <span className="text-on-surface font-medium">{order.bankDetails.accountName}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Account Number:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-on-surface">{order.bankDetails.accountNumber}</span>
                  <button
                    onClick={() => handleCopy(order.bankDetails.accountNumber, 'single')}
                    className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    title="Copy account number"
                  >
                    {copiedAccountKey === 'single' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/20">
                <span className="text-on-surface-variant font-bold">Total Transferred:</span>
                <span className="font-price-display font-bold text-base text-primary">
                  ₦{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Prompt to send WhatsApp Messages */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚡ Express WhatsApp Speed-Up (Optional)</span>
              </div>
              <span className="text-[9px] bg-amber-500/20 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                Optional
              </span>
            </div>
            <p className="text-on-surface-variant text-[11px] leading-relaxed">
              <strong>Stay on app or notify via WhatsApp?</strong> You can proceed directly to <strong>&ldquo;Live Order Tracking&rdquo;</strong> below. Kitchens check incoming mobile alerts automatically. However, tapping below to dispatch your receipt on WhatsApp helps fast-track verification even quicker!
            </p>
          </div>

          {/* WhatsApp Actions */}
          <div className="space-y-2">
            {isMultiVendor && order.vendorShares ? (
              order.vendorShares.map((share, idx) => {
                const url = buildVendorSpecificWhatsAppUrl(order, share);
                const isSent = sentVendors[share.vendorId];
                return (
                  <div key={share.vendorId} className="space-y-1">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSentVendors(prev => ({ ...prev, [share.vendorId]: true }))}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Notify Kitchen {idx + 1}: {share.vendorName}</span>
                      </div>
                      {isSent ? (
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Sent
                        </span>
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                    </a>
                  </div>
                );
              })
            ) : (
              <div className="space-y-1.5">
                <a
                  href={buildVendorWhatsAppUrl(order)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSentVendors(prev => ({ ...prev, [order.vendorId]: true }))}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline text-sm font-bold shadow-md active:scale-98 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-5 h-5" />
                    <span>1. Notify Vendor ({order.vendorName})</span>
                  </div>
                  {sentVendors[order.vendorId] ? (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Dispatched
                    </span>
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </a>
                <p className="text-[10px] text-on-surface-variant px-1">
                  Direct message to vendor phone ({order.vendorPhone || 'Registered Line'}) with your exact order breakdown.
                </p>
              </div>
            )}

            {/* Central Support Dispatch Alert */}
            <div className="space-y-1 pt-1">
              <a
                href={supportWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSupportWhatsAppSent(true)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-headline text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-between cursor-pointer border border-stone-700"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Notify Central Dispatch ({LOKOCHOP_SUPPORT_WHATSAPP})</span>
                </div>
                {supportWhatsAppSent ? (
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Sent
                  </span>
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
              </a>
              <p className="text-[10px] text-on-surface-variant px-1">
                Central LokoChop Confluence Support line for rider coordination and multi-kitchen collection.
              </p>
            </div>
          </div>

          {/* Vendor Verification Status Note */}
          <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 flex items-start gap-2.5 text-xs text-on-surface-variant">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold text-on-surface block">Waiting for Kitchen Credit Verification</span>
              Once payments are verified in the vendor mobile apps, their kitchen dashboards indicate prep progress and dispatch timing!
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/30 bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-colors cursor-pointer"
          >
            Close Window
          </button>

          <button
            onClick={onProceedToTracking}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to Live Order Tracking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
