import { useMemo } from 'react';
import { Link } from 'react-router';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { PlaceCard } from '~/components/directory/PlaceCard';
import { EventCard } from '~/components/directory/EventCard';
import { getDomain, LISTING_CATEGORIES } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';
import { itemMatchesUserDomain } from '~/lib/theme/domainTheme';

/**
 * Long-scroll explore sections: filtered by the user's chosen domain when set.
 */
export function HomeExploreFeed({ directory }) {
  const userDomain = useOrganismStore((s) => s.organism?.domain) ?? null;

  const { places, events, creators } = directory;

  const filteredPlaces = useMemo(
    () =>
      places.filter((p) =>
        itemMatchesUserDomain(p.primaryDomain, p.secondaryDomains, userDomain),
      ),
    [places, userDomain],
  );

  const filteredEvents = useMemo(
    () =>
      events.filter((e) =>
        itemMatchesUserDomain(e.primaryDomain, e.secondaryDomains, userDomain),
      ),
    [events, userDomain],
  );

  const filteredCreators = useMemo(
    () =>
      creators.filter((c) =>
        itemMatchesUserDomain(c.primaryDomain, c.secondaryDomains, userDomain),
      ),
    [creators, userDomain],
  );

  const showPersonalized = Boolean(userDomain);
  const themeLabel = userDomain ? getDomain(userDomain).label : null;

  return (
    <div className="home-explore-feed relative z-[100]">
      {!showPersonalized && (
        <section
          className="py-6 px-4 border-b"
          style={{ borderColor: 'var(--sotabosc-border)', backgroundColor: 'var(--sotabosc-surface-muted)' }}
        >
          <p className="max-w-3xl mx-auto text-center text-sm" style={{ color: 'var(--sotabosc-muted)' }}>
            Pick a domain above — places, events, and creators on this page reshuffle to match your ecosystem.
          </p>
        </section>
      )}

      {showPersonalized && (
        <section
          className="py-4 px-4 border-b text-center text-sm font-semibold"
          style={{
            borderColor: 'var(--sotabosc-border)',
            backgroundColor: 'var(--sotabosc-surface-muted)',
            color: 'var(--sotabosc-accent)',
          }}
        >
          Showing {themeLabel} resonance — {filteredPlaces.length} places, {filteredEvents.length} events,{' '}
          {filteredCreators.length} creators
        </section>
      )}

      <section className="py-14 px-4" style={{ backgroundColor: 'var(--sotabosc-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--sotabosc-text)' }}>
                Places
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--sotabosc-muted)' }}>
                Coworking, galleries, coffee, yoga — scroll and wander.
              </p>
            </div>
            <Link
              to={directoryRoutes.city()}
              className="text-xs font-bold px-4 py-2 rounded-full text-white"
              style={{ backgroundColor: 'var(--sotabosc-accent)' }}
            >
              Full directory →
            </Link>
          </header>
          {filteredPlaces.length === 0 ? (
            <p className="text-sm opacity-50 py-8">No places in this domain yet. Try another resonance or browse all.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlaces.slice(0, 9).map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-14 px-4 border-y" style={{ borderColor: 'var(--sotabosc-border)', backgroundColor: 'var(--sotabosc-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--sotabosc-text)' }}>
                Upcoming
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--sotabosc-muted)' }}>
                Workshops, shows, markets — timed to the season.
              </p>
            </div>
            <Link
              to={directoryRoutes.events()}
              className="text-xs font-bold px-4 py-2 rounded-full border"
              style={{ borderColor: 'var(--sotabosc-border)', color: 'var(--sotabosc-text)' }}
            >
              All events →
            </Link>
          </header>
          {filteredEvents.length === 0 ? (
            <p className="text-sm opacity-50 py-6">No upcoming events for this domain this week.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredEvents.slice(0, 8).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-14 px-4" style={{ backgroundColor: 'var(--sotabosc-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--sotabosc-text)' }}>
                Creators
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--sotabosc-muted)' }}>
                Artists aligned with your domain — shop supports the forest.
              </p>
            </div>
            <Link
              to="/city/creators"
              className="text-xs font-bold px-4 py-2 rounded-full text-white"
              style={{ backgroundColor: 'var(--sotabosc-accent-soft)' }}
            >
              All creators →
            </Link>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCreators.slice(0, 8).map((creator) => {
              const d = getDomain(creator.primaryDomain);
              return (
                <Link
                  key={creator.id}
                  to={`/city/creators/${creator.slug}`}
                  className="group block rounded-2xl border p-4 transition-shadow hover:shadow-lg"
                  style={{
                    borderColor: 'var(--sotabosc-border)',
                    backgroundColor: 'var(--sotabosc-bg)',
                  }}
                >
                  <span className="text-2xl">{d.emoji}</span>
                  <p className="font-bold text-sm mt-2 group-hover:underline" style={{ color: 'var(--sotabosc-text)' }}>
                    {creator.displayName}
                  </p>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--sotabosc-muted)' }}>
                    {creator.bio}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-t" style={{ borderColor: 'var(--sotabosc-border)', backgroundColor: 'var(--sotabosc-surface-muted)' }}>
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-60">Browse by category</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(LISTING_CATEGORIES).map(([key, meta]) => (
              <Link
                key={key}
                to={directoryRoutes.category(key)}
                className="text-xs font-semibold px-3 py-2 rounded-full border hover:opacity-90 transition-opacity"
                style={{
                  borderColor: 'var(--sotabosc-border)',
                  color: 'var(--sotabosc-text)',
                  backgroundColor: 'var(--sotabosc-surface)',
                }}
              >
                {meta.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
