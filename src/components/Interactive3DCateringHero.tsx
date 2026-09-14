import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, ChefHat, ChevronRight, X, Sparkles } from 'lucide-react';

interface Interactive3DCateringHeroProps {
  whatsAppUrl: string;
}

export const Interactive3DCateringHero: React.FC<Interactive3DCateringHeroProps> = ({
  whatsAppUrl,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isDismissed) return null;

  return (
    <section 
      id="event-catering-promo"
      aria-label="Event & Bulk Catering Service"
      className="w-full max-w-7xl mx-auto px-3.5 sm:px-4 md:px-6"
    >
      <div className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-r from-stone-50 via-white to-amber-50/40 p-3.5 sm:p-4 shadow-xs transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left summary info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <ChefHat className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-md">
                  Catering Hotline
                </span>
                <span className="text-xs font-bold text-stone-900 truncate">
                  Hosting an Event or Feeding a Crowd in Lokoja?
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 truncate sm:max-w-xl">
                Get custom party trays, bulk jollof pots & corporate lunch boxes delivered hot on schedule.
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer hidden md:inline-flex items-center gap-1"
            >
              <span>{isExpanded ? 'Less info' : 'View details'}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>

            <motion.a
              id="catering-whatsapp-cta-btn"
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              title="Chat on WhatsApp (+2349074072454)"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white text-white shrink-0" />
              <span>WhatsApp Inquiry</span>
            </motion.a>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              title="Dismiss catering promo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Details Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-stone-200/70 text-xs text-stone-600 space-y-2"
            >
              <p>
                From weddings and corporate workshops to church conferences and family gatherings across Lokoja (GRA, Lokongoma, Ganaja, Felele), we coordinate with certified Confluence chefs to guarantee verified food safety, thermal food warmers, and punctual delivery.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-medium text-stone-700 pt-1">
                <span className="px-2.5 py-1 bg-white rounded-md border border-stone-200/80">✓ Custom Menu Planning</span>
                <span className="px-2.5 py-1 bg-white rounded-md border border-stone-200/80">✓ Punctual Metro-Wide Dispatch</span>
                <span className="px-2.5 py-1 bg-white rounded-md border border-stone-200/80">✓ Tiered Bulk Discounts</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

