import { Link } from 'react-router';
import { ARENA_FORMATS } from '~/lib/city/arena';
import { ARENA, KINGDOMS, KINGDOMS_BY_KEY, PLAZA } from '~/lib/city/kingdoms';
import { PASSPORT_RULES, nextStep } from '~/lib/city/passport/rules';
import { gatheringPresence } from '~/lib/city/presence';
import { screenPartnersFor } from '~/lib/city/symbiosis';
import { pulseLabel } from '~/lib/directory/eventWhen';
import { directoryRoutes } from '~/lib/directory/routes';

/** The cards that open when something on the city map is selected. */

function formatWhen(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  }).format(new Date(iso));
}

export function PlazaPanel({ citizens, totalPlots, events, onSelect }) {
  const soon = (events ?? []).filter((e) => e.pulse !== 'later').slice(0, 4);
  return (
    <div className="city-panel">
      <span className="city-panel__tag">{PLAZA.name}</span>
      <h3 className="city-panel__title">Five kingdoms, one city.</h3>
      <p className="city-panel__body">
        Every building is a real Barcelona business; a yellow ring on the ground means something is
        on there this week. Tap a building to meet it, or step inside. Walk three places in a
        kingdom and its collectible surfaces on the map.
      </p>
      {soon.length ? (
        <div className="city-panel__partners">
          <span className="city-panel__label">On the map this week</span>
          <ul>
            {soon.map((event) => (
              <li key={event.slug}>
                <button type="button" onClick={() => onSelect({ type: 'event', slug: event.slug })}>
                  {event.title}
                </button>
                <span>{pulseLabel(event.pulse)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ul className="city-panel__kingdoms">
        {KINGDOMS.map((k) => (
          <li key={k.key} style={{ '--k': k.color }}>
            <strong>{k.role}</strong> {k.name}
            <span>→ feeds {KINGDOMS_BY_KEY[k.feeds].name}</span>
          </li>
        ))}
      </ul>
      <p className="city-panel__meta">
        {citizens.length} founding businesses shortlisted · {totalPlots - citizens.length} open plots
      </p>
    </div>
  );
}

export function CitizenPanel({ citizen, citizens, events, onSelect, onEnter, progress, days }) {
  const kingdom = KINGDOMS_BY_KEY[citizen.kingdom];
  const { neighbours, downstream } = screenPartnersFor(citizen, citizens);
  const here = (events ?? []).filter((e) => e.placeSlug === citizen.slug);
  return (
    <div className="city-panel" style={{ '--k': kingdom.color }}>
      <span className="city-panel__tag">
        {kingdom.emoji} {kingdom.name} · {kingdom.role}
      </span>
      {citizen.imageUrl ? (
        <img src={citizen.imageUrl} alt="" className="city-panel__img" loading="lazy" />
      ) : null}
      <h3 className="city-panel__title">{citizen.name}</h3>
      <p className="city-panel__where">{citizen.neighborhood}</p>
      <p className="city-panel__body">{citizen.summary}</p>
      {progress ? (
        <p className="city-panel__passport">
          <strong>Passport</strong> Day {Math.min(days, PASSPORT_RULES.repeatVisits)} of{' '}
          {PASSPORT_RULES.repeatVisits} here · {Math.min(progress.places, PASSPORT_RULES.distinctPlaces)} of{' '}
          {PASSPORT_RULES.distinctPlaces} places in {kingdom.name}. {nextStep(progress)}
        </p>
      ) : null}

      {here.length ? (
        <div className="city-panel__partners">
          <span className="city-panel__label">Happening here</span>
          <ul>
            {here.map((event) => (
              <li key={event.slug}>
                <button type="button" onClick={() => onSelect({ type: 'event', slug: event.slug })}>
                  {event.title}
                </button>
                <span>{pulseLabel(event.pulse)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="city-panel__partners">
        <span className="city-panel__label">Its screen lifts up</span>
        <ul>
          {neighbours.map((n) => (
            <li key={n.slug}>
              <button type="button" onClick={() => onSelect({ type: 'citizen', slug: n.slug })}>
                {n.name}
              </button>
              <span>neighbour</span>
            </li>
          ))}
          {downstream ? (
            <li>
              <button type="button" onClick={() => onSelect({ type: 'citizen', slug: downstream.slug })}>
                {downstream.name}
              </button>
              <span>{KINGDOMS_BY_KEY[downstream.kingdom].name}</span>
            </li>
          ) : null}
        </ul>
      </div>

      <div className="city-panel__actions">
        <button type="button" className="mag-btn" onClick={() => onEnter(citizen)}>
          Step inside
        </button>
        <Link to={directoryRoutes.place(citizen.slug)} className="mag-btn-o">
          Visit listing
        </Link>
        {citizen.isClaimed ? (
          <span className="city-panel__claimed">Citizen ✓</span>
        ) : (
          <Link
            to={`/city/claim?place=${encodeURIComponent(citizen.slug)}&kingdom=${citizen.kingdom}`}
            className="mag-btn-o"
          >
            Is this yours? Claim it
          </Link>
        )}
      </div>
    </div>
  );
}

export function VacantPanel({ kingdomKey, openCount }) {
  const kingdom = KINGDOMS_BY_KEY[kingdomKey];
  return (
    <div className="city-panel" style={{ '--k': kingdom.color }}>
      <span className="city-panel__tag">
        {kingdom.emoji} Open plot · {kingdom.name}
      </span>
      <h3 className="city-panel__title">This plot is waiting for its citizen.</h3>
      <p className="city-panel__body">
        {kingdom.name} is for businesses that <strong>{kingdom.role.toLowerCase()}</strong>: {kingdom.promise}{' '}
        Plots are limited on purpose — {openCount} left here.
      </p>
      <div className="city-panel__actions">
        <Link to={`/city/claim?kingdom=${kingdom.key}`} className="mag-btn">
          Apply for this plot
        </Link>
      </div>
    </div>
  );
}

export function EventPanel({ event, onSelect }) {
  const kingdom = KINGDOMS_BY_KEY[event.kingdom];
  const live = event.pulse === 'now';
  return (
    <div className="city-panel" style={{ '--k': kingdom.color }}>
      <span className="city-panel__tag">
        {pulseLabel(event.pulse)} · {kingdom.name}
      </span>
      <h3 className="city-panel__title">{event.title}</h3>
      <p className="city-panel__where">{formatWhen(event.startsAt)}</p>
      <p className="city-panel__body">
        {event.placeName ? `At ${event.placeName}. ` : ''}
        {live
          ? `About ${gatheringPresence(event.slug)} people already in the room as silhouettes. Tickets, if the night is paid, stay on the venue's own site.`
          : 'The virtual gathering only opens while this is actually on — until then, tickets stay on the venue site.'}
      </p>
      <div className="city-panel__actions">
        {live ? (
          <Link to={directoryRoutes.gathering(event.slug)} className="mag-btn">
            Enter gathering
          </Link>
        ) : null}
        {event.url ? (
          <a href={event.url} className="mag-btn-o" target="_blank" rel="noopener noreferrer">
            Venue page
          </a>
        ) : null}
        <Link to={directoryRoutes.event(event.slug)} className="mag-btn-o">
          Event listing
        </Link>
        {event.placeSlug ? (
          <button type="button" className="mag-btn-o" onClick={() => onSelect({ type: 'citizen', slug: event.placeSlug })}>
            The building
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function FindPanel({ find, specimen, already }) {
  const kingdom = find.kingdom ? KINGDOMS_BY_KEY[find.kingdom] : null;
  return (
    <div className="city-panel" style={{ '--k': kingdom?.color ?? '#ffe500' }}>
      <span className="city-panel__tag">{already ? 'Collected' : 'Find'} · artifacts</span>
      <h3 className="city-panel__title">{specimen?.name ?? 'Unknown specimen'}</h3>
      <p className="city-panel__body">
        {find.hint}{' '}
        {already
          ? 'Already in your artifacts.'
          : 'Picked up — it sits with the rest of your specimens.'}
      </p>
      <div className="city-panel__actions">
        <Link to="/collections/specimens" className="mag-btn">
          See collection
        </Link>
      </div>
    </div>
  );
}

export function StirringPanel({ kingdomKey, progress }) {
  const kingdom = KINGDOMS_BY_KEY[kingdomKey];
  return (
    <div className="city-panel" style={{ '--k': kingdom.color }}>
      <span className="city-panel__tag">Not yet · {kingdom.name}</span>
      <h3 className="city-panel__title">Something is stirring here.</h3>
      <p className="city-panel__body">
        {kingdom.name} keeps one collectible for the people who actually walk it. {nextStep(progress)}
      </p>
      <p className="city-panel__meta">
        {Math.min(progress.places, PASSPORT_RULES.distinctPlaces)} of {PASSPORT_RULES.distinctPlaces} places ·
        best streak {progress.favourite?.days ?? 0} of {PASSPORT_RULES.repeatVisits} days
      </p>
    </div>
  );
}

export function ArenaPanel() {
  const kingdom = KINGDOMS_BY_KEY[ARENA.kingdom];
  return (
    <div className="city-panel" style={{ '--k': kingdom.color }}>
      <span className="city-panel__tag">🏟️ Online events · on the water</span>
      <h3 className="city-panel__title">{ARENA.name}</h3>
      <p className="city-panel__body">
        The city&apos;s stadium for online events. Every kingdom hosts a recurring show here, and whatever is live
        in the Arena also plays on every citizen&apos;s screen across the city.
      </p>
      <ul className="city-panel__kingdoms">
        {ARENA_FORMATS.map((f) => (
          <li key={f.title} style={{ '--k': KINGDOMS_BY_KEY[f.kingdom].color }}>
            <strong>{f.rhythm}</strong> {f.title}
          </li>
        ))}
      </ul>
      <div className="city-panel__actions">
        <Link to="/how-it-works#city-arena" className="mag-btn">
          See the programme
        </Link>
      </div>
    </div>
  );
}
