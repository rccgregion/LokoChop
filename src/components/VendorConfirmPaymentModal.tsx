import React, { useState } from 'react';
import { LiveOrder } from '../services/orderService';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Flame, 
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';

interface VendorConfirmPaymentModalProps {
  order: LiveOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, prepEtaMins: number) => void;
}

export const VendorConfirmPaymentModal: React.FC<VendorConfirmPaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [selectedEta, setSelectedEta] = useState<number>(30);
  const [customEta, setCustomEta] = useState<string>('');
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [hasVerifiedBankAlert, setHasVerifiedBankAlert] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEta = useCustom ? (parseInt(customEta, 10) || 30) : selectedEta;
    setIsSubmitting(true);

    setTimeout(() => {
      onConfirm(order.id, finalEta);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const etaOptions = [
    { mins: 15, label: '15 mins', desc: 'Express snacks / Ready pot' },
    { mins: 25, label: '25 mins', desc: 'Standard fresh cook' },
    { mins: 35, label: '35 mins', desc: 'Fresh swallow / Grilled meat' },
    { mins: 50, label: '50 mins', desc: 'Extensive fresh platter / Rush' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-surface-container-lowest w-full max-w-lg rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full font-bold inline-block">
              Vendor Direct Credit Verification
            </span>
            <h2 className="font-headline text-xl sm:text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
              <span>Confirm Order #{order.id} Payment</span>
            </h2>
            <p className="text-xs text-white/80">
              Verify customer transfer and set estimated preparation &amp; delivery time.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto custom-scroll space-y-4 text-on-surface">
          
          {/* Order & Credit Details */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Customer</span>
              <span className="text-xs font-bold text-on-surface">{order.customerName} ({order.customerPhone})</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Destination:</span>
              <span className="text-on-surface font-medium truncate max-w-[200px]">{order.destination}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Credited Bank:</span>
              <span className="text-on-surface font-semibold">{order.bankDetails.bankName} (#{order.bankDetails.accountNumber})</span>
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">Amount Credited:</span>
              <span className="font-price-display text-xl font-bold text-primary">
                ₦{order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Section: Delivery Duration Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>How long before food gets to the customer?</span>
              </label>
              <span className="text-[11px] font-bold text-primary">
                {useCustom ? `${customEta || 30} mins` : `${selectedEta} mins`}
              </span>
            </div>
            
            <p className="text-[11px] text-on-surface-variant">
              This countdown will be displayed live on the customer&apos;s order tracking screen.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {etaOptions.map(opt => (
                <button
                  type="button"
                  key={opt.mins}
                  onClick={() => { setSelectedEta(opt.mins); setUseCustom(false); }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    !useCustom && selectedEta === opt.mins
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{opt.label}</span>
                    {!useCustom && selectedEta === opt.mins && (
                      <Flame className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Custom Minutes Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setUseCustom(!useCustom)}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{useCustom ? '← Use standard presets' : 'Enter custom delivery duration (minutes)'}</span>
              </button>

              {useCustom && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={customEta}
                    onChange={(e) => setCustomEta(e.target.value)}
                    placeholder="e.g. 40"
                    className="w-24 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-sm font-bold text-on-surface text-center focus:outline-primary"
                    required
                  />
                  <span className="text-xs text-on-surface-variant font-medium">
                    minutes before delivery to customer
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Verification Confirmation Checkbox */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="bankAlertCheckbox"
              checked={hasVerifiedBankAlert}
              onChange={(e) => setHasVerifiedBankAlert(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="bankAlertCheckbox" className="text-xs text-on-surface leading-relaxed cursor-pointer select-none">
              <strong>I confirm credit received:</strong> I have checked my <strong>{order.bankDetails.bankName}</strong> mobile bank alert or statement and confirmed the credit of <strong>₦{order.totalAmount.toLocaleString()}</strong>.
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!hasVerifiedBankAlert || isSubmitting}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Flame className="w-4 h-4 text-white" />
              <span>
                {isSubmitting ? 'Confirming...' : `Confirm Payment & Start Cooking (${useCustom ? customEta || 30 : selectedEta}m ETA)`}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
