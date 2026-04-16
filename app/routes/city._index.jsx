import { useLoaderData, Link } from 'react-router';
import { PlaceCard } from '~/components/directory/PlaceCard';
import { EventCard } from '~/components/directory/EventCard';
import { CategoryPills, DomainPills } from '~/components/directory/CategoryPills';
import { DirectorySearchBar } from '~/components/directory/DirectorySearchBar';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { HikeCard } from '~/components/directory/HikeCard';
import { PageSection } from '~/components/layout/PageSection';
import { SectionHeader } from '~/components/layout/SectionHeader';
import { DOMAINS, getDomain, directoryRoutes } from '~/lib/directory/domains';
import { JsonLd } from '~/components/seo/JsonLd';
import { buildBreadcrumbListJsonLd } from '~/lib/seo/jsonLd';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';
import { getNeighborhoodIndex } from '~/lib/directory/neighborhoods.server';

export const meta = ({ data }) => {
  const origin = data?.origin;
  const path = directoryRoutes.city();
  return [
    {
      title:
        'Barcelona creative directory — galleries, coworking, coffee & events | Sotabosc City',
    },
    {
      name: 'description',
      content:
        'Curated Barcelona listings: art galleries, coworking, live music, specialty coffee, workshops, food, and markets — with neighbourhoods, addresses, and solarpunk-flavoured discovery.',
    },
    ...canonicalLinkMeta(origin, path),
    ...openGraphImageMeta(origin),
  ];
};

export async function loader({ request }) {
  const { SEED_PLACES, SEED_CREATORS, searchPlaces, getPlacesByDomain, getUpcomingEvents } =
    await import('~/lib/directory/seed.server');
  const { getCatalunyaHikes } = await import('~/lib/hiking/hiking.server');
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const domain = url.searchParams.get('domain') || '';

  let places = SEED_PLACES;
  if (q) {
    places = searchPlaces(q);
  } else if (domain) {
    places = getPlacesByDomain(domain);
  }

  const upcomingEvents = getUpcomingEvents();

  return {
    origin: new URL(request.url).origin,
    places,
    upcomingEvents: upcomingEvents.slice(0, 6),
    featuredCreators: SEED_CREATORS.slice(0, 4),
    featuredHikes: getCatalunyaHikes().slice(0, 3),
    neighborhoodIndex: getNeighborhoodIndex(),
    q,
    domain,
  };
}

export default function CityIndex() {
  const { places, upcomingEvents, featuredCreators, featuredHikes, neighborhoodIndex, q, domain, origin } =
    useLoaderData();
  const cityUrl = `${origin}${directoryRoutes.city()}`;
  const breadcrumbLd = buildBreadcrumbListJsonLd([
    { name: 'Home', url: `${origin}/` },
    { name: 'Barcelona', url: cityUrl },
  ]);

  const showHikes = !q && !domain && featuredHikes?.length > 0;
  const showEvents = upcomingEvents.length > 0;
  const showNeighborhood = !q && !domain && neighborhoodIndex?.length > 0;
  const showGuides = !q && !domain;
  const showCreators = !q && !domain && featuredCreators.length > 0;

  const eventsVariant =
    showHikes && showEvents ? 'band-default' : showEvents ? 'band-muted' : null;

  let creatorsVariant = 'band-muted';
  if (showEvents && eventsVariant === 'band-muted') creatorsVariant = 'band-default';
  if (!showEvents && showHikes) creatorsVariant = 'band-default';

  const contributionVariant =
    showCreators && creatorsVariant === 'band-muted' ? 'band-default' : showCreators ? 'band-muted' : 'band-default';

  return (
    <DirectorySurface>
      <JsonLd data={breadcrumbLd} />
      <PageSection
        id="city-hero"
        variant="band-muted"
        density="hero"
        aria-labelledby="city-hero-heading"
        data-stitch-id="city-hero"
      >
        <SectionHeader
          titleAs="h1"
          titleId="city-hero-heading"
          kicker="Barcelona"
          title="Discover Barcelona"
          description="A living directory of coworking spaces, art galleries, music venues, workshops, specialty coffee, yoga, and more — mapped to the natural world."
        />
        <DirectorySearchBar defaultValue={q} />
      </PageSection>

      <PageSection
        variant="band-default"
        density="slim"
        aria-label="Browse by natural domain"
        data-stitch-id="city-domain-pills"
      >
        <DomainPills activeDomain={domain} />
      </PageSection>

      <PageSection
        variant="band-muted"
        density="slim"
        aria-label="Browse by category"
        data-stitch-id="city-category-pills"
      >
        <CategoryPills activeCategory={null} />
      </PageSection>

      {showNeighborhood && (
        <PageSection variant="band-default" aria-labelledby="city-neighborhoods-heading">
          <SectionHeader
            titleId="city-neighborhoods-heading"
            title="By neighbourhood"
            className="mb-4"
            actions={
              <p className="text-xs max-w-md sm:text-right" style={{ color: 'var(--sotabosc-muted)' }}>
                Each hub has at least three listings so the page stays useful — not an empty doorway URL.
              </p>
            }
          />
          <div className="flex flex-wrap gap-2">
            {neighborhoodIndex.map((n) => (
              <Link
                key={n.slug}
                to={directoryRoutes.neighborhood(n.slug)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-opacity hover:opacity-90"
                style={{
                  borderColor: 'var(--sotabosc-border)',
                  color: 'var(--sotabosc-text)',
                  backgroundColor: 'var(--sotabosc-surface)',
                }}
              >
                {n.label}
                <span className="opacity-60 font-normal"> · {n.placeCount}</span>
              </Link>
            ))}
          </div>
        </PageSection>
      )}

      {showGuides && (
        <PageSection variant="band-muted" data-stitch-id="city-guides-callout">
          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: 'var(--sotabosc-border)',
              backgroundColor: 'var(--sotabosc-surface)',
            }}
          >
            <SectionHeader
              titleId="city-guides-heading"
              title="Guides & routes"
              description="Walking clusters and day plans built from our listings."
              actions={
                <Link
                  to={directoryRoutes.guides()}
                  className="inline-flex text-xs font-bold px-5 py-2.5 rounded-full transition-opacity hover:opacity-90 whitespace-nowrap min-h-[44px] items-center"
                  style={{
                    backgroundColor: 'var(--sotabosc-accent)',
                    color: 'var(--sotabosc-surface)',
                  }}
                >
                  Open guides
                </Link>
              }
            />
          </div>
        </PageSection>
      )}

      <PageSection
        variant="band-default"
        aria-label={q || domain ? 'Search results' : 'Places'}
        data-stitch-id="city-places-grid"
      >
        {q && (
          <p className="text-sm mb-4" style={{ color: 'var(--sotabosc-muted)' }}>
            {places.length} result{places.length !== 1 ? 's' : ''} for &quot;{q}&quot;
          </p>
        )}
        {domain && (
          <p className="text-sm mb-4" style={{ color: 'var(--sotabosc-muted)' }}>
            Showing {DOMAINS[domain]?.emoji} {DOMAINS[domain]?.label} places
          </p>
        )}
        {places.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: 'var(--sotabosc-muted)', opacity: 0.85 }}>
              No places found.
            </p>
            <Link
              to={directoryRoutes.city()}
              className="text-sm underline mt-2 inline-block"
              style={{ color: 'var(--sotabosc-accent-soft)' }}
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} showMythology={true} />
            ))}
          </div>
        )}
      </PageSection>

      {showHikes && (
        <PageSection
          variant="band-muted"
          aria-labelledby="city-hikes-heading"
          data-stitch-id="city-hikes"
        >
          <SectionHeader
            titleId="city-hikes-heading"
            title="Catalunya hikes"
            description="From Collserola to the Pyrenees — curated ideas for trekking days (not live GPS tracks)."
            className="mb-6"
            actions={
              <Link
                to={directoryRoutes.hikes()}
                className="text-xs font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90 min-h-[44px] inline-flex items-center"
                style={{
                  backgroundColor: 'var(--sotabosc-accent)',
                  color: 'var(--sotabosc-surface)',
                }}
              >
                View all routes
              </Link>
            }
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredHikes.map((hike) => (
              <HikeCard key={hike.id} hike={hike} />
            ))}
          </div>
        </PageSection>
      )}

      {showEvents && (
        <PageSection
          variant={eventsVariant}
          aria-labelledby="city-events-heading"
          data-stitch-id="city-events"
        >
          <SectionHeader
            titleId="city-events-heading"
            title="Upcoming Events"
            className="mb-6"
            actions={
              <Link
                to={directoryRoutes.events()}
                className="text-xs font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90 min-h-[44px] inline-flex items-center"
                style={{
                  backgroundColor: 'var(--sotabosc-accent)',
                  color: 'var(--sotabosc-surface)',
                }}
              >
                View all events
              </Link>
            }
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </PageSection>
      )}

      {showCreators && (
        <PageSection
          variant={creatorsVariant}
          aria-labelledby="city-creators-heading"
          data-stitch-id="city-creators"
        >
          <SectionHeader
            titleId="city-creators-heading"
            title="Creators"
            className="mb-6"
            actions={
              <Link
                to="/city/creators"
                className="text-xs font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90 min-h-[44px] inline-flex items-center"
                style={{
                  backgroundColor: 'var(--sotabosc-accent)',
                  color: 'var(--sotabosc-surface)',
                }}
              >
                View all creators
              </Link>
            }
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredCreators.map((creator) => {
              const d = getDomain(creator.primaryDomain);
              return (
                <Link
                  key={creator.id}
                  to={`/city/creators/${creator.slug}`}
                  className="group block rounded-2xl border p-4 transition-all hover:shadow-[0_20px_40px_rgba(27,67,50,0.06)]"
                  style={{
                    backgroundColor: 'var(--sotabosc-surface)',
                    borderColor: 'var(--sotabosc-border)',
                    color: 'var(--sotabosc-text)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
                    style={{ backgroundColor: `${d.color}18` }}
                  >
                    {d.emoji}
                  </div>
                  <p className="font-bold text-sm group-hover:underline">{creator.displayName}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--sotabosc-muted)' }}>
                    {creator.bio}
                  </p>
                </Link>
              );
            })}
          </div>
        </PageSection>
      )}

      <PageSection variant={contributionVariant} aria-label="Contribute to the directory">
        <ContributionActions />
      </PageSection>

      <PageSection variant="band-default" className="!pt-0 pb-16" data-stitch-id="city-feedback-cta">
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl px-6 py-5"
          style={{ backgroundColor: 'var(--sotabosc-accent)', color: 'var(--sotabosc-surface)' }}
        >
          <p className="text-sm text-center sm:text-left opacity-90">
            Missing a place? Something wrong? Help us build this.
          </p>
          <Link
            to="/feedback"
            className="flex-shrink-0 inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-full transition-opacity hover:opacity-90 min-h-[44px]"
            style={{
              backgroundColor: 'var(--sotabosc-surface)',
              color: 'var(--sotabosc-accent)',
            }}
          >
            Share feedback
          </Link>
        </div>
      </PageSection>
    </DirectorySurface>
  );
}
