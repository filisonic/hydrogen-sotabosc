import { useLoaderData, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { EventCard } from '~/components/directory/EventCard';
import { ReviewList } from '~/components/directory/ReviewList';
import { ReviewForm } from '~/components/directory/ReviewForm';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { getDomain, getListingCategory } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';
import { trackListingView } from '~/lib/analytics';
import { useOrganismStore } from '~/lib/store/useOrganismStore';

export const meta = ({ data }) => {
  if (!data?.place) return [{ title: 'Place Not Found — Sotabosc City' }];
  return [
    { title: `${data.place.name} — Sotabosc City` },
    { name: 'description', content: data.place.summary },
  ];
};

export async function loader({ params }) {
  const { getPlaceBySlug, getEventsForPlace, getReviewsForPlace } =
    await import('~/lib/directory/seed.server');
  const place = getPlaceBySlug(params.slug);
  if (!place) throw new Response('Place not found', { status: 404 });
  const events = getEventsForPlace(place.id);
  const reviews = getReviewsForPlace(place.id);
  return { place, events, reviews };
}


export default function PlaceDetail() {
  const { place, events, reviews: seedReviews } = useLoaderData();
  const domain = getDomain(place.primaryDomain);
  const { recordActivity } = useOrganismStore();
  const [localReviews, setLocalReviews] = useState([]);

  useEffect(() => {
    trackListingView(place.slug, place.primaryDomain, place.categories[0]);
    recordActivity('listing_view', place.id);
    // Load any locally-submitted reviews
    try {
      const stored = JSON.parse(localStorage.getItem(`sotabosc-reviews-${place.id}`) || '[]');
      setLocalReviews(stored);
    } catch {}
  }, [place.id]);

  const allReviews = [...localReviews, ...seedReviews];

  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      {/* Header */}
      <section className="pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to={directoryRoutes.city()}
            className="text-xs text-black/40 hover:text-black/60 transition-colors mb-4 inline-block"
          >
            ← Back to directory
          </Link>

          {place.imageUrl ? (
            <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-6 bg-black/5">
              <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="aspect-[21/9] rounded-2xl mb-6 flex items-center justify-center text-6xl"
              style={{ backgroundColor: `${domain.color}15` }}
            >
              {domain.emoji}
            </div>
          )}

          {/* Domain + categories */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
            >
              {domain.emoji} {domain.label}
            </span>
            {place.categories.map((cat) => {
              const catMeta = getListingCategory(cat);
              return (
                <Link
                  key={cat}
                  to={directoryRoutes.category(cat)}
                  className="text-xs text-black/40 bg-black/5 hover:bg-black/10 px-3 py-1 rounded-full transition-colors"
                >
                  {catMeta?.label || cat}
                </Link>
              );
            })}
            {place.isClaimed && (
              <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                Claimed
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{place.name}</h1>
          <p className="text-base text-black/60 mb-4 max-w-2xl">{place.summary}</p>

          {/* Details grid */}
          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
            <div className="bg-white rounded-xl p-4 border border-black/5">
              <p className="text-black/30 text-xs font-bold uppercase mb-1">Address</p>
              <p>{place.address}</p>
              <p className="text-black/40">{place.neighborhood}, {place.city}</p>
            </div>
            {place.website && (
              <div className="bg-white rounded-xl p-4 border border-black/5">
                <p className="text-black/30 text-xs font-bold uppercase mb-1">Website</p>
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-black/80 transition-colors break-all"
                >
                  {place.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </div>

          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {place.tags.map((tag) => (
                <span key={tag} className="text-xs bg-black/5 text-black/50 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events at this place */}
      {events.length > 0 && (
        <section className="px-4 pb-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Upcoming events here</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="px-4 pb-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Community reviews</h2>
          <ReviewList reviews={allReviews} />
          <div className="mt-6">
            <ReviewForm
              placeId={place.id}
              placeName={place.name}
              onReviewSubmitted={(r) => setLocalReviews((prev) => [r, ...prev])}
            />
          </div>
        </div>
      </section>

      {/* Contribution */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <ContributionActions compact />
        </div>
      </section>
    </div>
  );
}
