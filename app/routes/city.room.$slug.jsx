import { useLoaderData, Link, useNavigate } from 'react-router';
import { CityGathering } from '~/components/city/CityGathering';
import { virtualRoomFromEnv } from '~/lib/city/room';
import { directoryRoutes } from '~/lib/directory/routes';
import { eventPulse, isEventLive } from '~/lib/directory/eventWhen';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';
import { openGraphImageMeta } from '~/lib/seo/siteImagery';

export const meta = ({ data }) => {
  const title = data?.event
    ? `${data.event.title} — gathering room`
    : 'Gathering room — Sotabosc';
  return [
    { title },
    {
      name: 'description',
      content:
        'Step into a Sotabosc gathering as a silhouette. Tickets stay on the venue site. A WorkAdventure or Gather room can open from here when one is linked.',
    },
    { name: 'robots', content: 'noindex, nofollow' },
    ...canonicalLinkMeta(data?.origin, data?.event ? directoryRoutes.gathering(data.event.slug) : '/city/events'),
    ...openGraphImageMeta(data?.origin),
  ];
};

export async function loader({ params, request, context }) {
  const { getCityDirectory } = await import('~/lib/directory/source.server');
  const { getEventBySlug, getPlaceById } = await getCityDirectory(context);
  const event = getEventBySlug(params.slug);
  if (!event) throw new Response('Event not found', { status: 404 });
  const place = getPlaceById(event.placeId);
  const liveNow = isEventLive(event);
  return {
    event: {
      ...event,
      placeName: event.placeName || place?.name,
      url: event.sourceUrl || place?.website,
      pulse: eventPulse(event),
    },
    liveNow,
    virtualRoom: virtualRoomFromEnv(context.env),
    origin: new URL(request.url).origin,
  };
}

export default function CityRoomPage() {
  const { event, liveNow, virtualRoom } = useLoaderData();
  const navigate = useNavigate();
  const leave = () => navigate('/#city-map');

  if (!liveNow) {
    return (
      <div className="city-room city-room--wait">
        <p className="city-gathering__kicker">Room closed</p>
        <h1 className="city-gathering__title">{event.title}</h1>
        <p className="city-room__copy">
          The virtual room only opens while this gathering is actually on. Until then, zoom the plot
          on the city map, or take a ticket on the venue site. Gather.town and WorkAdventure maps
          belong here too — not on the homepage — so the city stays light.
        </p>
        <div className="city-gathering__actions">
          <Link to={`/?event=${encodeURIComponent(event.slug)}`} className="mag-btn">
            See the plot on the map
          </Link>
          <Link to={directoryRoutes.event(event.slug)} className="mag-btn-o">
            Event listing
          </Link>
          {event.sourceUrl ? (
            <a href={event.sourceUrl} className="mag-btn-o" target="_blank" rel="noopener noreferrer">
              Venue page
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="city-room">
      <CityGathering event={event} onLeave={leave} layout="page" />
      {virtualRoom ? (
        <section className="city-room__pixel">
          <p className="city-room__copy">
            {virtualRoom.kind === 'gather'
              ? 'A Gather.town campus is linked for this city. Gather usually blocks embedding, so it opens as its own room.'
              : 'A WorkAdventure map is linked for this city — the same pattern universities and remote offices use for a walkable pixel campus.'}
          </p>
          {virtualRoom.embed ? (
            <iframe
              className="city-room__frame"
              title="WorkAdventure room"
              src={virtualRoom.url}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
            />
          ) : (
            <a href={virtualRoom.url} className="mag-btn" target="_blank" rel="noopener noreferrer">
              Open the Gather room
            </a>
          )}
        </section>
      ) : (
        <p className="city-room__note">
          This is Sotabosc&apos;s own room: silhouettes and reactions, no chat. A WorkAdventure or
          Gather.town map can be linked here later — those tools load a second game client and
          WebRTC, so they stay off the homepage map.
        </p>
      )}
    </div>
  );
}
