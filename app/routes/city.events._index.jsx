import { useLoaderData, Link } from 'react-router';
import { EventCard } from '~/components/directory/EventCard';
import { DomainPills } from '~/components/directory/CategoryPills';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { DOMAINS } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';

export const meta = ({ data }) => [
  { title: 'Events — Sotabosc City' },
  {
    name: 'description',
    content: 'Upcoming events in Barcelona: music, workshops, exhibitions, retreats, and more.',
  },
  ...canonicalLinkMeta(data?.origin, directoryRoutes.events()),
  ...openGraphImageMeta(data?.origin),
];

export async function loader({ request }) {
  const { getActiveEvents, getEventsByDomain, isEventExpired } =
    await import('~/lib/directory/seed.server');
  const url = new URL(request.url);
  const domain = url.searchParams.get('domain') || '';

  let events;
  if (domain) {
    events = getEventsByDomain(domain)
      .filter((e) => !isEventExpired(e))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  } else {
    events = getActiveEvents();
  }

  return { events, domain, origin: new URL(request.url).origin };
}

export default function EventsFeed() {
  const { events, domain } = useLoaderData();

  return (
    <DirectorySurface>
      <section className="pt-12 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to={directoryRoutes.city()}
            className="text-xs mb-4 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← Back to directory
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 font-[family-name:var(--font-display)]">
            Events in Barcelona
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--sotabosc-muted)' }}>
            {events.length} event{events.length !== 1 ? 's' : ''} coming up
          </p>
          <DomainPills activeDomain={domain} />
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {domain && (
            <p className="text-sm mb-4" style={{ color: 'var(--sotabosc-muted)' }}>
              Showing {DOMAINS[domain]?.emoji} {DOMAINS[domain]?.label} events
            </p>
          )}
          {events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: 'var(--sotabosc-muted)', opacity: 0.85 }}>
                No events found.
              </p>
              <Link
                to={directoryRoutes.events()}
                className="text-sm underline mt-2 inline-block"
                style={{ color: 'var(--sotabosc-accent-soft)' }}
              >
                View all events
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <ContributionActions />
        </div>
      </section>
    </DirectorySurface>
  );
}
