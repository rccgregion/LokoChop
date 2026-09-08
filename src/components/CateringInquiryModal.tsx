import React, { useState } from 'react';
import { CateringInquiry } from '../types';
import { INITIAL_CATERING_INQUIRIES } from '../data/reviewsAndInquiries';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Send,
  Building2,
  DollarSign,
  UtensilsCrossed,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface CateringInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  vendorPhone?: string;
  onInquirySubmitted?: (inquiry: CateringInquiry) => void;
}

export const CateringInquiryModal: React.FC<CateringInquiryModalProps> = ({
  isOpen,
  onClose,
  vendorId,
  vendorName,
  vendorPhone = '+2349074072454',
  onInquirySubmitted
}) => {
  const [submittedInquiry, setSubmittedInquiry] = useState<CateringInquiry | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [eventType, setEventType] = useState('Corporate Workshop / Zone 8 Secretariat');
  const [guestCount, setGuestCount] = useState<number>(50);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('12:30 PM');
  const [deliveryVenue, setDeliveryVenue] = useState('');
  const [menuPreferences, setMenuPreferences] = useState('Firewood Party Jollof & Fried Rice Combo + Grilled Chicken portions');
  const [estimatedBudget, setEstimatedBudget] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !eventDate) {
      alert('Please fill out your name, contact phone, and targeted event date.');
      return;
    }

    const newInquiry: CateringInquiry = {
      id: `CAT-LK-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId,
      vendorName,
      customerName: customerName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      eventType,
      guestCount,
      eventDate,
      eventTime,
      deliveryVenue: deliveryVenue.trim() || 'Lokoja Venue',
      menuPreferences,
      estimatedBudget: estimatedBudget ? parseInt(estimatedBudget, 10) : undefined,
      specialRequests: specialRequests.trim() || undefined,
      createdAt: 'Just now',
      status: 'New Inquiry'
    };

    // Save to localStorage
    try {
      const existingStr = localStorage.getItem('lokochop_catering_inquiries');
      const currentList: CateringInquiry[] = existingStr ? JSON.parse(existingStr) : INITIAL_CATERING_INQUIRIES;
      const updated = [newInquiry, ...currentList];
      localStorage.setItem('lokochop_catering_inquiries', JSON.stringify(updated));
    } catch {}

    if (onInquirySubmitted) {
      onInquirySubmitted(newInquiry);
    }

    setSubmittedInquiry(newInquiry);
  };

  const handleResetAndClose = () => {
    setSubmittedInquiry(null);
    onClose();
  };

  // Pre-filled WhatsApp message
  const generateWhatsAppLink = (inquiry: CateringInquiry) => {
    const rawNumber = vendorPhone.replace(/[^0-9]/g, '');
    const cleanNumber = rawNumber.startsWith('0') ? `234${rawNumber.slice(1)}` : rawNumber;
    const text = encodeURIComponent(
      `Hello ${vendorName}, I just submitted a Bulk Catering Inquiry on LokoChop!\n\n` +
      `Reference: ${inquiry.id}\n` +
      `Name: ${inquiry.customerName}\n` +
      `Event: ${inquiry.eventType}\n` +
      `Packs/Guests: ${inquiry.guestCount} guests\n` +
      `Date: ${inquiry.eventDate} at ${inquiry.eventTime}\n` +
      `Venue: ${inquiry.deliveryVenue}\n` +
      `Menu Preference: ${inquiry.menuPreferences}\n` +
      `Budget: ₦${inquiry.estimatedBudget ? inquiry.estimatedBudget.toLocaleString() : 'Negotiable'}\n\n` +
      `Looking forward to receiving your menu quote & confirmation.`
    );
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 animate-fade-in text-on-surface max-h-[92vh] overflow-y-auto custom-scroll">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline text-lg md:text-xl font-bold text-on-surface">
                Bulk Order &amp; Catering Inquiry
              </h3>
              <p className="text-xs text-on-surface-variant">
                Request large quantities or custom party packages from <strong>{vendorName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Screen after Submission */}
        {submittedInquiry ? (
          <div className="space-y-5 py-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                Inquiry Logged: #{submittedInquiry.id}
              </span>
              <h4 className="font-headline text-2xl font-bold text-on-surface">
                Catering Request Sent to Kitchen!
              </h4>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                {submittedInquiry.customerName}, your request for <strong>{submittedInquiry.guestCount} portions</strong> on <strong>{submittedInquiry.eventDate}</strong> has been transmitted directly to {vendorName}&apos;s executive chef.
              </p>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between pb-1 border-b border-outline-variant/15">
                <span className="text-on-surface-variant">Event Type</span>
                <span className="font-bold text-on-surface">{submittedInquiry.eventType}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-outline-variant/15">
                <span className="text-on-surface-variant">Venue in Lokoja</span>
                <span className="font-bold text-on-surface">{submittedInquiry.deliveryVenue}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-outline-variant/15">
                <span className="text-on-surface-variant">Menu Package</span>
                <span className="font-bold text-primary truncate max-w-[200px]">{submittedInquiry.menuPreferences}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Target Budget</span>
                <span className="font-bold text-emerald-700">
                  ₦{submittedInquiry.estimatedBudget ? submittedInquiry.estimatedBudget.toLocaleString() : 'Negotiable'}
                </span>
              </div>
            </div>

            {/* Instant WhatsApp Action */}
            <div className="space-y-2 pt-2">
              <a
                href={generateWhatsAppLink(submittedInquiry)}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Instant WhatsApp Chat with Kitchen Manager</span>
              </a>
              <p className="text-[11px] text-on-surface-variant">
                Direct mobile line: {vendorPhone} &bull; Response time typically under 15 minutes.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-4 px-6 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Done &amp; Return to Storefront
            </button>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Event Highlights & Benefits */}
            <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/20 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-on-surface">Confluence Event Catering Guarantee</h4>
                <p className="text-[11px] text-on-surface-variant">
                  Insulated thermal chafing transport &bull; Custom portion packaging &bull; On-time delivery guarantee across Lokoja.
                </p>
              </div>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Event Type */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface flex items-center gap-1">
                  <span>Occasion / Event Type *</span>
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-primary"
                >
                  <option value="Corporate Workshop / Zone 8 Secretariat">Corporate Workshop (Zone 8 / Ministries)</option>
                  <option value="Wedding Reception">Wedding Reception / Engagement</option>
                  <option value="Matriculation / Convocation">Matriculation / Convocation (Poly / FUL / CUK)</option>
                  <option value="Birthday Party / Celebration">Birthday Party / Anniversary</option>
                  <option value="Family / Chieftaincy Feast">Family Gathering / Chieftaincy Feast</option>
                  <option value="Church / Mosque Special Service">Religious Gathering / Thanksgiving</option>
                  <option value="Executive Board Meeting">Executive Board Lunch (GRA / Hotels)</option>
                </select>
              </div>

              {/* Guest Count */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface flex items-center justify-between">
                  <span>Portions / Expected Guests *</span>
                  <span className="text-primary font-extrabold">{guestCount} Packs</span>
                </label>
                <div className="flex items-center gap-2">
                  {[25, 50, 100, 250, 500].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setGuestCount(cnt)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        guestCount === cnt 
                          ? 'bg-primary text-white shadow-xs' 
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Date */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Target Event Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-primary"
                />
              </div>

              {/* Event Time */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Desired Delivery Time *</span>
                </label>
                <select
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs focus:outline-primary font-medium"
                >
                  <option value="11:30 AM">11:30 AM (Early Lunch)</option>
                  <option value="12:30 PM">12:30 PM (Midday Peak)</option>
                  <option value="1:30 PM">1:30 PM (Afternoon Lunch)</option>
                  <option value="3:00 PM">3:00 PM (Afternoon Refreshment)</option>
                  <option value="5:30 PM">5:30 PM (Evening Banquet)</option>
                  <option value="7:00 PM">7:00 PM (Dinner Reception)</option>
                </select>
              </div>

            </div>

            {/* Delivery Venue in Lokoja */}
            <div className="space-y-1">
              <label className="font-bold text-on-surface flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-secondary" />
                <span>Delivery Venue in Lokoja *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Reverton Hotel GRA, Kogi State Poly Hall, Confluence Beach, Zone 8"
                value={deliveryVenue}
                onChange={(e) => setDeliveryVenue(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs focus:outline-primary"
              />
              <div className="flex flex-wrap gap-1 pt-1 text-[10px] text-on-surface-variant">
                <span className="font-semibold text-outline">Quick Picks:</span>
                {['Reverton Hotel, GRA', 'State Secretariat, Zone 8', 'Kogi Poly Main Campus', 'Ganaja Event Center'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDeliveryVenue(v)}
                    className="hover:text-primary underline cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Package Choice */}
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Menu Preferences &amp; Cuisine Selection *</label>
              <select
                value={menuPreferences}
                onChange={(e) => setMenuPreferences(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-primary"
              >
                <option value="Firewood Party Jollof & Fried Rice Combo + Grilled Chicken portions">
                  Smoky Firewood Jollof &amp; Fried Rice + Quarter Chicken &amp; Dodo Packs
                </option>
                <option value="Traditional Swallow Feast: Pounded Yam + Catfish Fisherman Soup + Goat Meat">
                  Traditional Swallow: Pounded Yam with River Catfish &amp; Assorted Bushmeat
                </option>
                <option value="Confluence Point & Kill BBQ Catfish Stations + Roasted Boli">
                  Live BBQ Grill Station: Confluence Catfish with Pepper Sauce &amp; Boli
                </option>
                <option value="Pastries, Gourmet Shawarma & Small Chops Platter Packages">
                  Confectionery Pack: Meat Pies, Gourmet Shawarma, Puff Puff, Spring Rolls
                </option>
                <option value="Executive Breakfast Pack: Tea/Coffee, Waffles, Sausages & Eggs">
                  Executive Breakfast Pack: Tea/Coffee, Waffles, Sausages &amp; Fried Plantain
                </option>
                <option value="Custom Mixed Menu (Will discuss details)">
                  Custom Bespoke Menu (Provide details below)
                </option>
              </select>
            </div>

            {/* Contact Person Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Contact Person Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barrister Yakubu Ibrahim"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs focus:outline-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Mobile Telephone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0803 551 2390"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs focus:outline-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">WhatsApp Number (for instant quote)</label>
                <input
                  type="tel"
                  placeholder="e.g. 0803 551 2390"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs focus:outline-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Estimated Budget (₦ Naira)</label>
                <input
                  type="number"
                  placeholder="e.g. 250000"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2 text-xs focus:outline-primary"
                />
              </div>

            </div>

            {/* Special Instructions */}
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Special Requests &amp; Dietary Instructions</label>
              <textarea
                rows={2}
                placeholder="e.g. Chafing dishes required, no pepper for 10 packs, packaging in luxury foil containers..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 text-xs focus:outline-primary"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-3">
              <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Direct inquiry to {vendorName} kitchen</span>
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
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Catering Inquiry</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
