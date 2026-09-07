import React, { useState } from 'react';
import { VendorAddOn } from '../types';
import { 
  Sparkles, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  DollarSign, 
  Tag, 
  Info,
  X,
  Coffee,
  CheckCircle2
} from 'lucide-react';

interface VendorAddOnsManagerProps {
  vendorId: string;
  vendorName: string;
  addOns: VendorAddOn[];
  onToggleAvailability: (id: string) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
  onAddCustomAddOn: (newAddOn: Omit<VendorAddOn, 'id'>) => void;
  onDeleteCustomAddOn?: (id: string) => void;
}

export const VendorAddOnsManager: React.FC<VendorAddOnsManagerProps> = ({
  vendorId,
  vendorName,
  addOns,
  onToggleAvailability,
  onUpdatePrice,
  onAddCustomAddOn,
  onDeleteCustomAddOn
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'drink' | 'side' | 'extra'>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceInput, setTempPriceInput] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form for new custom add-on
  const [newAddOnForm, setNewAddOnForm] = useState({
    name: '',
    category: 'drink' as 'drink' | 'side' | 'extra',
    price: '',
    description: '',
    icon: '✨'
  });

  const filteredAddOns = addOns.filter(a => {
    if (activeCategoryFilter === 'all') return true;
    return a.category === activeCategoryFilter;
  });

  const activeCount = addOns.filter(a => a.available).length;
  const avgPrice = addOns.length > 0 
    ? Math.round(addOns.reduce((acc, a) => acc + a.price, 0) / addOns.length) 
    : 0;

  const handleStartEditPrice = (addOn: VendorAddOn) => {
    setEditingPriceId(addOn.id);
    setTempPriceInput(addOn.price.toString());
  };

  const handleSavePrice = (id: string) => {
    const parsed = parseInt(tempPriceInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdatePrice(id, parsed);
    }
    setEditingPriceId(null);
  };

  const handleCreateAddOn = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(newAddOnForm.price, 10);
    if (!newAddOnForm.name.trim() || isNaN(priceNum) || priceNum < 0) return;

    onAddCustomAddOn({
      name: newAddOnForm.name.trim(),
      category: newAddOnForm.category,
      price: priceNum,
      description: newAddOnForm.description.trim() || undefined,
      icon: newAddOnForm.icon || '✨',
      available: true
    });

    setNewAddOnForm({
      name: '',
      category: 'drink',
      price: '',
      description: '',
      icon: '✨'
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-headline text-lg md:text-xl font-bold text-on-surface flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>1-Click Upsell Add-Ons &amp; Pricing</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-200">
              {activeCount} Active in Cart
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
            These are instant drinks, sides, and extras shown inside customer shopping carts when ordering from <strong>{vendorName}</strong>. You control which add-ons you offer and your kitchen&apos;s custom selling prices.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Add-On</span>
        </button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-3.5 space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant block">Total Catalog</span>
          <span className="font-headline text-xl font-bold text-on-surface">{addOns.length} Items</span>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-3.5 space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant block">Offered to Buyers</span>
          <span className="font-headline text-xl font-bold text-emerald-700">{activeCount} Enabled</span>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-3.5 space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant block">Average Add-on Price</span>
          <span className="font-headline text-xl font-bold text-primary">₦{avgPrice.toLocaleString()}</span>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-3.5 space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant block">Expected Basket Boost</span>
          <span className="font-headline text-xl font-bold text-amber-700">+₦1,400 / Order</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Add-Ons', count: addOns.length },
          { id: 'drink', label: '🍷 Drinks & Beverages', count: addOns.filter(a => a.category === 'drink').length },
          { id: 'side', label: '🍌 Sides & Pastries', count: addOns.filter(a => a.category === 'side').length },
          { id: 'extra', label: '🍲 Extras & Sauces', count: addOns.filter(a => a.category === 'extra').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategoryFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeCategoryFilter === tab.id
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategoryFilter === tab.id ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Add-Ons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAddOns.map(addOn => {
          const isEditing = editingPriceId === addOn.id;

          return (
            <div
              key={addOn.id}
              className={`rounded-2xl border p-4 transition-all space-y-3 ${
                addOn.available 
                  ? 'bg-surface-container-lowest border-outline-variant/40 shadow-xs' 
                  : 'bg-surface-container-low/50 border-dashed border-outline-variant/40 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-surface-container-low shrink-0 select-none">
                    {addOn.icon || (addOn.category === 'drink' ? '🍷' : addOn.category === 'side' ? '🍌' : '🍲')}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-headline text-sm font-bold text-on-surface">
                        {addOn.name}
                      </h3>
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        addOn.category === 'drink'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : addOn.category === 'side'
                          ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {addOn.category}
                      </span>
                    </div>
                    {addOn.description && (
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">
                        {addOn.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Availability Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleAvailability(addOn.id)}
                  className={`p-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                    addOn.available 
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30' 
                      : 'text-on-surface-variant hover:text-on-surface bg-surface-container'
                  }`}
                  title={addOn.available ? 'Turn off (Do not offer)' : 'Turn on (Offer in cart)'}
                >
                  {addOn.available ? (
                    <ToggleRight className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-stone-400" />
                  )}
                </button>
              </div>

              {/* Price & Action Row */}
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-medium">Your Kitchen Price:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex items-center">
                        <span className="absolute left-2 text-xs font-bold text-on-surface-variant">₦</span>
                        <input
                          type="number"
                          value={tempPriceInput}
                          onChange={(e) => setTempPriceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSavePrice(addOn.id);
                            if (e.key === 'Escape') setEditingPriceId(null);
                          }}
                          className="w-24 pl-5 pr-2 py-1 text-xs font-bold rounded-lg bg-surface-container border border-primary focus:outline-primary"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => handleSavePrice(addOn.id)}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold cursor-pointer"
                        title="Save Price"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingPriceId(null)}
                        className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface text-xs font-bold cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="font-price-display font-bold text-sm text-primary">
                        ₦{addOn.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleStartEditPrice(addOn)}
                        className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        title="Change Price"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    addOn.available 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                      : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                  }`}>
                    {addOn.available ? 'Offered in Cart' : 'Not Offered'}
                  </span>

                  {onDeleteCustomAddOn && addOn.id.startsWith('custom-') && (
                    <button
                      onClick={() => onDeleteCustomAddOn(addOn.id)}
                      className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Remove Custom Add-on"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Cart Preview Callout */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
          <Eye className="w-4 h-4 text-amber-600" />
          <span>Live Customer Cart Synchronization</span>
        </div>
        <p className="text-on-surface-variant text-[11px] leading-relaxed">
          Whenever customers in Lokoja add food from <strong>{vendorName}</strong> to their cart, active items enabled above with your set prices appear in the <strong>&ldquo;1-Click Drinks &amp; Sides&rdquo;</strong> tray. Items marked as <em>Not Offered</em> will never be shown to customers.
        </p>
      </div>

      {/* Add Custom Add-On Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl border border-outline-variant/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-headline text-base font-bold text-on-surface flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>Add Custom Upsell Item</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAddOn} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Add-on Item Name:</label>
                <input
                  type="text"
                  value={newAddOnForm.name}
                  onChange={(e) => setNewAddOnForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Peppered Gizzard Skewer"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Category:</label>
                  <select
                    value={newAddOnForm.category}
                    onChange={(e) => setNewAddOnForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-primary cursor-pointer"
                  >
                    <option value="drink">🍷 Drink / Beverage</option>
                    <option value="side">🍌 Side / Pastry</option>
                    <option value="extra">🍲 Extra / Sauce</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-on-surface block mb-1">Price (₦ Naira):</label>
                  <input
                    type="number"
                    value={newAddOnForm.price}
                    onChange={(e) => setNewAddOnForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. 1200"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-primary"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Display Emoji / Icon:</label>
                <div className="flex gap-2">
                  {['🍹', '🍷', '🥤', '💧', '🍌', '🍲', '🍗', '🥗', '🥠', '✨'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewAddOnForm(prev => ({ ...prev, icon: emoji }))}
                      className={`text-lg p-1.5 rounded-lg border transition-all cursor-pointer ${
                        newAddOnForm.icon === emoji 
                          ? 'border-primary bg-primary/10 scale-110' 
                          : 'border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Short Description (Optional):</label>
                <textarea
                  value={newAddOnForm.description}
                  onChange={(e) => setNewAddOnForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Tender chicken gizzard slow-grilled with Confluence chili peppers."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Add-On
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
