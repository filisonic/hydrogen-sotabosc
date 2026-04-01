import { useLoaderData, Link } from 'react-router';
import { EventCard } from '~/components/directory/EventCard';
import { DomainPills } from '~/components/directory/CategoryPills';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { DOMAINS } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';

export const meta = () => [
  { title: 'Events — Sotabosc City' },
  { name: 'description', content: 'Upcoming events in Barcelona: music, workshops, exhibitions, retreats, and more.' },
];

export async function loader({ request }) {
  const { getUpcomingEvents, SEED_EVENTS, getEventsByDomain } =
    await import('~/lib/directory/seed.server');
  const url = new URL(request.url);
  const domain = url.searchParams.get('domain') || '';

  let events;
  if (domain) {
    events = getEventsByDomain(domain).sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  } else {
    events = getUpcomingEvents();
    if (events.length === 0) events = [...SEED_EVENTS];
  }

  return { events, domain };
}

export default function EventsFeed() {
  const { events, domain } = useLoaderData();

  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      <section className="pt-12 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to={directoryRoutes.city()}
            className="text-xs text-black/40 hover:text-black/60 transition-colors mb-4 inline-block"
          >
            ← Back to directory
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
            Events in Barcelona
          </h1>
          <p className="text-sm text-black/40 mb-6">
            {events.length} event{events.length !== 1 ? 's' : ''} coming up
          </p>
          <DomainPills activeDomain={domain} />
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {domain && (
            <p className="text-sm text-black/40 mb-4">
              Showing {DOMAINS[domain]?.emoji} {DOMAINS[domain]?.label} events
            </p>
          )}
          {events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-black/30">No events found.</p>
              <Link to={directoryRoutes.events()} className="text-sm underline text-black/50 mt-2 inline-block">
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
    </div>
  );
}
