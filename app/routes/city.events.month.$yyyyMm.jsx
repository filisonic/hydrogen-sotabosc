import { useLoaderData, Link } from 'react-router';
import { EventCard } from '~/components/directory/EventCard';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { directoryRoutes } from '~/lib/directory/routes';
import { eventsInMonth, listEventMonths, monthLabel, parseMonthParam } from '~/lib/directory/eventMonths';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';
import { JsonLd } from '~/components/seo/JsonLd';
import { buildBreadcrumbListJsonLd } from '~/lib/seo/jsonLd';

export const meta = ({ data }) => {
  if (!data?.yyyyMm) return [{ title: 'Month not found — Sotabosc City' }];
  const label = monthLabel(data.yyyyMm);
  return [
    { title: `${label} in Barcelona — Sotabosc City` },
    {
      name: 'description',
      content: `Upcoming gatherings in Barcelona in ${label}: music, workshops, exhibitions and rooms you can step into in the city.`,
    },
    ...canonicalLinkMeta(data.origin, directoryRoutes.eventsMonth(data.yyyyMm)),
    ...openGraphImageMeta(data.origin),
  ];
};

export async function loader({ params, request, context }) {
  const yyyyMm = params.yyyyMm;
  if (!parseMonthParam(yyyyMm)) throw new Response('Not found', { status: 404 });
  const { getCityDirectory } = await import('~/lib/directory/source.server');
  const { getActiveEvents } = await getCityDirectory(context);
  const upcoming = getActiveEvents();
  const events = eventsInMonth(upcoming, yyyyMm);
  const months = listEventMonths(upcoming);
  return {
    yyyyMm,
    label: monthLabel(yyyyMm),
    events,
    months,
    origin: new URL(request.url).origin,
  };
}

export default function EventsMonth() {
  const { yyyyMm, label, events, months, origin } = useLoaderData();
  const pageUrl = `${origin}${directoryRoutes.eventsMonth(yyyyMm)}`;
  const breadcrumbLd = buildBreadcrumbListJsonLd([
    { name: 'Home', url: `${origin}/` },
    { name: 'Barcelona', url: `${origin}${directoryRoutes.city()}` },
    { name: 'Events', url: `${origin}${directoryRoutes.events()}` },
    { name: label, url: pageUrl },
  ]);

  return (
    <DirectorySurface>
      <JsonLd data={breadcrumbLd} />
      <section className="pt-12 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to={directoryRoutes.events()}
            className="text-xs mb-4 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← All upcoming events
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 font-[family-name:var(--font-display)]">
            {label} in Barcelona
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--sotabosc-muted)' }}>
            {events.length
              ? `${events.length} gathering${events.length === 1 ? '' : 's'} listed this month. Step into the room in the city; tickets stay on the venue site.`
              : 'Nothing listed for this month yet — the queue keeps filling from venue pages.'}
          </p>
          <nav className="flex flex-wrap gap-2 mb-2" aria-label="Months">
            {months.map((key) => (
              <Link
                key={key}
                to={directoryRoutes.eventsMonth(key)}
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: key === yyyyMm ? 'var(--sotabosc-text)' : 'var(--sotabosc-surface-muted)',
                  color: key === yyyyMm ? 'var(--sotabosc-bg)' : 'var(--sotabosc-muted)',
                }}
              >
                {monthLabel(key)}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {events.length === 0 ? (
            <div className="text-center py-16">
              <Link to={directoryRoutes.events()} className="text-sm underline" style={{ color: 'var(--sotabosc-accent-soft)' }}>
                See everything coming up
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
          <ContributionActions compact />
        </div>
      </section>
    </DirectorySurface>
  );
}
