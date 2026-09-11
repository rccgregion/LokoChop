import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, X } from 'lucide-react';
import { ActiveView } from '../types';

interface CookieConsentBannerProps {
  onNavigate?: (view: ActiveView) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('lokochop_cookie_consent');
      if (!consent) {
        // Short delay for natural presentation
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore local storage error in sandboxes
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('lokochop_cookie_consent', JSON.stringify({
        essential: true,
        analytics: true,
        preferences: true,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('lokochop_cookie_consent', JSON.stringify({
        essential: true,
        analytics: false,
        preferences: false,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      id="cookie-consent-notification"
      role="region"
      aria-label="Cookie and Privacy Consent Notification"
      className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-in"
    >
      <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl border border-outline-variant/40 p-4 sm:p-5 shadow-xl text-on-surface space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                Cookies &amp; Local Storage Consent
              </h4>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                NDPR &amp; Privacy Compliant
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container cursor-pointer transition-colors"
            title="Dismiss with Essential Only"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          LokoChop uses essential cookies and client storage to keep your food cart active, remember your delivery neighborhood in Lokoja, and secure direct-transfer payouts with verified bukás.
        </p>

        {showDetails && (
          <div className="p-2.5 rounded-xl bg-surface-container text-[11px] space-y-1.5 text-on-surface-variant animate-fade-in">
            <div className="flex items-center justify-between">
              <span><strong>Essential:</strong> Chop cart &amp; checkout</span>
              <span className="text-emerald-700 font-bold">Always Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span><strong>Preferences:</strong> Lokoja zone &amp; theme</span>
              <span className="text-primary font-bold">Included</span>
            </div>
            <div className="flex items-center justify-between">
              <span><strong>No Ads:</strong> We never sell personal data</span>
              <span className="text-emerald-700 font-bold">Guaranteed</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-primary hover:underline font-semibold cursor-pointer py-1"
          >
            {showDetails ? 'Hide Details' : 'Manage Preferences'}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant/30 transition-all cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept All</span>
            </button>
          </div>
        </div>

        {onNavigate && (
          <div className="text-[10px] text-center pt-0.5 border-t border-outline-variant/20 text-on-surface-variant">
            Read our{' '}
            <button
              type="button"
              onClick={() => onNavigate('faqs-legal')}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              Privacy Policy &amp; Terms
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
