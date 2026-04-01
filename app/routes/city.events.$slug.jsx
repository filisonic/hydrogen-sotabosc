import { useLoaderData, Link } from 'react-router';
import { useEffect } from 'react';
import { ContributionActions } from '~/components/directory/ContributionActions';
import { getDomain } from '~/lib/directory/domains';
import { directoryRoutes } from '~/lib/directory/routes';
import { trackEventView } from '~/lib/analytics';
import { useOrganismStore } from '~/lib/store/useOrganismStore';

export const meta = ({ data }) => {
  if (!data?.event) return [{ title: 'Event Not Found — Sotabosc City' }];
  return [
    { title: `${data.event.title} — Sotabosc City` },
    { name: 'description', content: data.event.summary },
  ];
};

export async function loader({ params }) {
  const { getEventBySlug, getPlaceById } = await import('~/lib/directory/seed.server');
  const event = getEventBySlug(params.slug);
  if (!event) throw new Response('Event not found', { status: 404 });
  const place = getPlaceById(event.placeId);
  return { event, place: place || null };
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
  const { event, place } = useLoaderData();
  const domain = getDomain(event.primaryDomain);
  const { recordActivity } = useOrganismStore();

  useEffect(() => {
    trackEventView(event.slug, event.primaryDomain);
    recordActivity('event_view', event.id);
  }, [event.id]);

  return (
    <div className="min-h-screen bg-[var(--color-primary)]">
      <section className="pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to={directoryRoutes.events()}
            className="text-xs text-black/40 hover:text-black/60 transition-colors mb-4 inline-block"
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
            {domain.emoji} {domain.label}
          </span>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{event.title}</h1>
          <p className="text-base text-black/60 mb-6 max-w-2xl">{event.summary}</p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
            <div className="bg-white rounded-xl p-4 border border-black/5">
              <p className="text-black/30 text-xs font-bold uppercase mb-1">When</p>
              <p className="font-medium">{formatFullDate(event.startsAt)}</p>
              <p className="text-black/50">
                {formatTime(event.startsAt)}
                {event.endsAt && ` — ${formatFullDate(event.endsAt)} ${formatTime(event.endsAt)}`}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-black/5">
              <p className="text-black/30 text-xs font-bold uppercase mb-1">Where</p>
              {place ? (
                <Link
                  to={directoryRoutes.place(place.slug)}
                  className="font-medium underline hover:text-black/80 transition-colors"
                >
                  {place.name}
                </Link>
              ) : (
                <p className="font-medium">{event.placeName || 'TBA'}</p>
              )}
              {place && (
                <p className="text-black/40">{place.neighborhood}, {place.city}</p>
              )}
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {event.tags.map((tag) => (
                <span key={tag} className="text-xs bg-black/5 text-black/50 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
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
    </div>
  );
}
