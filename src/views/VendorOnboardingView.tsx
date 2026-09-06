import React, { useState } from 'react';
import { ActiveView } from '../types';
import { 
  Store, 
  MapPin, 
  CreditCard, 
  ChefHat, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  ShieldCheck, 
  Phone, 
  MessageCircle,
  Clock
} from 'lucide-react';

interface VendorOnboardingViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const VendorOnboardingView: React.FC<VendorOnboardingViewProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    bukaName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    landmark: 'Paparanda Junction',
    tier: 'tier1',
    bankName: 'First Bank of Nigeria',
    accountNumber: '',
    accountName: '',
    specialtyDishes: '',
    averageMealPrice: '2500',
    canPackThermal: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(s => s + 1);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 pb-20">
      
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-on-surface-variant text-xs">
        <button onClick={() => onNavigate('marketplace')} className="hover:text-primary transition-colors cursor-pointer">
          Marketplace
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-primary font-semibold">Kitchen Onboarding Portal</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-6 md:p-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <Store className="w-4 h-4" />
          <span>Lokoja Merchant Partnership</span>
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
          Join LokoChop: Put Your Food on Every Table in Lokoja
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-2xl">
          Direct customer bank remittances to your account, instant rider dispatch, and transparent low commission rates. Onboarding takes 4 minutes with same-day verification.
        </p>

        {/* 4 Step Visual Wizard */}
        <div className="grid grid-cols-4 gap-2 pt-6 border-t border-outline-variant/20 text-xs">
          {[
            { num: 1, title: 'Identity & Spot' },
            { num: 2, title: 'Bank Remittance' },
            { num: 3, title: 'Menu Offerings' },
            { num: 4, title: 'Terms & Submit' }
          ].map(s => (
            <div 
              key={s.num}
              className={`p-2 rounded-lg border text-center transition-all ${
                step === s.num
                  ? 'bg-primary text-white border-primary font-bold shadow-xs'
                  : step > s.num
                  ? 'bg-surface-container-high text-tertiary border-tertiary/40 font-semibold'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30'
              }`}
            >
              <span className="block text-[10px] uppercase">Step {s.num}</span>
              <span className="text-xs hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {submitted ? (
        /* Submission Success Screen */
        <div className="bg-surface-container-lowest rounded-2xl border-2 border-tertiary/30 p-8 text-center space-y-5 shadow-lg animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="font-headline text-2xl font-bold text-on-surface">Application Submitted Successfully!</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Your kitchen application for <strong>{formData.bukaName || "Your Kitchen"}</strong> has been logged into the LokoChop Master Administration queue.
            </p>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl max-w-md mx-auto text-xs text-left space-y-2 border border-outline-variant/20">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Lokoja Landmark:</span>
              <strong className="text-on-surface">{formData.landmark}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Direct Remittance Bank:</span>
              <strong className="text-on-surface">{formData.bankName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Review Standard:</span>
              <span className="text-tertiary font-bold">4-Hour Fast Track</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="https://wa.me/2349074072454?text=Hello%20LokoChop%20Admin,%20I%20just%20submitted%20my%20kitchen%20onboarding%20application."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-tertiary text-on-tertiary font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Speed up on WhatsApp (+2349074072454)</span>
            </a>
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-6 py-3 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-colors cursor-pointer"
            >
              Return to Marketplace
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <form onSubmit={handleNext} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 md:p-8 space-y-6 shadow-xs">
          
          {/* STEP 1: Kitchen Identity & Spot */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" /> Step 1: Kitchen Identity &amp; Physical Location
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Kitchen or Buka Brand Name *</label>
                  <input
                    type="text"
                    name="bukaName"
                    required
                    placeholder="e.g. Mama Funke Delight Spot"
                    value={formData.bukaName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-xs focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Head Chef or Manager Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    required
                    placeholder="e.g. Funke Oladipo"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-xs focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. 0803 987 6543"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-xs focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Nearest Lokoja Landmark Corridor *</label>
                  <select
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-xs focus:border-primary outline-none"
                  >
                    <option value="Paparanda Junction">Paparanda Junction (Tier 1 Core)</option>
                    <option value="Lokongoma Phase 1 & 2">Lokongoma Phase 1 &amp; 2 (Tier 1 Core)</option>
                    <option value="GRA / Hospital Road">GRA / Hospital Road (Tier 1 Core)</option>
                    <option value="Adankolo Market">Adankolo Market Axis (Tier 1 Core)</option>
                    <option value="Ganaja Junction / Flyover">Ganaja Junction / Flyover (Tier 1 Core)</option>
                    <option value="Sarkin Noma / Zone 8">Sarkin Noma / Zone 8 Secretariat (Tier 2)</option>
                    <option value="Nataco / Felele Campus">Nataco / Felele Expressway (Tier 3)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-on-surface">Physical Address / Description</label>
                  <textarea
                    name="address"
                    rows={2}
                    placeholder="e.g. Opposite State High Court gate, Paparanda Square, Lokoja"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-xs focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Direct Bank Remittance Details */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-secondary" /> Step 2: Direct Bank Remittance Setup
              </h2>
              <p className="text-xs text-on-surface-variant">
                LokoChop never holds your food revenue in escrow. Customers transfer directly to your designated bank account at checkout.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Bank Name *</label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-xs focus:border-primary outline-none"
                  >
                    <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                    <option value="Guaranty Trust Bank (GTB)">Guaranty Trust Bank (GTB)</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="Fidelity Bank">Fidelity Bank</option>
                    <option value="Kuda Microfinance Bank">Kuda Microfinance Bank</option>
                    <option value="OPay">OPay</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">10-Digit NUBAN Account Number *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    required
                    maxLength={10}
                    placeholder="e.g. 3089421570"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-xs font-mono focus:border-primary outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-on-surface">Exact Account Name on Bank Record *</label>
                  <input
                    type="text"
                    name="accountName"
                    required
                    placeholder="e.g. Ngozi Amaka Ventures or Funke Oladipo Enterprise"
                    value={formData.accountName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-xs focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Signature Dishes & Menu Offerings */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-tertiary" /> Step 3: Signature Dishes &amp; Specialties
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-on-surface">Top Signature Dishes (Separate with commas) *</label>
                  <textarea
                    name="specialtyDishes"
                    required
                    rows={3}
                    placeholder="e.g. Smoky Party Jollof, Confluence River Point & Kill Catfish, Amala with Gbegiri & Ewedu, Grilled Goat Suya"
                    value={formData.specialtyDishes}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-xs focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Average Meal Portion Price (₦)</label>
                  <input
                    type="number"
                    name="averageMealPrice"
                    value={formData.averageMealPrice}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface text-xs focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Packaging Readiness</label>
                  <div className="p-3 bg-surface-container rounded-lg flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="packCheck"
                      checked={formData.canPackThermal}
                      onChange={e => setFormData(f => ({ ...f, canPackThermal: e.target.checked }))}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <label htmlFor="packCheck" className="text-on-surface font-medium cursor-pointer">
                      I have takeaway foil packs &amp; spill-proof soup bowls
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review, Terms & Submit */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Step 4: Review &amp; Onboarding Agreement
              </h2>

              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 text-xs space-y-2">
                <h3 className="font-bold text-on-surface font-headline text-sm">Summary of Information</h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-on-surface-variant">Buka Name:</span> <strong>{formData.bukaName || "N/A"}</strong></div>
                  <div><span className="text-on-surface-variant">Contact:</span> <strong>{formData.phone || "N/A"}</strong></div>
                  <div><span className="text-on-surface-variant">Landmark Corridor:</span> <strong>{formData.landmark}</strong></div>
                  <div><span className="text-on-surface-variant">Bank Account:</span> <strong>{formData.bankName} ({formData.accountNumber})</strong></div>
                </div>
              </div>

              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant space-y-2">
                <h4 className="font-bold text-on-surface">LokoChop Vendor Standards</h4>
                <ul className="list-disc list-inside space-y-1 leading-relaxed">
                  <li>Direct bank transfer verification must happen within 10 minutes of notification.</li>
                  <li>Food must be fresh, hot, and hygienically packed in spill-resistant containers.</li>
                  <li>Platform commission is invoiced transparently at 8% on bi-weekly cycles.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>{step === 4 ? 'Submit Vendor Application' : 'Proceed to Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
