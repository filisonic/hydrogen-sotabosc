import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { KINGDOMS_BY_KEY } from '~/lib/city/kingdoms';
import { PASSPORT_RULES, kingdomProgress, nextStep, placeVisits } from '~/lib/city/passport/rules';
import { usePassportStore } from '~/lib/city/passport/usePassportStore';
import { gatheringPresence } from '~/lib/city/presence';
import { cityLightMode } from '~/lib/city/symbiosis';
import { pulseLabel } from '~/lib/directory/eventWhen';
import { directoryRoutes } from '~/lib/directory/routes';

const AVATAR_KEY = 'sotabosc:city:avatar-hue';
const CHANNEL = 'sotabosc-room';

/** What the one kingdom-specific thing in each room says when it is used. */
const SPECIAL = {
  earth: { text: 'One coffee, carried with you. It is only pixels; the real counter is a short walk away.' },
  plants: { text: 'The piece catches the light. Work shown in the city is for sale in the store.', to: '/collections', label: 'The store' },
  fungi: { text: 'The rack lights up. Something is being built in here.' },
  animals: { text: 'The lights come up and the speakers kick in. The real stage has its own nights.', to: '/city/events', label: 'What’s on' },
  algae: { text: 'You sit by the water for a moment. Nothing else to do here.' },
};

/**
 * Inside a citizen's building: a small walkable room, people passing through, things to use.
 *
 * The room itself is a LittleJS game in an iframe (`/city/room-frame`, script in
 * `lib/city/room/room-game.js`); this component is the frame around it. The game
 * reports what the visitor is next to and what they used, and everything that has
 * consequences (links, the passport) happens out here.
 *
 * The other figures are scenery. Nobody else's avatar is shown yet: that needs a
 * realtime channel (docs/city-roadmap.md, Phase 4).
 *
 * @param {{ citizen: any; events?: any[]; onLeave: () => void }} props
 */
export function CityRoom({ citizen, events = [], onLeave }) {
  const kingdom = KINGDOMS_BY_KEY[citizen.kingdom];
  const [hue, setHue] = useState(42);
  const [things, setThings] = useState([]);
  const [near, setNear] = useState(null);
  const [note, setNote] = useState(null);
  const frameRef = useRef(null);
  const closeRef = useRef(null);
  const hueRef = useRef(hue);
  const visits = usePassportStore((s) => s.visits);
  const recordVisit = usePassportStore((s) => s.recordVisit);
  const here = events.filter((e) => e.placeSlug === citizen.slug);
  const soon = here.filter((e) => e.pulse !== 'later');

  const send = (message) =>
    frameRef.current?.contentWindow?.postMessage({ source: CHANNEL, ...message }, window.location.origin);

  // Everything the game can ask for, kept in a ref so the message listener never goes stale.
  const act = (id) => {
    if (id === 'door') {
      onLeave();
    } else if (id === 'host') {
      setNote({ tag: citizen.name, text: citizen.summary, to: directoryRoutes.place(citizen.slug), label: 'Full listing' });
    } else if (id === 'screen') {
      setNote({
        tag: 'Its screen',
        text: 'This screen plays the business, its neighbours in the kingdom, city artists and whatever is live in the Arena.',
        to: '/screens',
        label: 'How the screens work',
      });
    } else if (id === 'board') {
      setNote(
        here.length
          ? {
              tag: 'On the board',
              text: here.slice(0, 3).map((e) => `${pulseLabel(e.pulse)} · ${e.title}`).join('  —  '),
              to: directoryRoutes.event(here[0].slug),
              label: 'Event listing',
            }
          : { tag: 'On the board', text: 'Nothing pinned up for the coming weeks.', to: '/city/events', label: 'All events' },
      );
    } else if (id === 'stamp') {
      recordVisit(citizen.slug, citizen.kingdom, 'room');
      const all = usePassportStore.getState().visits;
      const progress = kingdomProgress(all, citizen.kingdom);
      setNote({
        tag: 'Passport stamped',
        text: `Day ${Math.min(placeVisits(all, citizen.slug), PASSPORT_RULES.repeatVisits)} of ${PASSPORT_RULES.repeatVisits} here · ${Math.min(progress.places, PASSPORT_RULES.distinctPlaces)} of ${PASSPORT_RULES.distinctPlaces} places in ${kingdom.name}. ${nextStep(progress)}`,
      });
    } else if (id === 'special') {
      setNote({ tag: kingdom.name, ...SPECIAL[citizen.kingdom] });
    }
  };
  const actRef = useRef(act);
  actRef.current = act;

  useEffect(() => {
    let stored = 42;
    try {
      const saved = Number(window.localStorage.getItem(AVATAR_KEY));
      if (Number.isFinite(saved) && saved > 0) stored = saved;
    } catch {
      /* private mode: keep the default colour */
    }
    setHue(stored);
    hueRef.current = stored;
    closeRef.current?.focus();

    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.data?.source !== CHANNEL) return;
      if (e.source !== frameRef.current?.contentWindow) return;
      const { type, id } = e.data;
      if (type === 'ready') {
        const now = new Date();
        frameRef.current.contentWindow.postMessage(
          {
            source: CHANNEL,
            type: 'init',
            room: {
              name: citizen.name,
              kingdom: { key: kingdom.key, color: kingdom.color, name: kingdom.name, role: kingdom.role },
              hue: hueRef.current,
              passers: Math.max(3, Math.min(8, Math.round(gatheringPresence(citizen.slug, now) / 3))),
              light: cityLightMode(now),
              playing: soon.length ? pulseLabel(soon[0].pulse) : null,
            },
          },
          window.location.origin,
        );
      } else if (type === 'things') {
        setThings(e.data.things);
      } else if (type === 'near') {
        setNear(id);
      } else if (type === 'action') {
        actRef.current(id);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') onLeave();
    };
    window.addEventListener('message', onMessage);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('keydown', onKey);
    };
    // The room is set up once per building; `soon` only seeds the wall screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citizen.slug, onLeave]);

  const changeHue = (value) => {
    setHue(value);
    hueRef.current = value;
    send({ type: 'hue', hue: value });
    try {
      window.localStorage.setItem(AVATAR_KEY, String(value));
    } catch {
      /* ignore */
    }
  };

  const nearThing = things.find((t) => t.id === near);

  return (
    <div className="city-inside" role="dialog" aria-modal="true" aria-labelledby="city-inside-title" style={{ '--k': kingdom.color }}>
      <div className="city-inside__card">
        <button ref={closeRef} type="button" className="city-map__close" onClick={onLeave} aria-label="Back to the map">
          ×
        </button>
        <p className="city-panel__tag">
          Inside · {kingdom.emoji} {kingdom.name}
        </p>
        <h2 id="city-inside-title" className="city-inside__title">
          {citizen.name}
        </h2>

        <iframe
          ref={frameRef}
          src="/city/room-frame"
          title={`The room at ${citizen.name}: tap the floor to walk, tap a marker to use it`}
          className="city-inside__frame"
        />

        <div className="city-inside__note" aria-live="polite">
          {note ? (
            <>
              <strong>{note.tag}</strong>
              <span>{note.text}</span>
              {note.to ? <Link to={note.to}>{note.label} →</Link> : null}
            </>
          ) : (
            <span>
              {nearThing
                ? `You are at: ${nearThing.label}. Tap it, or press Enter in the room.`
                : 'Tap the floor to walk. The round markers are things you can use.'}
            </span>
          )}
        </div>

        {/* Every thing in the room is also a button, so nothing depends on steering the avatar. */}
        <div className="city-inside__things" role="group" aria-label="Things in the room">
          {things.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={t.id === near}
              onClick={() => {
                setNote(null);
                send({ type: 'goto', id: t.id });
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="city-inside__actions">
          <label className="city-gathering__hue">
            Your colour
            <input type="range" min="1" max="359" value={hue} onChange={(e) => changeHue(Number(e.target.value))} />
          </label>
          <span className="city-inside__small">
            {Math.min(placeVisits(visits, citizen.slug), PASSPORT_RULES.repeatVisits)}/{PASSPORT_RULES.repeatVisits} days here
          </span>
        </div>
        <p className="city-inside__small">
          The other figures are scenery, not a headcount. Other visitors’ avatars come with live presence.
        </p>
      </div>
    </div>
  );
}
