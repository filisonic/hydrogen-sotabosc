import { useLoaderData, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { EventCard } from '~/components/directory/EventCard';
import { ReviewList } from '~/components/directory/ReviewList';
import { ReviewForm } from '~/components/directory/ReviewForm';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { getDomain, getListingCategory, LISTING_CATEGORIES } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';
import { JsonLd } from '~/components/seo/JsonLd';
import { buildBreadcrumbListJsonLd, buildPlaceLocalBusinessJsonLd, getPrimaryListingCategory } from '~/lib/seo/jsonLd';
import { trackListingView } from '~/lib/analytics';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';

export const meta = ({ data }) => {
  if (!data?.place) return [{ title: 'Place Not Found — Sotabosc City' }];
  const path = directoryRoutes.place(data.place.slug);
  return [
    { title: `${data.place.name} — Barcelona | Sotabosc City` },
    { name: 'description', content: data.place.summary },
    ...canonicalLinkMeta(data?.origin, path),
    ...openGraphImageMeta(data?.origin),
  ];
};

export async function loader({ params, request }) {
  const { getPlaceBySlug, getEventsForPlace, getReviewsForPlace } =
    await import('~/lib/directory/seed.server');
  const place = getPlaceBySlug(params.slug);
  if (!place) throw new Response('Place not found', { status: 404 });
  const events = getEventsForPlace(place.id);
  const reviews = getReviewsForPlace(place.id);
  return { place, events, reviews, origin: new URL(request.url).origin };
}

export default function PlaceDetail() {
  const { place, events, reviews: seedReviews, origin } = useLoaderData();
  const placePageUrl = `${origin}${directoryRoutes.place(place.slug)}`;
  const placeLd = buildPlaceLocalBusinessJsonLd(place, placePageUrl);
  const primaryCat = getPrimaryListingCategory(place.categories);
  const breadcrumbItems = [
    { name: 'Home', url: `${origin}/` },
    { name: 'Barcelona', url: `${origin}${directoryRoutes.city()}` },
  ];
  if (primaryCat) {
    breadcrumbItems.push({
      name: LISTING_CATEGORIES[primaryCat].label,
      url: `${origin}${directoryRoutes.category(primaryCat)}`,
    });
  }
  breadcrumbItems.push({ name: place.name, url: placePageUrl });
  const breadcrumbLd = buildBreadcrumbListJsonLd(breadcrumbItems);
  const domain = getDomain(place.primaryDomain);
  const { recordActivity } = useOrganismStore();
  const [localReviews, setLocalReviews] = useState([]);

  useEffect(() => {
    trackListingView(place.slug, place.primaryDomain, place.categories[0]);
    recordActivity('listing_view', place.id);
    try {
      const stored = JSON.parse(localStorage.getItem(`sotabosc-reviews-${place.id}`) || '[]');
      setLocalReviews(stored);
    } catch {}
  }, [place.id]);

  const allReviews = [...localReviews, ...seedReviews];

  return (
    <DirectorySurface>
      <JsonLd data={placeLd} />
      <JsonLd data={breadcrumbLd} />
      <section className="pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to={directoryRoutes.city()}
            className="text-xs mb-4 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← Back to directory
          </Link>

          {place.imageUrl ? (
            <div
              className="aspect-[21/9] rounded-2xl overflow-hidden mb-6 relative"
              style={{ backgroundColor: 'var(--sotabosc-surface-muted)' }}
            >
              <div className="sotabosc-aurelia-photo absolute inset-0">
                <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <div
              className="aspect-[21/9] rounded-2xl mb-6 flex items-center justify-center text-6xl"
              style={{ backgroundColor: `${domain.color}15` }}
            >
              {domain.emoji}
            </div>
          )}

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
                  className="text-xs px-3 py-1 rounded-full transition-opacity hover:opacity-90 border"
                  style={{
                    color: 'var(--sotabosc-muted)',
                    backgroundColor: 'var(--sotabosc-surface-muted)',
                    borderColor: 'var(--sotabosc-border)',
                  }}
                >
                  {catMeta?.label || cat}
                </Link>
              );
            })}
            {place.isClaimed && (
              <span className="text-xs text-green-800 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                Claimed
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 font-[family-name:var(--font-display)]">
            {place.name}
          </h1>
          <p className="text-base mb-4 max-w-2xl" style={{ color: 'var(--sotabosc-muted)' }}>
            {place.summary}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
            <div
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: 'var(--sotabosc-surface)',
                borderColor: 'var(--sotabosc-border)',
              }}
            >
              <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--sotabosc-muted)', opacity: 0.8 }}>
                Address
              </p>
              <p>{place.address}</p>
              <p style={{ color: 'var(--sotabosc-muted)' }}>
                {place.neighborhood}, {place.city}
              </p>
            </div>
            {place.website && (
              <div
                className="rounded-xl p-4 border"
                style={{
                  backgroundColor: 'var(--sotabosc-surface)',
                  borderColor: 'var(--sotabosc-border)',
                }}
              >
                <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--sotabosc-muted)', opacity: 0.8 }}>
                  Website
                </p>
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-opacity hover:opacity-80 break-all"
                  style={{ color: 'var(--sotabosc-accent-soft)' }}
                >
                  {place.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </div>

          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: 'var(--sotabosc-surface-muted)',
                    color: 'var(--sotabosc-muted)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {events.length > 0 && (
        <section className="px-4 pb-10" style={{ backgroundColor: 'var(--sotabosc-surface-muted)' }}>
          <div className="max-w-4xl mx-auto pt-10">
            <h2 className="text-xl font-bold mb-4 font-[family-name:var(--font-display)]">Upcoming events here</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 pb-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 font-[family-name:var(--font-display)]">Community reviews</h2>
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

      {/* Embed Badge */}
      <section className="px-4 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--sotabosc-surface)', borderColor: 'var(--sotabosc-border)' }}>
            <h2 className="text-xl font-bold mb-2 font-[family-name:var(--font-display)]">Are you the owner?</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--sotabosc-muted)' }}>Embed this badge on your website to show you are part of Barcelona's Living Ecosystem and build your local authority.</p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
               <div className="flex-shrink-0 p-4 border rounded-xl" style={{ borderColor: 'var(--sotabosc-border)', background: 'var(--sotabosc-surface-muted)' }}>
                  {/* Visual preview of the badge */}
                  <a href={placePageUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--sotabosc-accent)', color: 'var(--sotabosc-surface)', borderRadius: '99px', textDecoration: 'none', fontFamily: 'system-ui, sans-serif', fontSize: '14px', fontWeight: 'bold' }}>
                    <span style={{ fontSize: '18px' }}>{domain.emoji}</span> Featured on Sotabosc
                  </a>
               </div>
               <div className="flex-grow w-full">
                  <textarea 
                    readOnly 
                    className="w-full text-xs font-mono p-3 rounded-xl border focus:outline-none"
                    style={{ backgroundColor: 'var(--sotabosc-surface-muted)', borderColor: 'var(--sotabosc-border)', color: 'var(--sotabosc-text)' }}
                    rows="3"
                    value={`<a href="${placePageUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:#1a1a1a;color:#fdfdfc;border-radius:99px;text-decoration:none;font-family:system-ui,sans-serif;font-size:14px;font-weight:bold;"><span style="font-size:18px;">${domain.emoji}</span> Featured on Sotabosc</a>`}
                  />
                  <button 
                    onClick={(e) => {
                      navigator.clipboard.writeText(e.target.previousElementSibling.value);
                      e.target.textContent = 'Copied!';
                      setTimeout(() => e.target.textContent = 'Copy Code', 2000);
                    }}
                    className="mt-2 text-xs font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--sotabosc-accent-soft)', color: 'var(--sotabosc-surface)' }}
                  >
                    Copy Code
                  </button>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <ContributionActions compact />
        </div>
      </section>
    </DirectorySurface>
  );
}
