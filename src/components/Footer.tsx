import React from 'react';
import { ActiveView } from '../types';
import { AppLogo } from './AppLogo';
import { Waves, Phone, ShieldCheck, Bike, FileText, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
  onOpenTermsModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTermsModal }) => {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface mt-auto border-t border-outline-variant/15 text-xs">
      <div className="w-full py-8 px-4 md:px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left: Brand Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2.5 mb-2">
            <AppLogo size="sm" />
            <span className="font-headline text-lg font-bold text-inverse-on-surface">LokoChop</span>
            <span className="text-outline">|</span>
            <span className="text-inverse-on-surface/80">Confluence food, delivered hot &amp; ready across Lokoja</span>
          </div>
          <p className="text-inverse-on-surface/70">
            &copy; 2026 LokoChop Technologies. From Paparanda Square to Lokongoma, Adankolo, and Felele corridors.
          </p>
        </div>

        {/* Quick Delivery Landmarks & Operational Links */}
        <div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2 text-xs font-medium items-center">
          <button 
            onClick={() => onNavigate('contact-us')} 
            className="hover:text-amber-300 hover:underline transition-colors cursor-pointer font-bold text-amber-200 flex items-center gap-1"
            title="Get in touch with LokoChop support, office location and helplines"
          >
            <Mail className="w-3.5 h-3.5 text-amber-300" />
            <span>Contact Us</span>
          </button>
          <button 
            onClick={() => onNavigate('about')} 
            className="hover:text-amber-300 hover:underline transition-colors cursor-pointer font-bold text-amber-200 flex items-center gap-1"
            title="Learn about the LokoChop logo, colors, and Confluence food heritage"
          >
            <span>About Us</span>
          </button>
          <button 
            onClick={() => onNavigate('rider-portal')} 
            className="hover:text-amber-300 hover:underline transition-colors cursor-pointer flex items-center gap-1 font-semibold text-amber-200"
            title="Confluence Rider Delivery Runs"
          >
            <Bike className="w-3.5 h-3.5 text-amber-300" />
            <span>Rider Dispatch</span>
          </button>
          <button 
            onClick={() => onNavigate('vendor-onboarding')} 
            className="hover:text-primary-fixed hover:underline transition-colors cursor-pointer font-bold text-amber-200"
          >
            Vendor Onboarding
          </button>
          <button 
            onClick={() => onNavigate('admin-portal')} 
            className="hover:text-amber-300 hover:underline transition-colors cursor-pointer flex items-center gap-1 font-semibold text-amber-200"
            title="LokoChop Administrative Command & Remittance Terminal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Admin HQ</span>
          </button>
          <button 
            onClick={() => onNavigate('order-history')} 
            className="hover:text-primary-fixed hover:underline transition-colors cursor-pointer"
          >
            Order History
          </button>
          <button 
            onClick={() => onNavigate('faqs-legal')} 
            className="hover:text-amber-300 hover:underline transition-colors cursor-pointer flex items-center gap-1 font-semibold text-amber-200"
            title="FAQs, 100% Cost Transparency, Terms & NDPR Privacy"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>FAQs &amp; Transparency</span>
          </button>
          {onOpenTermsModal && (
            <button 
              onClick={onOpenTermsModal} 
              className="hover:text-primary-fixed hover:underline transition-colors cursor-pointer flex items-center gap-1 text-white/90"
            >
              <span>Quick Terms</span>
            </button>
          )}
          <a 
            href="https://wa.me/2349074072454" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-fixed font-semibold underline hover:text-white transition-colors flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Support (+2349074072454)</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
