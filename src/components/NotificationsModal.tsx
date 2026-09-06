import React from 'react';
import { X, Fish, Bike, AlertCircle } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 max-w-md w-full p-6 shadow-xl text-on-surface">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            <h3 className="font-headline text-lg font-bold text-on-surface">Lokoja Kitchen Alerts</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <Fish className="w-4 h-4" />
              <span>Catfish Fresh Arrival</span>
            </div>
            <p className="text-on-surface-variant">
              Confluence Grill Point just brought in fresh river catfish batches for tonight&apos;s point &amp; kill.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-tertiary">
              <Bike className="w-4 h-4" />
              <span>Ganaja Road Dispatch Clear</span>
            </div>
            <p className="text-on-surface-variant">
              Riders reporting smooth transit along Ganaja flyover corridor. Standard 15m delivery active.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-secondary">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Dry Weather Dispatch Active</span>
            </div>
            <p className="text-on-surface-variant">
              Dry weather tariffs in effect across all 3 tiers. Normal base pricing applies.
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-secondary hover:bg-secondary/90 text-on-secondary rounded-lg font-semibold text-xs transition-colors cursor-pointer"
        >
          Dismiss Alerts
        </button>
      </div>
    </div>
  );
};
