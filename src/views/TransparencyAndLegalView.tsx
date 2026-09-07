import React, { useState } from 'react';
import { ActiveView } from '../types';
import { 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Lock, 
  Scale, 
  Layers, 
  DollarSign, 
  CheckCircle2, 
  Bike, 
  Store, 
  Phone, 
  AlertTriangle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { LOKOCHOP_SUPPORT_WHATSAPP } from '../services/orderService';

interface TransparencyAndLegalViewProps {
  onNavigate: (view: ActiveView) => void;
  defaultTab?: 'faqs' | 'transparency' | 'terms' | 'privacy' | 'refunds' | 'vendor_sla';
}

export const TransparencyAndLegalView: React.FC<TransparencyAndLegalViewProps> = ({
  onNavigate,
  defaultTab = 'faqs'
}) => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'transparency' | 'terms' | 'privacy' | 'refunds' | 'vendor_sla'>(defaultTab);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Interactive Fee Calculator State
  const [simulatedFoodAmount, setSimulatedFoodAmount] = useState<number>(3500);
  const [simulatedKitchenCount, setSimulatedKitchenCount] = useState<number>(2);

  const calculatedBaseDispatch = 800;
  const calculatedMultiSurcharge = simulatedKitchenCount > 1 ? (simulatedKitchenCount - 1) * 450 : 0;
  const calculatedPackaging = simulatedKitchenCount * 250;
  const calculatedTotal = simulatedFoodAmount + calculatedBaseDispatch + calculatedMultiSurcharge + calculatedPackaging;

  const faqs = [
    {
      q: 'How does multi-vendor ordering work and why does it affect delivery fees?',
      category: 'Ordering & Delivery',
      a: `At LokoChop, you are never restricted to ordering from only one restaurant at a time! You can mix and match freshly cooked dishes from up to 7 or more separate kitchens across Lokoja in a single checkout.
      
      Because each kitchen operates from a distinct physical location across Lokoja (e.g., Paparanda Square, Ganaja Junction, Lokongoma, Adankolo, Sarkin Noma, Crusher, Felele, Nataco), dispatch riders must traverse specific routes to collect your hot meals before delivering to your specified destination.
      
      Key Dispatch & Multi-Vendor Rules:
      1. Location-Specific Tariff: Dispatch fees are computed based on the pickup location's tier (Tier 1 Core Urban ₦800, Tier 2 Mid-Range ₦1,200, Tier 3 Peripheral Highway ₦2,000) and travel distance to your chosen neighborhood.
      2. Shared Location Discount: If two or more of your chosen vendors operate in the SAME commercial hub or neighborhood (e.g., Ganaja Junction or Paparanda Square), the dispatch stop is consolidated into ONE stop, saving you an extra dispatch charge!
      3. 100% Direct Multi-Vendor Payment: In the cart, you can view the exact breakdown, bank details (Bank Name, Account Name, Account Number), and direct WhatsApp receipt button for EACH vendor involved in your order.`
    },
    {
      q: 'Why does LokoChop use direct bank transfer instead of an in-app wallet or card lockup?',
      category: 'Payments & Transparency',
      a: `Traditional food delivery apps lock customer funds in digital wallets or delay vendor payouts for 7 to 14 days, which cripples the daily working capital of local restaurant owners and bukas.
      
      LokoChop is 100% zero-wallet and 100% direct-to-vendor. When you place an order, you transfer directly from your Nigerian banking app (GTBank, OPay, First Bank, Zenith, Kuda, PalmPay, etc.) into the verified bank account of the food vendor. The money arrives in their account in real time, with 0% platform delay. Vendors love cooking for LokoChop customers because they receive their funds immediately!`
    },
    {
      q: 'What are the Lokoja Delivery Tiers and dispatch timing standards?',
      category: 'Delivery & Logistics',
      a: `Lokoja is divided into three geographical dispatch tiers:
      • Tier 1 Core (Post Office, Paparanda, Lokongoma, Adankolo, GRA): 20–35 minutes average delivery.
      • Tier 2 Extended Corridor (Felele, Ganaja Road, Crusher, Zone 8, Secretariat): 35–45 minutes average delivery.
      • Tier 3 Outer Confluence Transit (Nataco, Zango Daji, Federal University Lokoja Felele Campus, Salem University corridor): 45–60 minutes average delivery.
      
      Every order comes with real-time countdown status and rider tracking so you know exactly when your meal is bubbling on the stove, sealed in the box, and en route.`
    },
    {
      q: 'Are food prices higher on LokoChop than walk-in restaurant prices?',
      category: 'Pricing Transparency',
      a: `Strictly NO. Under the LokoChop Fair Trade Charter, verified vendors are contractually prohibited from inflating their menu prices above their walk-in counter prices. If a portion of Goat Meat Jollof costs ₦3,400 inside Mama Ngozi's dining hall, it must cost exactly ₦3,400 on LokoChop. We protect our customers from predatory price gouging.`
    },
    {
      q: 'How does the voluntary vendor remittance work?',
      category: 'Vendor Operations',
      a: `Because customers transfer 100% of the food price directly to the vendor's bank account, LokoChop holds zero customer money. Instead, at the end of each weekly cycle, verified vendors voluntarily remit a modest 5% to 8.5% platform maintenance share from their generated sales. 
      
      This remittance funds server hosting, cloud database infrastructure, Termii SMS gateways, and 24/7 WhatsApp dispatch dispatchers. Vendors who maintain a 100% remittance record receive 'Approved Confluence Kitchen' gold tier badges and priority menu placement.`
    },
    {
      q: 'What happens if my food arrives spilled, damaged, or incomplete?',
      category: 'Customer Protection & Refunds',
      a: `We guarantee 100% customer satisfaction under our Confluence Food Guarantee. If an item arrives spilled, cold due to rider delay, or missing:
      1. Take a quick photo of the delivered packaging within 10 minutes of arrival.
      2. Click the 'Report Dispute' or 'WhatsApp Support' link (+2349074072454).
      3. Our Confluence resolution team will immediately contact the vendor and rider to either dispatch an express replacement dish or issue a direct bank transfer refund to your personal account within 30 minutes.`
    },
    {
      q: 'How are dispatch riders assigned and compensated?',
      category: 'Logistics',
      a: `Our fleet of Confluence dispatch riders operate fuel-efficient motorcycles equipped with heavy-duty insulated thermal delivery boxes and tamper-proof security locks. 
      
      Riders receive 100% of the base dispatch fee (₦800) plus 100% of any multi-vendor pickup surcharge (₦450 per additional kitchen). Unlike multinational gig apps, LokoChop takes 0% cut of the rider's delivery fee, ensuring our riders take exceptional care of your hot food.`
    },
    {
      q: 'Why does delivery happen so fast? Is food cooked from scratch or ready in warmers?',
      category: 'Kitchen Operations & Freshness',
      a: `In Lokoja's traditional and modern food culture, morning cooking batches of authentic Nigerian soups (Egusi, Ogbono, Bitterleaf, Ewedu, Gbegiri, Seafood Catfish), party jollof, fried rice, and swallows are prepared and bubbling in commercial kitchen warmers by 10:00 AM each day.
      
      Because the bulk pots are already hot and ready, orders do NOT require 45 minutes of cooking from raw ingredients. Kitchen staff only need 3 to 7 minutes to portion your meal, pack steaming meats, and heat-seal your leak-proof container into insulated thermal packaging before handoff to your dispatch rider.`
    },
    {
      q: 'How does LokoChop ensure an item is still available and not sold out when I order?',
      category: 'Stock & Menu Accuracy',
      a: `To prevent the frustration of ordering a soup only to be told it is finished, LokoChop operates an automated 2-Hourly WhatsApp Stock Synchronizer. 
      
      Every day at 10:00 AM, 12:00 PM, 2:00 PM, 4:00 PM, 6:00 PM, and 8:00 PM, Central Dispatch sends a direct WhatsApp prompt to each restaurant manager's registered phone line. Vendors confirm their remaining pot portions or mark finished dishes as 'Sold Out' in 1 tap on their Vendor Hub console. Any finished dish is instantly hidden or disabled across the LokoChop customer menu.`
    },
    {
      q: 'How do I register my restaurant or become an approved dispatch rider?',
      category: 'Partnerships',
      a: `Click 'Vendor Onboarding' in the top navigation bar or footer. You can submit your kitchen details, CAC registration or food hygiene permit, menu items, and bank account for verification. Our local Lokoja team conducts an in-person physical kitchen inspection within 24 to 48 hours before activating your live storefront.`
    }
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col">
      {/* Hero Header */}
      <section className="bg-surface-container py-10 md:py-14 border-b border-outline-variant/30 px-4 md:px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Open &amp; Transparent Operations</span>
            </span>
            <span className="text-xs text-on-surface-variant hidden sm:inline">&bull; Kogi State Fair Trade Charter</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight">
            FAQs, Legal Policies &amp; Cost Transparency
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant mt-3 max-w-2xl leading-relaxed">
            Everything you need to know about our multi-vendor logistics, direct Nigerian bank transfer protocol, NDPR data privacy, and fair pricing commitments.
          </p>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 custom-scroll text-xs">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'faqs'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Frequently Asked Questions</span>
            </button>

            <button
              onClick={() => setActiveTab('transparency')}
              className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'transparency'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>100% Cost &amp; Fee Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'terms'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Terms of Service</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>NDPR Privacy Policy</span>
            </button>

            <button
              onClick={() => setActiveTab('refunds')}
              className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'refunds'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Refunds &amp; Dispute Policy</span>
            </button>

            <button
              onClick={() => setActiveTab('vendor_sla')}
              className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'vendor_sla'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Vendor Remittance &amp; Hygiene SLA</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-10 flex-1">
        
        {/* TAB 1: FAQS */}
        {activeTab === 'faqs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
              <div>
                <h2 className="font-headline text-2xl font-bold text-on-surface">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Clear, honest answers about our Lokoja food marketplace operations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/2349074072454?text=${encodeURIComponent('Hello LokoChop Team, I have a question not answered in the FAQs')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ask on WhatsApp (+2349074072454)</span>
                </a>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div 
                    key={index}
                    className={`rounded-2xl border transition-all ${
                      isOpen 
                        ? 'bg-surface-container-low border-primary/40 shadow-xs' 
                        : 'bg-surface-container border-outline-variant/30 hover:border-outline-variant/60'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
                          {faq.category}
                        </span>
                        <h3 className="font-headline font-bold text-sm sm:text-base text-on-surface">
                          {faq.q}
                        </h3>
                      </div>
                      <div className={`p-1.5 rounded-full bg-surface-container-high shrink-0 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/15 whitespace-pre-line">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: 100% COST & FEE BREAKDOWN */}
        {activeTab === 'transparency' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                100% Transparent Fee Calculator &amp; Financial Model
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Zero hidden markups, zero predatory wallet lockups. See exactly how every single kobo is distributed.
              </p>
            </div>

            {/* Interactive Fee Breakdown Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Controls Column */}
              <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-surface-container border border-outline-variant/30 space-y-5">
                <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Order Cost Simulator</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-on-surface flex justify-between mb-1.5">
                      <span>Simulated Food Order Value:</span>
                      <span className="font-mono text-primary font-bold">₦{simulatedFoodAmount.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="20000"
                      step="500"
                      value={simulatedFoodAmount}
                      onChange={(e) => setSimulatedFoodAmount(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-on-surface-variant">
                      <span>₦1,000 (Snack)</span>
                      <span>₦10,000</span>
                      <span>₦20,000 (Family Feast)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface flex justify-between mb-1.5">
                      <span>Number of Separate Kitchens:</span>
                      <span className="font-mono text-primary font-bold">
                        {simulatedKitchenCount} Kitchen{simulatedKitchenCount > 1 ? 's' : ''}
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((count) => (
                        <button
                          key={count}
                          onClick={() => setSimulatedKitchenCount(count)}
                          className={`py-2 text-xs rounded-xl font-bold cursor-pointer transition-all ${
                            simulatedKitchenCount === count
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {count} {count === 1 ? 'Kitchen' : 'Kitchens'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-xs space-y-1 text-on-surface-variant">
                  <span className="font-bold text-on-surface block">Lokoja Dispatch Rule:</span>
                  <p className="text-[11px] leading-relaxed">
                    Primary kitchen dispatch is fixed at ₦800 across Lokoja. When multiple kitchens are selected, each additional kitchen stop incurs a ₦450 multi-pickup surcharge, 100% paid to the rider.
                  </p>
                </div>
              </div>

              {/* Output Visualization Column */}
              <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                  <h3 className="font-headline font-bold text-base text-on-surface">
                    Real-Time Transparent Allocation
                  </h3>
                  <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    Total: ₦{calculatedTotal.toLocaleString()}
                  </span>
                </div>

                {/* Breakdown Cards */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-on-surface">
                        <Store className="w-4 h-4 text-emerald-600" />
                        <span>100% to Kitchen Owners (Direct Bank Transfer)</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Goes directly into the verified bank account of the food vendor(s) in real time.
                      </p>
                    </div>
                    <span className="font-price-display text-base font-bold text-emerald-600">
                      ₦{simulatedFoodAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-on-surface">
                        <Bike className="w-4 h-4 text-amber-600" />
                        <span>100% to Confluence Dispatch Rider</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Base fee ₦{calculatedBaseDispatch} {calculatedMultiSurcharge > 0 && `+ ₦${calculatedMultiSurcharge} multi-pickup surcharge`}. Rider keeps every kobo.
                      </p>
                    </div>
                    <span className="font-price-display text-base font-bold text-amber-600">
                      ₦{(calculatedBaseDispatch + calculatedMultiSurcharge).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-on-surface">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span>Food Packaging &amp; Thermal Seal Boxes</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        ₦250 per kitchen for certified leak-proof packaging and tamper-evident seals.
                      </p>
                    </div>
                    <span className="font-price-display text-base font-bold text-primary">
                      ₦{calculatedPackaging.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Comparison Callout */}
                <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>How LokoChop Protects You vs. Other Food Apps</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-on-surface-variant pt-1">
                    <div className="p-2.5 rounded-xl bg-surface-container-lowest">
                      <strong className="text-emerald-700 dark:text-emerald-300 block mb-0.5">✓ LokoChop Model</strong>
                      Zero hidden service fees. Direct bank payments. 100% walk-in counter menu price parity.
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-lowest">
                      <strong className="text-error block mb-0.5">✗ Traditional Delivery Apps</strong>
                      15%-30% vendor commission leading to inflated menus. ₦500 wallet withdrawal fees. 14-day vendor payment lockups.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TERMS OF SERVICE */}
        {activeTab === 'terms' && (
          <div className="space-y-6 max-w-4xl animate-fade-in text-on-surface leading-relaxed text-xs sm:text-sm">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Legal Document &bull; Version 2.4</span>
              <h2 className="font-headline text-2xl font-bold text-on-surface mt-1">
                LokoChop Terms of Service &amp; User Agreement
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Effective Date: January 1, 2026 &bull; Governing Law: Kogi State &amp; Federal Republic of Nigeria
              </p>
            </div>

            <div className="space-y-5 bg-surface-container p-6 rounded-3xl border border-outline-variant/30">
              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">1. Acceptance of Terms</h3>
                <p className="text-on-surface-variant">
                  By using the LokoChop platform (web application, PWA, or related dispatch coordination services), you agree to comply with and be bound by this Agreement. If you do not agree to these terms, you may not place orders or use the platform.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">2. The Direct Nigerian Bank Transfer Protocol</h3>
                <p className="text-on-surface-variant">
                  LokoChop operates as an open, decentralised culinary marketplace connecting customers with independent restaurant operators and Confluence dispatch couriers in Lokoja. When you place an order, you transfer funds directly from your personal banking institution to the verified bank account of the food vendor or dedicated multi-vendor clearing account. LokoChop does not retain or hold custody of customer funds.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">3. Multi-Vendor Orders &amp; Delivery Fee Calculation</h3>
                <p className="text-on-surface-variant">
                  Customers are entitled to select menu items from multiple different kitchens in a single checkout. When multiple vendors are selected:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
                  <li>The base delivery fee (₦800) covers courier dispatch to the primary vendor.</li>
                  <li>A multi-pickup surcharge of ₦450 per additional distinct kitchen stop is added to the delivery fee.</li>
                  <li>Insulated takeaway packaging (₦250) is charged per kitchen to guarantee food safety and heat retention.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">4. Order Verification &amp; Preparation SLA</h3>
                <p className="text-on-surface-variant">
                  Upon completing a direct bank transfer, the customer must submit payment proof by clicking the confirmation action in the app and alerting the vendor via WhatsApp. The vendor is obligated to verify their mobile banking app for the corresponding credit alert and update the kitchen preparation status within 5 minutes of receipt.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">5. Cancellation &amp; Modifications</h3>
                <p className="text-on-surface-variant">
                  Because fresh food is prepared to order, cancellations are only accepted if the kitchen has not yet commenced cooking (within 5 minutes of payment confirmation). Once cooking or packaging has begun, orders cannot be cancelled.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* TAB 4: NDPR PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 max-w-4xl animate-fade-in text-on-surface leading-relaxed text-xs sm:text-sm">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Privacy &amp; Compliance &bull; NDPR 2019</span>
              <h2 className="font-headline text-2xl font-bold text-on-surface mt-1">
                Nigeria Data Protection Regulation (NDPR) Privacy Policy
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Last Updated: January 2026 &bull; Compliant with Nigeria Data Protection Commission (NDPC) Guidelines
              </p>
            </div>

            <div className="space-y-5 bg-surface-container p-6 rounded-3xl border border-outline-variant/30">
              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">1. What Information We Collect</h3>
                <p className="text-on-surface-variant">
                  LokoChop adheres strictly to the data minimization principle. We collect ONLY information essential for food preparation and delivery fulfillment:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
                  <li><strong>Customer Name:</strong> To identify order recipient.</li>
                  <li><strong>Phone Number:</strong> For WhatsApp payment receipt alerts and rider delivery coordination.</li>
                  <li><strong>Delivery Landmark / Address:</strong> To route the Confluence dispatch motorcycle to your doorstep in Lokoja.</li>
                  <li><strong>Order History:</strong> Stored locally on your device (localStorage) and in secure Google Cloud Firestore for tracking.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">2. Zero Payment Card Storage</h3>
                <p className="text-on-surface-variant">
                  LokoChop NEVER collects, stores, processes, or transmits credit card numbers, CVVs, or online banking PINs. All payments are executed entirely within your own banking app.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">3. Zero Selling of Personal Data</h3>
                <p className="text-on-surface-variant">
                  We NEVER sell, monetize, rent, or trade your personal contact details to third-party marketing companies, advertisers, or loan apps. Your phone number is strictly shared with the food vendor and assigned courier for the active delivery run.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">4. Your NDPR Rights (Access &amp; Erasure)</h3>
                <p className="text-on-surface-variant">
                  Under the NDPR, you possess the right to access your stored data and request immediate permanent erasure of your order records from our systems. You can trigger data clearance at any time by messaging support at <a href="https://wa.me/2349074072454" className="text-primary font-bold underline">+2349074072454</a>.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* TAB 5: REFUNDS & DISPUTES */}
        {activeTab === 'refunds' && (
          <div className="space-y-6 max-w-4xl animate-fade-in text-on-surface leading-relaxed text-xs sm:text-sm">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Customer Protection &bull; 100% Peace of Mind</span>
              <h2 className="font-headline text-2xl font-bold text-on-surface mt-1">
                Confluence Food Guarantee &amp; Dispute Resolution Policy
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Fast, fair resolution within 30 minutes of delivery.
              </p>
            </div>

            <div className="space-y-5 bg-surface-container p-6 rounded-3xl border border-outline-variant/30">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-on-surface leading-relaxed">
                  <strong>The 100% Fresh Delivery Promise:</strong> If your order arrives cold due to rider delay, damaged or spilled during bike transit, or missing key items, you are entitled to an immediate replacement dish or direct bank refund.
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">1. The 10-Minute Reporting Window</h3>
                <p className="text-on-surface-variant">
                  To ensure complaints are legitimate and freshness can be audited, customers must report any issues within 10 minutes of receiving their package from the rider.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">2. How to File a Dispute</h3>
                <ol className="list-decimal pl-5 space-y-1.5 text-on-surface-variant">
                  <li>Take a clear photo of the delivered meal package showing the spill or missing item.</li>
                  <li>Click 'WhatsApp Support' in the app (<a href="https://wa.me/2349074072454" className="text-primary underline">+2349074072454</a>).</li>
                  <li>Send your Order ID (e.g. #LK-4092) along with the photo.</li>
                  <li>Our central dispatch coordinator immediately audits the delivery run and contacts the vendor.</li>
                </ol>
              </section>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">3. Refund Processing Time</h3>
                <p className="text-on-surface-variant">
                  Approved refunds are sent via direct NIP bank transfer directly to the customer's bank account within 30 minutes of verification.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* TAB 6: VENDOR REMITTANCE & HYGIENE SLA */}
        {activeTab === 'vendor_sla' && (
          <div className="space-y-6 max-w-4xl animate-fade-in text-on-surface leading-relaxed text-xs sm:text-sm">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Vendor Operations &bull; Standards &amp; Remittance</span>
              <h2 className="font-headline text-2xl font-bold text-on-surface mt-1">
                Vendor Remittance Policy &amp; Food Safety Standards
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Clear rules ensuring fair trade, food quality, and sustainable platform maintenance.
              </p>
            </div>

            <div className="space-y-5 bg-surface-container p-6 rounded-3xl border border-outline-variant/30">
              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">1. Voluntary 5% - 8.5% Weekly Remittance</h3>
                <p className="text-on-surface-variant">
                  Because LokoChop does not deduct fees at source (customers pay 100% directly to the kitchen), vendors maintain a ledger on their Vendor Hub. Every Monday, vendors voluntarily remit the platform share:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
                  <li><strong>Tier 1 Core Vendors:</strong> 7.5% weekly remittance.</li>
                  <li><strong>Tier 2 Extended Vendors:</strong> 6.0% weekly remittance.</li>
                  <li><strong>Tier 3 Rural/Outlying Vendors:</strong> 5.0% weekly remittance.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-headline font-bold text-base text-on-surface">2. Mandatory Hygiene &amp; Packaging Standards</h3>
                <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
                  <li>All soups and gravies must be packaged in double-sealed food containers to prevent transit leakage.</li>
                  <li>Meals must remain at minimum 65°C when handed to the Confluence dispatch courier.</li>
                  <li>Cooks and kitchen staff must wear hair nets, gloves, and clean aprons during food preparation.</li>
                  <li>LokoChop field auditors conduct monthly surprise spot-inspections across all approved kitchens in Lokoja.</li>
                </ul>
              </section>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Floating Navigation Back to Marketplace */}
      <div className="sticky bottom-0 bg-surface-container/90 backdrop-blur-md border-t border-outline-variant/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant hidden sm:inline">Ready to order?</span>
            <span className="text-xs font-bold text-on-surface">Explore authentic Lokoja kitchens</span>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <span>Back to Food Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
