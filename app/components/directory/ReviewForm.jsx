import { useState } from 'react';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { trackReviewSubmit } from '~/lib/analytics';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Outstanding'];

/**
 * ReviewForm — client-side review submission form.
 * Stores reviews in localStorage (seed phase) and awards XP via organism store.
 */
export function ReviewForm({ placeId, placeName, onReviewSubmitted }) {
  const { organism, recordActivity } = useOrganismStore();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState(organism?.displayName || '');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) { setError('Please choose a star rating.'); return; }
    if (body.trim().length < 10) { setError('Review must be at least 10 characters.'); return; }
    if (!authorName.trim()) { setError('Please enter a name.'); return; }

    const review = {
      id: `local-${Date.now()}`,
      placeId,
      authorName: authorName.trim(),
      rating,
      body: body.trim(),
      createdAt: new Date().toISOString(),
      source: 'user',
    };

    // Persist locally
    try {
      const key = `sotabosc-reviews-${placeId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([review, ...existing]));
    } catch {}

    // Award XP and track
    recordActivity('review_create', placeId);
    trackReviewSubmit(placeId, rating);

    setSubmitted(true);
    onReviewSubmitted?.(review);
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <p className="text-green-800 font-semibold text-sm mb-1">Review submitted — thank you!</p>
        <p className="text-green-600 text-xs">+10 XP awarded to your artifact.</p>
      </div>
    );
  }

  const activeRating = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-black/5 p-5 space-y-4">
      <h3 className="font-bold text-sm">Leave a review for {placeName}</h3>

      {/* Star picker */}
      <div>
        <div className="flex gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`text-2xl leading-none transition-colors ${
                star <= activeRating ? 'text-amber-400' : 'text-black/15'
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${star} star`}
            >
              ★
            </button>
          ))}
        </div>
        {activeRating > 0 && (
          <p className="text-xs text-black/40">{STAR_LABELS[activeRating]}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-bold text-black/40 mb-1 uppercase tracking-wide">
          Your name
        </label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="e.g. Marta R."
          className="w-full text-sm border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
          maxLength={60}
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-bold text-black/40 mb-1 uppercase tracking-wide">
          Your review
        </label>
        <textarea
          value={body}
          onChange={(e) => { setBody(e.target.value); setError(''); }}
          placeholder="What made this place memorable?"
          rows={3}
          className="w-full text-sm border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
          maxLength={500}
        />
        <p className="text-right text-[10px] text-black/25 mt-0.5">{body.length}/500</p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        className="w-full bg-black text-white font-bold text-sm py-3 rounded-xl hover:bg-black/80 transition-colors"
      >
        Submit review · +10 XP
      </button>
    </form>
  );
}
