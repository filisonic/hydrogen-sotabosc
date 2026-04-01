function Stars({ rating }) {
  return (
    <span className="text-amber-500 text-sm tracking-wide" aria-label={`${rating} out of 5`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

/**
 * ReviewList — renders a list of community reviews for a place.
 */
export function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-sm text-black/40 italic">No reviews yet. Be the first.</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <article key={r.id} className="bg-white rounded-xl border border-black/5 p-5">
          <header className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">{r.authorName}</span>
            <Stars rating={r.rating} />
          </header>
          <p className="text-sm text-black/60 leading-relaxed">{r.body}</p>
          <footer className="text-xs text-black/25 mt-2">
            {new Date(r.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </footer>
        </article>
      ))}
    </div>
  );
}
