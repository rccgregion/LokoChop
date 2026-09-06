import React, { useState } from 'react';
import { VendorRemittanceRecord, VendorUser } from '../types';
import { 
  CreditCard, 
  Building2, 
  Copy, 
  Check, 
  ShieldCheck, 
  X, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Lock,
  Download,
  Calendar,
  Zap
} from 'lucide-react';

interface VendorRemittanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorUser;
  outstandingBalance: number;
  onRemittanceSuccess: (record: VendorRemittanceRecord) => void;
}

export const VendorRemittanceModal: React.FC<VendorRemittanceModalProps> = ({
  isOpen,
  onClose,
  vendor,
  outstandingBalance,
  onRemittanceSuccess
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'card'>('transfer');
  const [remittanceAmount, setRemittanceAmount] = useState<number>(outstandingBalance);
  const [transferReference, setTransferReference] = useState<string>(
    `TRF-LK-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [accruedPeriod, setAccruedPeriod] = useState('Current Settlement Cycle (Sept 1 – Sept 6)');
  const [proofMemo, setProofMemo] = useState(`${vendor.bankName} NIP mobile transfer to Providus Bank`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<VendorRemittanceRecord | null>(null);

  if (!isOpen) return null;

  const corporateBank = {
    bankName: 'Providus Bank',
    accountNumber: '1029384756',
    accountName: 'LokoChop Technologies Ltd (Corporate Escrow)',
    sortCode: '101'
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(corporateBank.accountNumber).then(() => {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    });
  };

  const handleSubmitRemittance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remittanceAmount || remittanceAmount <= 0) {
      alert('Please enter a valid remittance amount');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newRecord: VendorRemittanceRecord = {
        id: `RMT-LK-${Math.floor(1000 + Math.random() * 9000)}`,
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        amount: remittanceAmount,
        accruedPeriod,
        reference: transferReference,
        paymentMethod: paymentMethod === 'transfer' ? 'Direct Bank Transfer' : 'Paystack Card/USSD',
        status: 'Verified & Settled',
        date: new Date().toLocaleDateString('en-GB', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        proofMemo
      };

      // Save to localStorage
      try {
        const saved = localStorage.getItem('lokochop_vendor_remittances');
        const list: VendorRemittanceRecord[] = saved ? JSON.parse(saved) : [];
        localStorage.setItem('lokochop_vendor_remittances', JSON.stringify([newRecord, ...list]));
      } catch {}

      onRemittanceSuccess(newRecord);
      setCompletedRecord(newRecord);
      setIsSubmitting(false);
    }, 800);
  };

  const handleDone = () => {
    setCompletedRecord(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-fade-in text-on-surface max-h-[92vh] overflow-y-auto custom-scroll">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline text-lg md:text-xl font-bold text-on-surface">
                Make App Share Remittance
              </h3>
              <p className="text-xs text-on-surface-variant">
                Remit platform commission ({vendor.commissionRate || 8.0}%) to LokoChop corporate account
              </p>
            </div>
          </div>
          <button
            onClick={handleDone}
            className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Completed Receipt Screen */}
        {completedRecord ? (
          <div className="space-y-5 py-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Remittance Verified &amp; Settled
              </span>
              <h4 className="font-headline text-2xl font-bold text-on-surface pt-2">
                ₦{completedRecord.amount.toLocaleString()} Remitted Successfully
              </h4>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                App share commission has been credited to LokoChop Corporate Escrow. Your kitchen account balance is cleared.
              </p>
            </div>

            {/* Official Digital Clearance Slip */}
            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20 text-left text-xs space-y-2.5 max-w-sm mx-auto font-mono">
              <div className="flex justify-between border-b border-outline-variant/15 pb-1">
                <span className="text-on-surface-variant">Receipt No</span>
                <span className="font-bold text-on-surface">{completedRecord.id}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/15 pb-1">
                <span className="text-on-surface-variant">Transfer Ref</span>
                <span className="font-bold text-primary truncate max-w-[170px]">{completedRecord.reference}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/15 pb-1">
                <span className="text-on-surface-variant">Kitchen</span>
                <span className="font-bold text-on-surface">{completedRecord.vendorName}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/15 pb-1">
                <span className="text-on-surface-variant">Beneficiary</span>
                <span className="font-bold text-on-surface">Providus Bank (1029384756)</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/15 pb-1">
                <span className="text-on-surface-variant">Cycle Period</span>
                <span className="font-bold text-on-surface">{completedRecord.accruedPeriod}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold text-sm pt-1">
                <span>Amount Remitted</span>
                <span>₦{completedRecord.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDone}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Close &amp; View Updated Ledger
              </button>
            </div>
          </div>
        ) : (
          /* Remittance Payment Form */
          <form onSubmit={handleSubmitRemittance} className="space-y-4 text-xs">
            
            {/* Outstanding Balance Banner */}
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-on-surface-variant font-medium block">
                  Current Accrued Commission Share Owed
                </span>
                <div className="font-headline text-2xl font-bold text-primary">
                  ₦{outstandingBalance.toLocaleString()}
                </div>
              </div>
              <span className="text-xs bg-surface-container px-2.5 py-1 rounded-full font-bold text-on-surface">
                Tier 1 Core ({(vendor.commissionRate || 8.0)}%)
              </span>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'transfer'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Direct Bank Transfer (NIP)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Card / USSD</span>
              </button>
            </div>

            {/* If Bank Transfer, show dedicated Corporate NUBAN Box */}
            {paymentMethod === 'transfer' ? (
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-on-surface-variant">
                    LokoChop Corporate Escrow Account
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Instant Clearance
                  </span>
                </div>

                <div className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">{corporateBank.bankName}</span>
                    <span className="font-mono text-base font-bold tracking-wider text-on-surface block">
                      {corporateBank.accountNumber}
                    </span>
                    <span className="text-[10px] text-on-surface-variant block truncate max-w-[220px]">
                      {corporateBank.accountName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Instant Paystack Online Gateway</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Debit your registered Mastercard, Verve, or Visa business card, or dial USSD shortcode directly from your bank.
                </p>
              </div>
            )}

            {/* Form Inputs */}
            <div className="space-y-3">
              
              {/* Remittance Amount */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface flex justify-between">
                  <span>Amount to Remit (₦) *</span>
                  <button
                    type="button"
                    onClick={() => setRemittanceAmount(outstandingBalance)}
                    className="text-primary hover:underline font-semibold text-[11px] cursor-pointer"
                  >
                    Pay Full Balance (₦{outstandingBalance.toLocaleString()})
                  </button>
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  value={remittanceAmount}
                  onChange={(e) => setRemittanceAmount(Number(e.target.value))}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-primary"
                />
              </div>

              {/* Transfer Reference */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Bank Transfer Reference / Session ID *</label>
                <input
                  type="text"
                  required
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder="e.g. TRF-LK-892147 or NIP Session ID"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-primary"
                />
              </div>

              {/* Settlement Cycle Period */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Settlement Period</label>
                <input
                  type="text"
                  value={accruedPeriod}
                  onChange={(e) => setAccruedPeriod(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs focus:outline-primary"
                />
              </div>

              {/* Memo Note */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Proof Memo / Notes</label>
                <input
                  type="text"
                  value={proofMemo}
                  onChange={(e) => setProofMemo(e.target.value)}
                  placeholder="e.g. First Bank app transfer reference confirmed"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs focus:outline-primary"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-3">
              <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant ledger reconciliation</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Recording Remittance...' : `Confirm Remittance (₦${remittanceAmount.toLocaleString()})`}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
