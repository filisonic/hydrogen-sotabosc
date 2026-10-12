import { useLoaderData, Link, redirect } from 'react-router';
import { useEffect } from 'react';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { DirectorySurface } from '~/components/directory/DirectorySurface';
import { getDomain } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';
import { trackEventView } from '~/lib/analytics';
import { useOrganismStore } from '~/lib/store/useOrganismStore';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';
import { JsonLd } from '~/components/seo/JsonLd';
import { buildBreadcrumbListJsonLd, buildEventJsonLd } from '~/lib/seo/jsonLd';
import { eventPulse } from '~/lib/directory/eventWhen';

const LEGACY_EVENT_SLUGS = {
  'offf-barcelona-2026': 'offf-barcelona-2027',
  'bcn-jazz-day-2026': 'bcn-jazz-day-2027',
  'zazenkai-may-retreat': 'zazenkai-october-retreat',
  'blueproject-spring-residency': 'blueproject-autumn-residency',
  'hangar-winter-open': 'hangar-autumn-open',
  'projectesd-opening-may': 'projectesd-opening-november',
};

export const meta = ({ data }) => {
  if (!data?.event) return [{ title: 'Event Not Found — Sotabosc City' }];
  const path = directoryRoutes.event(data.event.slug);
  const ended = data?.eventEnded === true;
  return [
    { title: `${data.event.title} — Sotabosc City` },
    { name: 'description', content: data.event.summary },
    ...(ended ? [{ name: 'robots', content: 'noindex, follow' }] : []),
    ...canonicalLinkMeta(data?.origin, path),
    ...openGraphImageMeta(data?.origin),
  ];
};

export async function loader({ params, request, context }) {
  const legacy = LEGACY_EVENT_SLUGS[params.slug];
  if (legacy) throw redirect(directoryRoutes.event(legacy), 301);
  const { getCityDirectory } = await import('~/lib/directory/source.server');
  const { getEventBySlug, getPlaceById } = await getCityDirectory(context);
  const event = getEventBySlug(params.slug);
  if (!event) throw new Response('Event not found', { status: 404 });
  const place = getPlaceById(event.placeId);
  const endMs = new Date(event.endsAt ?? event.startsAt).getTime();
  const eventEnded = endMs < Date.now();
  const liveNow = eventPulse(event) === 'now';
  return { event, place: place || null, origin: new URL(request.url).origin, eventEnded, liveNow };
}

function formatFullDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function EventDetail() {
  const { event, place, origin, eventEnded, liveNow } = useLoaderData();
  const eventPageUrl = `${origin}${directoryRoutes.event(event.slug)}`;
  const eventLd = buildEventJsonLd(event, eventPageUrl, place);
  const breadcrumbLd = buildBreadcrumbListJsonLd([
    { name: 'Home', url: `${origin}/` },
    { name: 'Barcelona', url: `${origin}${directoryRoutes.city()}` },
    { name: 'Events', url: `${origin}${directoryRoutes.events()}` },
    { name: event.title, url: eventPageUrl },
  ]);
  const domain = getDomain(event.primaryDomain);
  const { recordActivity } = useOrganismStore();

  useEffect(() => {
    trackEventView(event.slug, event.primaryDomain);
    recordActivity('event_view', event.id);
  }, [event.id]);

  const cardStyle = {
    backgroundColor: 'var(--sotabosc-surface)',
    borderColor: 'var(--sotabosc-border)',
  };

  return (
    <DirectorySurface>
      <JsonLd data={eventLd} />
      <JsonLd data={breadcrumbLd} />
      <section className="pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to={directoryRoutes.events()}
            className="text-xs mb-4 inline-block transition-opacity hover:opacity-80"
            style={{ color: 'var(--sotabosc-muted)' }}
          >
            ← Back to events
          </Link>

          <div
            className="aspect-[21/9] rounded-2xl mb-6 flex items-center justify-center text-6xl"
            style={{ backgroundColor: `${domain.color}15` }}
          >
            {domain.emoji}
          </div>

          <span
            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: `${domain.color}20`, color: domain.color }}
          >
            {domain.emoji}{' '}
            {domain.role ? `${domain.role} · ${domain.label}` : domain.label}
          </span>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 font-[family-name:var(--font-display)]">
            {event.title}
          </h1>
          <p className="text-base mb-6 max-w-2xl" style={{ color: 'var(--sotabosc-muted)' }}>
            {event.summary}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
            <div className="rounded-xl p-4 border" style={cardStyle}>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--sotabosc-muted)', opacity: 0.8 }}>
                When
              </p>
              <p className="font-medium">{formatFullDate(event.startsAt)}</p>
              <p style={{ color: 'var(--sotabosc-muted)' }}>
                {formatTime(event.startsAt)}
                {event.endsAt && ` — ${formatFullDate(event.endsAt)} ${formatTime(event.endsAt)}`}
              </p>
            </div>
            <div className="rounded-xl p-4 border" style={cardStyle}>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--sotabosc-muted)', opacity: 0.8 }}>
                Where
              </p>
              {place ? (
                <Link
                  to={directoryRoutes.place(place.slug)}
                  className="font-medium underline transition-opacity hover:opacity-80"
                  style={{ color: 'var(--sotabosc-accent-soft)' }}
                >
                  {place.name}
                </Link>
              ) : (
                <p className="font-medium">{event.placeName || 'TBA'}</p>
              )}
              {place && (
                <p style={{ color: 'var(--sotabosc-muted)' }}>
                  {place.neighborhood}, {place.city}
                </p>
              )}
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {event.tags.map((tag) => (
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

          {!eventEnded ? (
            <div className="rounded-2xl border p-6 mb-8 space-y-4" style={{ borderColor: 'var(--sotabosc-border)' }}>
              <h2 className="font-bold">In the city</h2>
              <p className="text-sm" style={{ color: 'var(--sotabosc-muted)' }}>
                {liveNow
                  ? 'This gathering is on right now. Tickets stay on the venue site — here you can step into the room as a silhouette. No chat yet.'
                  : 'The virtual room only opens while this gathering is actually happening. Until then, zoom the plot on the city map, or take a ticket on the venue site.'}
              </p>
              <div className="flex flex-wrap gap-3">
                {liveNow ? (
                  <Link to={directoryRoutes.gathering(event.slug)} className="mag-btn">
                    Enter gathering
                  </Link>
                ) : (
                  <Link to={`/?event=${encodeURIComponent(event.slug)}`} className="mag-btn-o">
                    See the plot on the map
                  </Link>
                )}
                {event.sourceUrl || place?.website ? (
                  <a
                    href={event.sourceUrl || place.website}
                    className="mag-btn-o"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {event.sourceUrl ? 'Tickets / event page' : 'Venue page'}
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm mb-8" style={{ color: 'var(--sotabosc-muted)' }}>
              This gathering has ended. See what&apos;s next on the{' '}
              <Link to={directoryRoutes.events()} className="underline">
                events board
              </Link>
              .
            </p>
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
