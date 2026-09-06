import React, { useState, useEffect } from 'react';
import { CustomerReview } from '../types';
import { INITIAL_REVIEWS } from '../data/reviewsAndInquiries';
import { 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  MessageSquarePlus, 
  MapPin, 
  Filter, 
  X, 
  Send,
  Sparkles,
  ShieldCheck,
  Utensils
} from 'lucide-react';

interface CustomerReviewsProps {
  vendorId?: string;
  vendorName?: string;
  defaultFoodName?: string;
  compact?: boolean;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  vendorId,
  vendorName,
  defaultFoodName,
  compact = false
}) => {
  // Load reviews from localStorage or seed data
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem('lokochop_customer_reviews');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_REVIEWS;
  });

  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New review form states
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [dishInput, setDishInput] = useState(defaultFoodName || '');
  const [reviewTextInput, setReviewTextInput] = useState('');
  const [selectedVendorForReview, setSelectedVendorForReview] = useState(vendorName || "Mama Ngozi's Kitchen");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync to localStorage
  const saveReviews = (updated: CustomerReview[]) => {
    setReviews(updated);
    try {
      localStorage.setItem('lokochop_customer_reviews', JSON.stringify(updated));
    } catch {}
  };

  // Filter reviews by vendor if provided
  const relevantReviews = vendorId
    ? reviews.filter(r => r.vendorId === vendorId || (vendorName && r.vendorName.toLowerCase().includes(vendorName.toLowerCase())))
    : reviews;

  // Rating filter
  const displayedReviews = relevantReviews.filter(r => {
    if (filterRating === 'all') return true;
    return r.rating === filterRating;
  });

  // Calculate statistics
  const totalCount = relevantReviews.length;
  const avgRating = totalCount > 0 
    ? (relevantReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : '5.0';

  const ratingCounts = {
    5: relevantReviews.filter(r => r.rating === 5).length,
    4: relevantReviews.filter(r => r.rating === 4).length,
    3: relevantReviews.filter(r => r.rating === 3).length,
    2: relevantReviews.filter(r => r.rating === 2).length,
    1: relevantReviews.filter(r => r.rating === 1).length,
  };

  const handleHelpfulVote = (reviewId: string) => {
    if (helpfulVotes[reviewId]) return;
    setHelpfulVotes(prev => ({ ...prev, [reviewId]: true }));
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, likesCount: (r.likesCount || 0) + 1 };
      }
      return r;
    });
    saveReviews(updated);
    showToast('Thank you! Helpful vote recorded.');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerNameInput.trim() || !reviewTextInput.trim()) {
      showToast('Please fill in your name and review message.');
      return;
    }

    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      vendorId: vendorId || 'mama-ngozi',
      vendorName: vendorName || selectedVendorForReview,
      foodItemName: dishInput.trim() || undefined,
      customerName: customerNameInput.trim(),
      customerLocation: locationInput.trim() || 'Lokoja Diner',
      rating: ratingInput,
      reviewText: reviewTextInput.trim(),
      date: 'Just now',
      verifiedOrder: true,
      likesCount: 1
    };

    const updated = [newReview, ...reviews];
    saveReviews(updated);
    setIsWriteModalOpen(false);
    // Reset form
    setCustomerNameInput('');
    setLocationInput('');
    setDishInput('');
    setReviewTextInput('');
    setRatingInput(5);
    showToast('Review submitted successfully! Thank you for sharing your experience.');
  };

  const ratingLabels: Record<number, string> = {
    5: 'Exceptional (5/5) — Confluence Perfection!',
    4: 'Very Good (4/5) — Delicious & Fresh',
    3: 'Good (3/5) — Satisfactory Experience',
    2: 'Fair (2/5) — Room for Improvement',
    1: 'Poor (1/5) — Needs Urgent Attention'
  };

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-amber-500/50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Rating Breakdown Banner */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: Score & Stars */}
          <div className="flex items-center gap-5">
            <div className="text-center bg-surface-container-high/60 px-5 py-4 rounded-2xl border border-outline-variant/20">
              <div className="font-headline text-4xl md:text-5xl font-extrabold text-primary">
                {avgRating}
              </div>
              <div className="flex items-center justify-center gap-0.5 my-1 text-amber-500">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= Math.round(Number(avgRating)) ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} 
                  />
                ))}
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {totalCount} Verified Reviews
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-headline text-lg md:text-xl font-bold text-on-surface">
                {vendorName ? `${vendorName} Customer Ratings` : 'Confluence Diners & Community Feedback'}
              </h3>
              <p className="text-xs text-on-surface-variant max-w-md leading-relaxed">
                Authentic reviews from Lokoja residents across Paparanda, Lokongoma, Ganaja, Adankolo, and GRA.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-tertiary font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Genuine LokoChop Verified Order Deliveries</span>
              </div>
            </div>
          </div>

          {/* Right: Progress bars & CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            
            {/* Rating distribution bar */}
            <div className="w-full sm:w-48 space-y-1 text-xs">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
                const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                return (
                  <button
                    key={stars}
                    onClick={() => setFilterRating(filterRating === stars ? 'all' : stars)}
                    className="w-full flex items-center gap-2 group cursor-pointer text-[11px] text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="w-7 text-right font-bold">{stars} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-6 text-left text-[10px] text-outline font-semibold">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Write a Review Button */}
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:bg-primary/90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Leave a Review</span>
            </button>
          </div>

        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-on-surface-variant font-semibold text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterRating === 'all'
                ? 'bg-secondary text-white font-bold'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            All Reviews ({totalCount})
          </button>
          {[5, 4, 3].map(star => (
            <button
              key={star}
              onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                filterRating === star
                  ? 'bg-secondary text-white font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span>{star} Stars</span>
              <span className="text-[10px] opacity-80">({ratingCounts[star as keyof typeof ratingCounts] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedReviews.map(review => (
          <article 
            key={review.id}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 md:p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-outline-variant/60 transition-colors"
          >
            <div className="space-y-2.5">
              
              {/* Header with Avatar & Details */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-xs text-on-surface">{review.customerName}</h4>
                      {review.verifiedOrder && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-on-surface-variant flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-secondary" />
                      {review.customerLocation} &bull; {review.date}
                    </p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map(st => (
                    <Star 
                      key={st} 
                      className={`w-3.5 h-3.5 ${st <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Vendor & Dish Ordered Badge */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {!vendorId && (
                  <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                    {review.vendorName}
                  </span>
                )}
                {review.foodItemName && (
                  <span className="bg-surface-container text-on-surface-variant font-medium px-2 py-0.5 rounded flex items-center gap-1">
                    <Utensils className="w-2.5 h-2.5 text-primary" />
                    {review.foodItemName}
                  </span>
                )}
              </div>

              {/* Review Text */}
              <p className="text-xs text-on-surface leading-relaxed pt-1">
                &ldquo;{review.reviewText}&rdquo;
              </p>
            </div>

            {/* Footer with Helpful Action */}
            <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>Delivery by LokoChop Confluence Fleet</span>
              <button
                onClick={() => handleHelpfulVote(review.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  helpfulVotes[review.id] 
                    ? 'text-emerald-700 bg-emerald-50 font-bold' 
                    : 'hover:bg-surface-container text-on-surface-variant'
                }`}
                title="Mark this review as helpful"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>Helpful ({review.likesCount || 0})</span>
              </button>
            </div>

          </article>
        ))}
      </div>

      {displayedReviews.length === 0 && (
        <div className="py-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 space-y-3">
          <Utensils className="w-8 h-8 mx-auto text-outline" />
          <h4 className="font-bold text-sm text-on-surface">No reviews match this filter</h4>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Be the first to share your dining experience for {vendorName || 'this vendor'}.
          </p>
          <button
            onClick={() => setFilterRating('all')}
            className="px-3.5 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-xl cursor-pointer"
          >
            Show All Reviews
          </button>
        </div>
      )}

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-fade-in text-on-surface max-h-[90vh] overflow-y-auto custom-scroll">
            
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface">Leave a Confluence Review</h3>
                  <p className="text-xs text-on-surface-variant">Rate your meal and courier dispatch experience</p>
                </div>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              
              {/* Star Rating Picker */}
              <div className="space-y-1.5 text-center bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                <span className="font-bold text-on-surface text-xs block">
                  How was your food and delivery?
                </span>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRatingInput(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          star <= (hoverRating || ratingInput) 
                            ? 'fill-amber-500 text-amber-500' 
                            : 'text-stone-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-primary font-semibold text-xs block">
                  {ratingLabels[hoverRating || ratingInput]}
                </span>
              </div>

              {/* Vendor Selector (if not scoped) */}
              {!vendorId && (
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Restaurant / Buka</label>
                  <select
                    value={selectedVendorForReview}
                    onChange={(e) => setSelectedVendorForReview(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-primary"
                  >
                    <option value="Mama Ngozi's Kitchen">Mama Ngozi's Kitchen (Paparanda)</option>
                    <option value="Chicken Republic Lokoja">Chicken Republic Lokoja (Paparanda Square)</option>
                    <option value="CRAVING SPOT">CRAVING SPOT (Lokongoma Phase II)</option>
                    <option value="Confluence Grill Point">Confluence Grill Point (Riverview)</option>
                    <option value="Foodcastle Lokoja">Foodcastle Lokoja (Ganaja Junction)</option>
                    <option value="Misi T Restaurant (GRA)">Misi T Restaurant (GRA)</option>
                    <option value="Choice Buka">Choice Buka (Nataco High Road)</option>
                  </select>
                </div>
              )}

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Your Full Name or Nickname *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aliyu Mohammed"
                  value={customerNameInput}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs focus:outline-primary"
                />
              </div>

              {/* Location in Lokoja */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Your Lokoja Location / Neighborhood</label>
                <input
                  type="text"
                  placeholder="e.g. Lokongoma Phase 1, Paparanda, GRA, Ganaja"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs focus:outline-primary"
                />
              </div>

              {/* Dish Ordered */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Dish or Meal Ordered (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Smoky Firewood Jollof, Pounded Yam & Catfish, Shawarma"
                  value={dishInput}
                  onChange={(e) => setDishInput(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs focus:outline-primary"
                />
              </div>

              {/* Feedback Text */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Your Experience & Feedback *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about the flavor, freshness, portion size, and rider delivery speed..."
                  value={reviewTextInput}
                  onChange={(e) => setReviewTextInput(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-xs focus:outline-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-primary/90 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Review</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
