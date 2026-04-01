import { useLoaderData, Link } from 'react-router';
import { PlaceCard } from '~/components/directory/PlaceCard';
import { EventCard } from '~/components/directory/EventCard';
import { CategoryPills, DomainPills } from '~/components/directory/CategoryPills';
import { DirectorySearchBar } from '~/components/directory/DirectorySearchBar';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { DOMAINS, getDomain } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';

export const meta = () => [
  { title: 'Sotabosc City — Discover Barcelona' },
  { name: 'description', content: 'Explore coworking spaces, art galleries, music venues, specialty coffee, yoga studios, and more in Barcelona. A solarpunk city directory powered by nature.' },
];

export async function loader({ request }) {
  const { SEED_PLACES, SEED_CREATORS, searchPlaces, getPlacesByDomain, getUpcomingEvents } =
    await import('~/lib/directory/seed.server');
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
    places,
    upcomingEvents: upcomingEvents.slice(0, 6),
    featuredCreators: SEED_CREATORS.slice(0, 4),
    q,
    domain,
  };
}

export default function CityIndex() {
  const { places, upcomingEvents, featuredCreators, q, domain } = useLoaderData();

  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      {/* Hero */}
      <section className="pt-12 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            Discover Barcelona
          </h1>
          <p className="text-lg text-black/50 max-w-2xl mb-8">
            A living directory of coworking spaces, art galleries, music venues,
            workshops, specialty coffee, yoga, and more — mapped to the natural world.
          </p>
          <DirectorySearchBar defaultValue={q} />
        </div>
      </section>

      {/* Domain pills */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <DomainPills activeDomain={domain} />
        </div>
      </section>

      {/* Category pills */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <CategoryPills activeCategory={null} />
        </div>
      </section>

      {/* Search results or all places */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {q && (
            <p className="text-sm text-black/40 mb-4">
              {places.length} result{places.length !== 1 ? 's' : ''} for "{q}"
            </p>
          )}
          {domain && (
            <p className="text-sm text-black/40 mb-4">
              Showing {DOMAINS[domain]?.emoji} {DOMAINS[domain]?.label} places
            </p>
          )}
          {places.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-black/30">No places found.</p>
              <Link to={directoryRoutes.city()} className="text-sm underline text-black/50 mt-2 inline-block">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <section className="px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <Link
                to={directoryRoutes.events()}
                className="text-xs font-semibold px-4 py-2 bg-black text-white rounded-full hover:bg-black/80 transition-colors"
              >
                View all events
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Creators */}
      {!q && !domain && featuredCreators.length > 0 && (
        <section className="px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Creators</h2>
              <Link
                to="/city/creators"
                className="text-xs font-semibold px-4 py-2 bg-black text-white rounded-full hover:bg-black/80 transition-colors"
              >
                View all creators
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCreators.map((creator) => {
                const d = getDomain(creator.primaryDomain);
                return (
                  <Link
                    key={creator.id}
                    to={`/city/creators/${creator.slug}`}
                    className="group block bg-white rounded-2xl border border-black/5 hover:border-black/15 p-4 transition-all hover:shadow-md"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
                      style={{ backgroundColor: `${d.color}18` }}
                    >
                      {d.emoji}
                    </div>
                    <p className="font-bold text-sm group-hover:underline">{creator.displayName}</p>
                    <p className="text-xs text-black/40 mt-0.5 line-clamp-2">{creator.bio}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contribution CTAs */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <ContributionActions />
        </div>
      </section>

      {/* Feedback footer */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black rounded-2xl px-6 py-5">
            <p className="text-white/60 text-sm text-center sm:text-left">
              Missing a place? Something wrong? Help us build this.
            </p>
            <Link
              to="/feedback"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-black font-bold text-sm px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors"
            >
              Share feedback
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
