import React, { useState } from 'react';
import { ActiveView } from '../types';
import { AppLogo } from '../components/AppLogo';
import { 
  Waves, 
  Flame, 
  Utensils, 
  MapPin, 
  ShieldCheck, 
  Bike, 
  Store, 
  CheckCircle2, 
  Heart, 
  Compass, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Banknote,
  Users,
  ChevronRight,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import appLogoSrc from '../assets/images/lokochop_logo_1788865254933.jpg';

interface AboutViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'symbolism' | 'palette' | 'mission'>('symbolism');

  // Brand Palette Definition directly extracted from the app's logo
  const brandPalette = [
    {
      name: 'Confluence Navy',
      hex: '#0E2A47',
      rgb: 'rgb(14, 42, 71)',
      role: 'Primary River Motif',
      description: 'Represents the majestic confluence of River Niger & River Benue wrapping around Lokoja.',
      bgClass: 'bg-[#0E2A47]',
      textClass: 'text-white',
      borderClass: 'border-[#0E2A47]'
    },
    {
      name: 'Woven Mortar Ochre',
      hex: '#B86B35',
      rgb: 'rgb(184, 107, 53)',
      role: 'Culinary Heritage & Wicker Texture',
      description: 'Carved wooden mortar bowls, pestles, and woven baskets honoring traditional Nigerian buka craft.',
      bgClass: 'bg-[#B86B35]',
      textClass: 'text-white',
      borderClass: 'border-[#B86B35]'
    },
    {
      name: 'Ata Rodo Red',
      hex: '#DC2626',
      rgb: 'rgb(220, 38, 38)',
      role: 'Fresh Heat & Kitchen Fires',
      description: 'The glossy scotch bonnet chili sitting inside the bowl—symbol of hot firewood spices & quick dispatch.',
      bgClass: 'bg-[#DC2626]',
      textClass: 'text-white',
      borderClass: 'border-[#DC2626]'
    },
    {
      name: 'Confluence Foam Ivory',
      hex: '#FAF4EB',
      rgb: 'rgb(250, 244, 235)',
      role: 'Smooth Ceramic Trim & Backgrounds',
      description: 'The sculpted cream rim defining the bowl contours—symbolizing cleanliness, fair trade, and transparency.',
      bgClass: 'bg-[#FAF4EB]',
      textClass: 'text-[#0E2A47]',
      borderClass: 'border-[#E2D4C3]'
    }
  ];

  const logoElements = [
    {
      title: 'The Oceanic Blue Wave',
      subtitle: 'Where Two Great Rivers Converge',
      icon: Waves,
      color: 'bg-[#0E2A47] text-white',
      badge: 'Confluence Water',
      body: 'Lokoja sits at the historic confluence where River Niger meets River Benue. The sweeping, fluid blue curves wrapping the base of the logo evoke this living watercourse, representing seamless multi-neighborhood logistics connecting Ganaja, Lokongoma, Paparanda, and Felele.'
    },
    {
      title: 'The Woven Mortar Bowl',
      subtitle: 'Artisanal Nigerian Buká Traditions',
      icon: Utensils,
      color: 'bg-[#B86B35] text-white',
      badge: 'Culinary Heart',
      body: 'Crafted with fine wicker texture and a warm wooden mortar contour, the bowl celebrates authentic cooking heritage. In Lokoja, true chop life begins in real kitchens—firewood Jollof, smooth pounded yam, and rich catfish peppersoup prepared daily by 10:00 AM.'
    },
    {
      title: 'The Fresh Ata Rodo Pepper',
      subtitle: 'Fire, Flavor & Piping Hot Thermal Delivery',
      icon: Flame,
      color: 'bg-[#DC2626] text-white',
      badge: 'Signature Heat',
      body: 'Resting proudly inside the bowl is a single fresh red Nigerian chili with its curved dark stem. It signals authentic heat, bold savor, and our ironclad Thermal Freshness Guarantee—food packed in double-insulated carriers so it arrives steaming at your doorstep.'
    }
  ];

  const coreMilestones = [
    { number: '14+', label: 'Verified Bukas & Fast Food Chains', desc: 'From Mama Ngozi to Craving Spot & Chicken Republic' },
    { number: '25', label: 'Delivery Neighborhoods', desc: 'Across Tier 1, Tier 2, and Tier 3 Lokoja corridors' },
    { number: '0%', label: 'Escrow & Wallet Lockups', desc: 'Customers transfer 100% directly to the kitchen bank account' },
    { number: '10:00 AM', label: 'Fresh Morning Pots Ready', desc: 'Pre-simmered meals with 2-hour WhatsApp inventory sync' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] pb-20">
      
      {/* 1. Grand Hero Section styled with the Confluence Navy & Woven Ochre Motif */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0E2A47] via-[#14355A] to-[#0A1D33] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 shadow-md">
        {/* Soft Confluence Water Wave Background Patterns */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1440 400" fill="none" preserveAspectRatio="none">
            <path d="M0,160 C320,300 420,0 740,160 C1060,320 1120,40 1440,160 L1440,400 L0,400 Z" fill="#B86B35" />
            <path d="M0,220 C320,120 540,320 860,180 C1180,40 1340,280 1440,220 L1440,400 L0,400 Z" fill="#DC2626" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/70 mb-6">
            <button 
              onClick={() => onNavigate('marketplace')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Marketplace
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <span className="text-amber-300 font-semibold">About LokoChop</span>
          </nav>

          {/* Top Pill / Confluence Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-200 mb-6 shadow-xs">
            <Waves className="w-3.5 h-3.5 text-amber-300" />
            <span>The Confluence Food Marketplace &bull; Lokoja, Kogi State</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Headline & Story Intro */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
                Food Born Where the <br />
                <span className="text-amber-300">Two Great Rivers</span> Meet.
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl">
                LokoChop is Lokoja&apos;s indigenous culinary network. We unite legendary firewood bukás, 
                artisan grills, and modern fast-food joints into a seamless ordering platform featuring direct vendor 
                bank transfers, multi-kitchen checkouts, and thermal-packed dispatch couriers.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Start Chopping Meals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('vendor-onboarding')}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/25 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
                >
                  <Store className="w-4 h-4 text-amber-300" />
                  <span>Register Your Kitchen</span>
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/15 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Direct Bank Settlement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Fair Walk-in Menu Rates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Confluence Express Couriers</span>
                </div>
              </div>
            </div>

            {/* Right: The Brand Logo Showcase Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-sm">
                
                {/* Glow & Backdrop Layer */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/30 via-red-500/20 to-sky-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500"></div>

                <div className="relative rounded-3xl bg-[#FAF4EB] border-2 border-amber-200/60 p-7 shadow-2xl text-[#0E2A47] flex flex-col items-center text-center">
                  
                  {/* Floating Logo Badge */}
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-white shadow-md border border-[#E8DCCB] p-2 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={appLogoSrc}
                      alt="LokoChop Official Brand Logo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain select-none"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </div>

                  <h3 className="font-headline text-2xl font-black tracking-tight text-[#0E2A47]">
                    Loko<span className="text-[#DC2626]">Chop</span>
                  </h3>
                  <p className="text-xs font-semibold text-[#B86B35] tracking-wide uppercase mt-0.5">
                    Confluence Culinary Identity
                  </p>

                  <p className="text-xs text-[#475569] mt-3 leading-relaxed">
                    A sculptured woven mortar bowl resting in deep confluence river waves, holding a fresh Nigerian hot chili pepper.
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#E8DCCB] w-full flex items-center justify-center gap-2 text-[11px] font-semibold text-[#0E2A47]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Official Lokoja Brand Mark &bull; 2026</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. Interactive Logo Anatomy & Color Story Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl border border-[#E2D8C9] shadow-sm p-6 sm:p-8">
          
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EFE5D5] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B86B35] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
                Brand Architecture &amp; Identity
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#0E2A47] mt-1">
                The Anatomy of the LokoChop Mark
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-xl">
                Every line, texture, and hue in the LokoChop logo was drawn directly from the geography and culinary culture of Lokoja.
              </p>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="flex rounded-xl bg-[#FAF4EB] p-1 border border-[#E8DCCB] text-xs font-semibold self-start md:self-auto shrink-0">
              <button
                onClick={() => setActiveTab('symbolism')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'symbolism' 
                    ? 'bg-[#0E2A47] text-white shadow-xs' 
                    : 'text-[#475569] hover:text-[#0E2A47]'
                }`}
              >
                Icon Symbolism
              </button>
              <button
                onClick={() => setActiveTab('palette')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'palette' 
                    ? 'bg-[#0E2A47] text-white shadow-xs' 
                    : 'text-[#475569] hover:text-[#0E2A47]'
                }`}
              >
                Color Palette
              </button>
              <button
                onClick={() => setActiveTab('mission')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'mission' 
                    ? 'bg-[#0E2A47] text-white shadow-xs' 
                    : 'text-[#475569] hover:text-[#0E2A47]'
                }`}
              >
                Confluence Mission
              </button>
            </div>
          </div>

          {/* Tab 1: Icon Symbolism */}
          {activeTab === 'symbolism' && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {logoElements.map((elem, idx) => {
                const IconComponent = elem.icon;
                return (
                  <div 
                    key={idx}
                    className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EAE0D2] hover:border-[#B86B35]/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-11 h-11 rounded-xl ${elem.color} flex items-center justify-center shadow-xs`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border border-[#E2D4C3] text-[#0E2A47]">
                          {elem.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-headline text-lg font-bold text-[#0E2A47]">
                          {elem.title}
                        </h3>
                        <p className="text-xs font-semibold text-[#B86B35]">
                          {elem.subtitle}
                        </p>
                      </div>

                      <p className="text-xs text-[#475569] leading-relaxed pt-1">
                        {elem.body}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#EAE0D2] flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>Symbol Component #{idx + 1}</span>
                      <span className="font-bold text-[#0E2A47]">100% Authentic</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Color Palette Swatches */}
          {activeTab === 'palette' && (
            <div className="mt-8 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {brandPalette.map((color, idx) => (
                  <div 
                    key={idx}
                    className="rounded-2xl border border-[#E5DACB] overflow-hidden bg-white shadow-2xs flex flex-col"
                  >
                    {/* Color Swatch Block */}
                    <div className={`h-24 ${color.bgClass} flex items-end p-3 relative`}>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/30 text-white backdrop-blur-xs">
                        {color.hex}
                      </span>
                    </div>

                    {/* Color Metadata */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-headline font-bold text-sm text-[#0E2A47]">
                          {color.name}
                        </h4>
                        <p className="text-[11px] font-medium text-[#B86B35]">
                          {color.role}
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-1.5 leading-snug">
                          {color.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#F1E8DC] text-[10px] font-mono text-[#94A3B8]">
                        {color.rgb}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Designer Note */}
              <div className="p-4 rounded-xl bg-[#FAF4EB] border border-[#E8DCCB] text-xs text-[#0E2A47] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0E2A47] text-white flex items-center justify-center shrink-0 font-bold">
                  🎨
                </div>
                <p className="leading-relaxed">
                  <strong>Color Theme Harmony:</strong> The Confluence Navy anchors the visual weight with institutional trustworthiness; Woven Ochre evokes earthenware and kitchen warmth; Ata Rodo Red drives appetite appeal; and Confluence Foam maintains readability across every screen.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Confluence Mission */}
          {activeTab === 'mission' && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0E2A47] to-[#14355A] text-white space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <Banknote className="w-5 h-5" />
                </div>
                <h4 className="font-headline font-bold text-base text-white">
                  Zero Customer Wallet Lockups
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  No hidden top-ups or stranded money. You pay via direct Nigerian mobile banking (NIP) straight into the restaurant&apos;s account.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#B86B35] to-[#964E1E] text-white space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Store className="w-5 h-5" />
                </div>
                <h4 className="font-headline font-bold text-base text-white">
                  True Walk-In Counter Prices
                </h4>
                <p className="text-xs text-amber-100 leading-relaxed">
                  Under the LokoChop Fair Trade Charter, partner restaurants are barred from inflating food prices online over walk-in counter rates.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#991B1B] text-white space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="font-headline font-bold text-base text-white">
                  Pots Ready by 10:00 AM
                </h4>
                <p className="text-xs text-red-100 leading-relaxed">
                  Morning soups, stews, and firewood proteins are simmered and hot early. Your order is portioned and sealed immediately—never cooked from cold scratch.
                </p>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* 3. The 4 Big Pillars of LokoChop */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B86B35]">
            Why Lokoja Loves LokoChop
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#0E2A47] mt-1">
            Built from the Ground Up for Confluence Food Culture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-5 rounded-2xl bg-white border border-[#E2D8C9] shadow-2xs hover:shadow-xs transition-shadow space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0E2A47]/10 text-[#0E2A47] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-base text-[#0E2A47]">
              Multi-Buka Cart
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Order Mama Ngozi&apos;s firewood Jollof, Craving Spot shawarma, and fresh fruit parfaits all in a single consolidated checkout.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E2D8C9] shadow-2xs hover:shadow-xs transition-shadow space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#B86B35]/10 text-[#B86B35] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-base text-[#0E2A47]">
              2-Hour Stock Sync
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              No disappointment over finished soups. Our automated WhatsApp stock synchronizer updates remaining portions every two hours.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E2D8C9] shadow-2xs hover:shadow-xs transition-shadow space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-base text-[#0E2A47]">
              100% Rider Tariff
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Confluence riders receive 100% of delivery fees with 0% platform commission deductions. Motivated riders deliver food faster.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E2D8C9] shadow-2xs hover:shadow-xs transition-shadow space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-base text-[#0E2A47]">
              Thermal Warmth Safe
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Tamper-evident seals and double-insulated courier packs guarantee your swallow and peppersoup arrive burning hot.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Numbers that Move Lokoja */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="rounded-3xl bg-[#0E2A47] text-white p-8 sm:p-10 shadow-md">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {coreMilestones.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="font-headline text-3xl sm:text-4xl font-black text-amber-300">
                  {item.number}
                </div>
                <div className="font-bold text-sm text-white">
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-300 leading-snug">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Confluence Neighborhood Footprint */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="bg-white rounded-3xl border border-[#E2D8C9] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B86B35]">
                Logistics &amp; Neighborhood Reach
              </span>
              <h2 className="font-headline text-2xl font-extrabold text-[#0E2A47] mt-0.5">
                Connecting All 3 Lokoja Delivery Tiers
              </h2>
            </div>

            <button
              onClick={() => onNavigate('neighborhoods')}
              className="px-4 py-2 rounded-xl bg-[#FAF4EB] hover:bg-[#F2E5D4] text-[#0E2A47] border border-[#E0D2C0] font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#B86B35]" />
              <span>Explore All 25 Zones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Tier 1 */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCB] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-sm text-[#0E2A47]">Tier 1: Central Lokoja</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ₦800 Flat
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Paparanda Square, Muritala Way, Post Office, Old Market, Marine Road, GRA, Kogi State Poly.
              </p>
              <div className="text-[11px] font-semibold text-[#0E2A47] pt-1">
                Avg ETA: 20–25 mins
              </div>
            </div>

            {/* Tier 2 */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCB] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-sm text-[#0E2A47]">Tier 2: Mid-City Hubs</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  ₦1,200 Flat
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Lokongoma Phase 1 &amp; Phase 2, Adankolo, 500 Housing Units, Army Barracks, Nataco Junction.
              </p>
              <div className="text-[11px] font-semibold text-[#0E2A47] pt-1">
                Avg ETA: 30–35 mins
              </div>
            </div>

            {/* Tier 3 */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DCCB] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-sm text-[#0E2A47]">Tier 3: Express Corridors</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  ₦1,600 Flat
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Felele / FULokoja Permanent Site, Ganaja Village, Crusher / Abuja Road, Zango Daji, Confluence Beach.
              </p>
              <div className="text-[11px] font-semibold text-[#0E2A47] pt-1">
                Avg ETA: 40–50 mins
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Call to Action Footer Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E2A47] via-[#163B61] to-[#0A1D33] text-white p-8 sm:p-12 text-center shadow-lg">
          
          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <AppLogo size="lg" className="mx-auto mb-2" />

            <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Ready to Chop Life in Lokoja?
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Explore our 14 certified local restaurants, build your multi-kitchen cart, and enjoy genuine Confluence hospitality delivered straight to your door.
            </p>

            <div className="pt-3 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Utensils className="w-4 h-4" />
                <span>Explore Today&apos;s Hot Pots</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('faqs-legal')}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-all cursor-pointer"
              >
                Cost Transparency &amp; FAQs
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
