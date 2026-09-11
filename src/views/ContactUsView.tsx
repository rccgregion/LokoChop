import React, { useState } from 'react';
import { ActiveView } from '../types';
import { AppLogo } from '../components/AppLogo';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  HelpCircle, 
  Building2, 
  ShieldCheck,
  Bike
} from 'lucide-react';

interface ContactUsViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const ContactUsView: React.FC<ContactUsViewProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Order Support',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const WHATSAPP_PHONE = '2349074072454';
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    `Hello LokoChop Team! My name is ${formData.name || 'a customer'}. I have an inquiry regarding: ${formData.category}.`
  )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fade-in">
      
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <button
          onClick={() => onNavigate('marketplace')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <span className="text-xs text-on-surface-variant font-medium">
          Lokoja Customer Care &amp; Support HQ
        </span>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-surface-container-lowest via-surface-container/70 to-primary/10 p-6 sm:p-8 md:p-10 shadow-xs">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <AppLogo size="xs" />
            <span>We&apos;re Right Here in Lokoja</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-black text-on-surface tracking-tight">
            How Can We Serve You Today?
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
            Have a question about a live food delivery, want to partner your kitchen, or planning a group catering order? Our dedicated Lokoja operations team is available daily.
          </p>
        </div>
      </div>

      {/* Grid: Contact Info Cards + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Direct Contact Channels (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* WhatsApp Direct Help Card */}
          <div className="p-5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 space-y-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Instant WhatsApp Chat</h3>
                <p className="text-xs text-on-surface-variant">Average reply time: &lt; 2 minutes</p>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Connect directly with our Confluence dispatch coordinators for live order updates, kitchen inquiries, or instant address changes.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chat on WhatsApp (+234 907 407 2454)</span>
            </a>
          </div>

          {/* Contact Details List */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>LokoChop Operations Office</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-on-surface block">Physical Address</span>
                  <span className="text-on-surface-variant leading-relaxed block">
                    Confluence Hub, Suite 4, Along Ganaja Junction / Paparanda Corridor, Lokoja, Kogi State, Nigeria.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-on-surface block">Dispatch &amp; Support Helplines</span>
                  <a href="tel:+2349074072454" className="text-primary hover:underline font-semibold block">
                    +234 (0) 907 407 2454
                  </a>
                  <a href="tel:+2348031234567" className="text-on-surface-variant hover:underline block">
                    +234 (0) 803 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-on-surface block">Email Support</span>
                  <a href="mailto:support@lokochop.ng" className="text-primary hover:underline block">
                    support@lokochop.ng
                  </a>
                  <a href="mailto:partners@lokochop.ng" className="text-on-surface-variant hover:underline block">
                    partners@lokochop.ng (Kitchen Onboarding)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-on-surface block">Service Hours</span>
                  <span className="text-on-surface-variant block">
                    Monday &ndash; Sunday: 7:30 AM &ndash; 10:30 PM
                  </span>
                  <span className="text-[11px] text-on-surface-variant/80 block mt-0.5">
                    (Active during all kitchen service &amp; Confluence rider dispatch shifts)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold text-on-surface">Looking for answers?</span>
            </div>
            <button
              onClick={() => onNavigate('faqs-legal')}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Browse FAQs &rarr;
            </button>
          </div>

        </div>

        {/* Right Column: Interactive Message Form (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-5">
            
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">Send a Message</h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Fill out this quick form and our Lokoja support desk will respond via phone call or WhatsApp promptly.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-on-surface">Message Received!</h3>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. Our Lokoja customer support team has received your message regarding <em>{formData.category}</em> and will follow up with you shortly at <strong>{formData.phone}</strong>.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', phone: '', email: '', category: 'Order Support', message: '' });
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('marketplace')}
                    className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Explore Restaurants
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="text-xs font-bold text-on-surface block">
                      Your Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Halimat Sani"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-primary font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-phone" className="text-xs font-bold text-on-surface block">
                      Phone Number <span className="text-error">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="0803 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-primary font-medium"
                    />
                  </div>
                </div>

                {/* Email & Inquiry Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="text-xs font-bold text-on-surface block">
                      Email Address (Optional)
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-primary font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-category" className="text-xs font-bold text-on-surface block">
                      Inquiry Category
                    </label>
                    <select
                      id="contact-category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-primary font-medium cursor-pointer"
                    >
                      <option value="Order Support">Order Tracking &amp; Delivery Support</option>
                      <option value="Kitchen Partnership">Kitchen / Restaurant Partnership</option>
                      <option value="Rider Dispatch">Rider Onboarding &amp; Logistics</option>
                      <option value="Catering">Event &amp; Crowd Catering Request</option>
                      <option value="Feedback">Feedback &amp; App Suggestion</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="text-xs font-bold text-on-surface block">
                    Your Message <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us what you need or how we can assist you with your Lokoja food order..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-primary font-medium leading-relaxed resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Sending to Lokoja Support Desk...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message to Support Desk</span>
                    </>
                  )}
                </button>

              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
